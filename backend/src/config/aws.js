/**
 * AWS backend clients + a thin Firestore-compatible adapter over DynamoDB.
 *
 * This replaces the old Firebase Admin setup. The `db` / `admin` exports mirror
 * the small slice of the Firestore API the codebase actually uses
 * (collection/doc/get/set/update/delete/add, where('==' | '>=' | '<='),
 * orderBy, limit, batch, and FieldValue.serverTimestamp/increment) so route
 * files keep working with minimal changes. Data lives in per-collection
 * DynamoDB tables named `${DDB_TABLE_PREFIX}<collection>`, each keyed by `id`.
 */
const {
  DynamoDBClient,
} = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");
const { S3Client } = require("@aws-sdk/client-s3");
const {
  CognitoIdentityProviderClient,
} = require("@aws-sdk/client-cognito-identity-provider");
const { BedrockRuntimeClient } = require("@aws-sdk/client-bedrock-runtime");
const { CognitoJwtVerifier } = require("aws-jwt-verify");
const { randomUUID } = require("crypto");

// ---- Clients ---------------------------------------------------------------
const region = process.env.AWS_REGION || "us-east-1";
const credentials =
  process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined; // fall back to the default AWS credential chain
const clientConfig = { region, ...(credentials ? { credentials } : {}) };

const ddbDoc = DynamoDBDocumentClient.from(new DynamoDBClient(clientConfig), {
  marshallOptions: { removeUndefinedValues: true },
});
const s3 = new S3Client(clientConfig);
const cognito = new CognitoIdentityProviderClient(clientConfig);
const bedrock = new BedrockRuntimeClient(clientConfig);

const S3_BUCKET = process.env.S3_BUCKET || "rainscare-media-uploads";
const TABLE_PREFIX = process.env.DDB_TABLE_PREFIX || "rainscare-";
const tableFor = (collection) => `${TABLE_PREFIX}${collection}`;

// Cognito ID-token verifier (used by auth middleware)
let jwtVerifier = null;
if (process.env.COGNITO_USER_POOL_ID && process.env.COGNITO_CLIENT_ID) {
  jwtVerifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "id",
    clientId: process.env.COGNITO_CLIENT_ID,
  });
}

// ---- GSI map (which collections support userId / public / recipe queries) --
const GSI = {
  foodDiary: { byUser: { name: "byUser", hash: "userId", range: "date" } },
  healthMetrics: { byUser: { name: "byUser", hash: "userId", range: "date" } },
  dailyHealthMetrics: {
    byUser: { name: "byUser", hash: "userId", range: "date" },
  },
  daily_intake: { byUser: { name: "byUser", hash: "userId", range: "date" } },
  food_entries: { byUser: { name: "byUser", hash: "userId", range: "date" } },
  favoriteRecipes: {
    byUser: { name: "byUser", hash: "userId", range: "createdAt" },
  },
  sharedRecipes: {
    byUser: { name: "byUser", hash: "userId", range: "createdAt" },
    byPublic: { name: "byPublic", hash: "isPublic", range: "createdAt" },
  },
  recipeLikes: {
    byUser: { name: "byUser", hash: "userId" },
    byRecipe: { name: "byRecipe", hash: "recipeId" },
  },
  userSessions: {
    byUser: { name: "byUser", hash: "userId", range: "startTime" },
  },
};

// ---- FieldValue sentinels --------------------------------------------------
const FieldValue = {
  serverTimestamp: () => ({ __fv: "serverTimestamp" }),
  increment: (n) => ({ __fv: "increment", n }),
  arrayUnion: (...v) => ({ __fv: "arrayUnion", v }),
  arrayRemove: (...v) => ({ __fv: "arrayRemove", v }),
};
const nowIso = () => new Date().toISOString();

// Resolve sentinels for a full-document write (set without merge).
function resolveForPut(data) {
  const out = {};
  for (const [k, v] of Object.entries(data || {})) {
    if (v && typeof v === "object" && v.__fv) {
      if (v.__fv === "serverTimestamp") out[k] = nowIso();
      else if (v.__fv === "increment") out[k] = v.n;
      else if (v.__fv === "arrayUnion") out[k] = v.v;
      else if (v.__fv === "arrayRemove") out[k] = [];
    } else {
      out[k] = v;
    }
  }
  return out;
}

// Build an UpdateExpression for set(merge:true) / update().
function buildUpdate(data) {
  const names = {};
  const values = {};
  const sets = [];
  const adds = [];
  let i = 0;
  for (const [k, v] of Object.entries(data || {})) {
    const nk = `#f${i}`;
    const vk = `:v${i}`;
    names[nk] = k;
    if (v && typeof v === "object" && v.__fv) {
      if (v.__fv === "serverTimestamp") {
        values[vk] = nowIso();
        sets.push(`${nk} = ${vk}`);
      } else if (v.__fv === "increment") {
        values[vk] = v.n;
        adds.push(`${nk} ${vk}`);
      } else if (v.__fv === "arrayUnion") {
        values[vk] = v.v;
        values[`:empty${i}`] = [];
        sets.push(
          `${nk} = list_append(if_not_exists(${nk}, :empty${i}), ${vk})`
        );
      } else if (v.__fv === "arrayRemove") {
        // best-effort: overwrite with provided value list removed is not
        // expressible atomically; skip (unused on backend)
        continue;
      }
    } else {
      values[vk] = v;
      sets.push(`${nk} = ${vk}`);
    }
    i++;
  }
  const clauses = [];
  if (sets.length) clauses.push("SET " + sets.join(", "));
  if (adds.length) clauses.push("ADD " + adds.join(", "));
  return {
    UpdateExpression: clauses.join(" "),
    ExpressionAttributeNames: names,
    ExpressionAttributeValues: values,
  };
}

// ---- Snapshot helpers ------------------------------------------------------
function makeSnap(collection, item) {
  const exists = !!item;
  return {
    id: item ? item.id : undefined,
    exists,
    data: () => (item ? item : undefined),
    get: (field) => (item ? item[field] : undefined),
    ref: makeDocRef(collection, item ? item.id : undefined),
  };
}

function makeDocRef(collection, id) {
  const table = tableFor(collection);
  return {
    id,
    async get() {
      const r = await ddbDoc.send(
        new GetCommand({ TableName: table, Key: { id } })
      );
      return makeSnap(collection, r.Item);
    },
    async set(data, opts) {
      if (opts && opts.merge) {
        const upd = buildUpdate(data);
        await ddbDoc.send(
          new UpdateCommand({ TableName: table, Key: { id }, ...upd })
        );
      } else {
        const item = { ...resolveForPut(data), id };
        await ddbDoc.send(new PutCommand({ TableName: table, Item: item }));
      }
      return { id };
    },
    async update(data) {
      const upd = buildUpdate(data);
      await ddbDoc.send(
        new UpdateCommand({ TableName: table, Key: { id }, ...upd })
      );
      return { id };
    },
    async delete() {
      await ddbDoc.send(
        new DeleteCommand({ TableName: table, Key: { id } })
      );
    },
  };
}

// ---- Query execution -------------------------------------------------------
async function runQuery(collection, wheres, order, limitN) {
  const table = tableFor(collection);

  // Fast path: equality on id -> single GetItem
  const idEq = wheres.find((w) => w.f === "id" && w.op === "==");
  if (idEq) {
    const snap = await makeDocRef(collection, idEq.value).get();
    const docs = snap.exists ? [snap] : [];
    return makeQuerySnap(docs);
  }

  const gsis = GSI[collection] || {};
  // Choose a GSI whose hash field has an equality clause
  let chosen = null;
  for (const cfg of Object.values(gsis)) {
    const hashEq = wheres.find((w) => w.f === cfg.hash && w.op === "==");
    if (hashEq) {
      chosen = { cfg, hashEq };
      break;
    }
  }

  let items = [];
  if (chosen) {
    const { cfg, hashEq } = chosen;
    const names = { "#h": cfg.hash };
    const values = { ":h": hashEq.value };
    let keyCond = "#h = :h";
    const consumed = new Set([hashEq]);

    // Range key conditions (>= / <= / ==) on the index range attribute
    if (cfg.range) {
      const rangeClauses = wheres.filter(
        (w) => w.f === cfg.range && w !== hashEq
      );
      const gte = rangeClauses.find((w) => w.op === ">=");
      const lte = rangeClauses.find((w) => w.op === "<=");
      const eq = rangeClauses.find((w) => w.op === "==");
      if (gte && lte) {
        names["#r"] = cfg.range;
        values[":r1"] = gte.value;
        values[":r2"] = lte.value;
        keyCond += " AND #r BETWEEN :r1 AND :r2";
        consumed.add(gte);
        consumed.add(lte);
      } else if (gte) {
        names["#r"] = cfg.range;
        values[":r1"] = gte.value;
        keyCond += " AND #r >= :r1";
        consumed.add(gte);
      } else if (lte) {
        names["#r"] = cfg.range;
        values[":r1"] = lte.value;
        keyCond += " AND #r <= :r1";
        consumed.add(lte);
      } else if (eq) {
        names["#r"] = cfg.range;
        values[":r1"] = eq.value;
        keyCond += " AND #r = :r1";
        consumed.add(eq);
      }
    }

    const remaining = wheres.filter((w) => !consumed.has(w));
    const filter = buildFilter(remaining, names, values, 100);

    let ExclusiveStartKey;
    do {
      const r = await ddbDoc.send(
        new QueryCommand({
          TableName: table,
          IndexName: cfg.name,
          KeyConditionExpression: keyCond,
          ...(filter ? { FilterExpression: filter } : {}),
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
          ExclusiveStartKey,
        })
      );
      items = items.concat(r.Items || []);
      ExclusiveStartKey = r.LastEvaluatedKey;
    } while (ExclusiveStartKey);
  } else {
    // Fallback: Scan with a filter for all where clauses
    const names = {};
    const values = {};
    const filter = buildFilter(wheres, names, values, 0);
    let ExclusiveStartKey;
    do {
      const r = await ddbDoc.send(
        new ScanCommand({
          TableName: table,
          ...(filter ? { FilterExpression: filter } : {}),
          ...(filter ? { ExpressionAttributeNames: names } : {}),
          ...(filter ? { ExpressionAttributeValues: values } : {}),
          ExclusiveStartKey,
        })
      );
      items = items.concat(r.Items || []);
      ExclusiveStartKey = r.LastEvaluatedKey;
    } while (ExclusiveStartKey);
  }

  // orderBy (in-memory) + limit
  if (order) {
    const { f, dir } = order;
    items.sort((a, b) => {
      const av = a[f];
      const bv = b[f];
      if (av === bv) return 0;
      const cmp = av < bv ? -1 : 1;
      return dir === "desc" ? -cmp : cmp;
    });
  }
  if (typeof limitN === "number") items = items.slice(0, limitN);

  return makeQuerySnap(items.map((it) => makeSnap(collection, it)));
}

function buildFilter(wheres, names, values, startIdx) {
  if (!wheres.length) return null;
  const parts = [];
  let i = startIdx;
  for (const w of wheres) {
    const nk = `#g${i}`;
    const vk = `:g${i}`;
    names[nk] = w.f;
    values[vk] = w.value;
    const opMap = { "==": "=", ">=": ">=", "<=": "<=", ">": ">", "<": "<" };
    parts.push(`${nk} ${opMap[w.op] || "="} ${vk}`);
    i++;
  }
  return parts.join(" AND ");
}

function makeQuerySnap(docs) {
  return {
    docs,
    empty: docs.length === 0,
    size: docs.length,
    forEach: (fn) => docs.forEach(fn),
  };
}

// ---- CollectionRef with chainable query ------------------------------------
function makeCollection(collection) {
  const query = (wheres, order, limitN) => ({
    where(f, op, value) {
      return query([...wheres, { f, op, value }], order, limitN);
    },
    orderBy(f, dir) {
      return query(wheres, { f, dir: dir || "asc" }, limitN);
    },
    limit(n) {
      return query(wheres, order, n);
    },
    get() {
      return runQuery(collection, wheres, order, limitN);
    },
  });

  const base = query([], null, undefined);
  return {
    doc: (id) => makeDocRef(collection, id || randomUUID()),
    async add(data) {
      const id = randomUUID();
      await makeDocRef(collection, id).set(data);
      return makeDocRef(collection, id);
    },
    where: base.where,
    orderBy: base.orderBy,
    limit: base.limit,
    get: base.get,
  };
}

// ---- Batch -----------------------------------------------------------------
function makeBatch() {
  const ops = [];
  return {
    set: (ref, data, opts) => ops.push(() => ref.set(data, opts)),
    update: (ref, data) => ops.push(() => ref.update(data)),
    delete: (ref) => ops.push(() => ref.delete()),
    commit: async () => {
      for (const run of ops) await run();
    },
  };
}

// ---- db + admin compatibility exports --------------------------------------
const db = {
  collection: makeCollection,
  batch: makeBatch,
  settings: () => {}, // no-op (was Firestore settings)
};

// `admin.firestore()` returns db; `admin.firestore.FieldValue.*` for sentinels
const firestoreFn = () => db;
firestoreFn.FieldValue = FieldValue;
const admin = { firestore: firestoreFn };

module.exports = {
  // raw AWS clients
  ddbDoc,
  s3,
  cognito,
  bedrock,
  // config
  region,
  S3_BUCKET,
  TABLE_PREFIX,
  tableFor,
  // auth
  jwtVerifier,
  // firestore-compat
  db,
  admin,
  FieldValue,
};
