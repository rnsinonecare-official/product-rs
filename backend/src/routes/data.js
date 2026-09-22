/**
 * Client data API. Every endpoint is authenticated (mounted behind
 * authMiddleware) and derives userId from the verified token — the browser can
 * never read/write another user's data, and never touches the DB directly.
 * Backs the client dataService / dailyIntakeService / sessionService.
 */
const express = require("express");
const { asyncHandler } = require("../middleware/errorHandler");
const { db, FieldValue } = require("../config/aws");

const router = express.Router();
const today = () => new Date().toISOString().split("T")[0];
const num = (v) => (isNaN(parseFloat(v)) ? 0 : parseFloat(v));

// ---------------- Food diary ----------------
router.post(
  "/food-diary",
  asyncHandler(async (req, res) => {
    const entry = {
      ...req.body,
      userId: req.user.uid,
      date: req.body.date || today(),
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("foodDiary").add(entry);
    res.json({ id: ref.id, ...entry });
  })
);

router.get(
  "/food-diary",
  asyncHandler(async (req, res) => {
    const { date, startDate, endDate } = req.query;
    let q = db.collection("foodDiary").where("userId", "==", req.user.uid);
    if (date) q = q.where("date", "==", date);
    if (startDate) q = q.where("date", ">=", startDate);
    if (endDate) q = q.where("date", "<=", endDate);
    const snap = await q.orderBy("createdAt", "desc").get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

router.put(
  "/food-diary/:id",
  asyncHandler(async (req, res) => {
    await db
      .collection("foodDiary")
      .doc(req.params.id)
      .update({ ...req.body, updatedAt: new Date().toISOString() });
    res.json({ success: true });
  })
);

router.delete(
  "/food-diary/:id",
  asyncHandler(async (req, res) => {
    await db.collection("foodDiary").doc(req.params.id).delete();
    res.json({ success: true });
  })
);

router.post(
  "/food-diary/batch",
  asyncHandler(async (req, res) => {
    const entries = req.body.entries || [];
    const batch = db.batch();
    entries.forEach((e) => {
      const ref = db.collection("foodDiary").doc();
      batch.set(ref, {
        ...e,
        userId: req.user.uid,
        date: e.date || today(),
        createdAt: new Date().toISOString(),
      });
    });
    await batch.commit();
    res.json({ success: true, count: entries.length });
  })
);

// ---------------- Health metrics ----------------
router.post(
  "/health-metrics",
  asyncHandler(async (req, res) => {
    const metrics = {
      ...req.body,
      userId: req.user.uid,
      date: req.body.date || today(),
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("healthMetrics").add(metrics);
    res.json({ id: ref.id, ...metrics });
  })
);

router.get(
  "/health-metrics",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    let q = db.collection("healthMetrics").where("userId", "==", req.user.uid);
    if (startDate) q = q.where("date", ">=", startDate);
    if (endDate) q = q.where("date", "<=", endDate);
    const snap = await q.orderBy("date", "desc").get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

// ---------------- Daily health metrics (water/steps/sleep) ----------------
router.put(
  "/daily-health-metrics/:date",
  asyncHandler(async (req, res) => {
    const id = `${req.user.uid}_${req.params.date}`;
    const data = {
      ...req.body,
      userId: req.user.uid,
      date: req.params.date,
      updatedAt: new Date().toISOString(),
    };
    await db.collection("dailyHealthMetrics").doc(id).set(data, { merge: true });
    res.json({ id, ...data });
  })
);

router.get(
  "/daily-health-metrics/range",
  asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;
    let q = db
      .collection("dailyHealthMetrics")
      .where("userId", "==", req.user.uid);
    if (startDate) q = q.where("date", ">=", startDate);
    if (endDate) q = q.where("date", "<=", endDate);
    const snap = await q.orderBy("date", "desc").get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

router.get(
  "/daily-health-metrics/:date",
  asyncHandler(async (req, res) => {
    const id = `${req.user.uid}_${req.params.date}`;
    const doc = await db.collection("dailyHealthMetrics").doc(id).get();
    res.json(doc.exists ? doc.data() : null);
  })
);

// ---------------- Favorite recipes ----------------
router.post(
  "/favorite-recipes",
  asyncHandler(async (req, res) => {
    const recipe = {
      ...req.body,
      userId: req.user.uid,
      isFavorite: true,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("favoriteRecipes").add(recipe);
    res.json({ id: ref.id, ...recipe });
  })
);

router.get(
  "/favorite-recipes",
  asyncHandler(async (req, res) => {
    const snap = await db
      .collection("favoriteRecipes")
      .where("userId", "==", req.user.uid)
      .orderBy("createdAt", "desc")
      .get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

router.delete(
  "/favorite-recipes/:id",
  asyncHandler(async (req, res) => {
    await db.collection("favoriteRecipes").doc(req.params.id).delete();
    res.json({ success: true });
  })
);

// ---------------- User goals (dataService) ----------------
router.get(
  "/goals",
  asyncHandler(async (req, res) => {
    const doc = await db.collection("userGoals").doc(req.user.uid).get();
    res.json(doc.exists ? doc.data() : null);
  })
);

router.put(
  "/goals",
  asyncHandler(async (req, res) => {
    await db
      .collection("userGoals")
      .doc(req.user.uid)
      .set(
        { ...req.body, userId: req.user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    res.json({ success: true });
  })
);

// ---------------- Shared recipes ----------------
router.post(
  "/shared-recipes",
  asyncHandler(async (req, res) => {
    const recipe = {
      ...req.body,
      userId: req.user.uid,
      likes: 0,
      views: 0,
      isPublic: "true",
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("sharedRecipes").add(recipe);
    res.json({ id: ref.id, ...recipe });
  })
);

router.get(
  "/shared-recipes",
  asyncHandler(async (req, res) => {
    const limitCount = parseInt(req.query.limit, 10) || 20;
    const snap = await db
      .collection("sharedRecipes")
      .where("isPublic", "==", "true")
      .orderBy("createdAt", "desc")
      .limit(limitCount)
      .get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

// ---------------- Export ----------------
router.get(
  "/export",
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const [food, health, favs, goals] = await Promise.all([
      db.collection("foodDiary").where("userId", "==", uid).get(),
      db.collection("healthMetrics").where("userId", "==", uid).get(),
      db.collection("favoriteRecipes").where("userId", "==", uid).get(),
      db.collection("userGoals").doc(uid).get(),
    ]);
    res.json({
      foodDiary: food.docs.map((d) => d.data()),
      healthMetrics: health.docs.map((d) => d.data()),
      favoriteRecipes: favs.docs.map((d) => d.data()),
      goals: goals.exists ? goals.data() : null,
      exportDate: new Date().toISOString(),
    });
  })
);

// ---------------- Daily intake (dailyIntakeService) ----------------
async function ensureDailyIntake(uid, date) {
  const id = `${uid}_${date}`;
  const doc = await db.collection("daily_intake").doc(id).get();
  if (!doc.exists) {
    const fresh = {
      userId: uid,
      date,
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      water: 0,
      steps: 0,
      sleep: 0,
      mood: "neutral",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.collection("daily_intake").doc(id).set(fresh);
    return { id, ...fresh };
  }
  return doc.data();
}

router.get(
  "/daily-intake/today",
  asyncHandler(async (req, res) => {
    res.json(await ensureDailyIntake(req.user.uid, today()));
  })
);

router.get(
  "/daily-intake/weekly",
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split("T")[0];
      const doc = await db.collection("daily_intake").doc(`${uid}_${ds}`).get();
      out.push(
        doc.exists
          ? doc.data()
          : {
              date: ds,
              totalCalories: 0,
              totalProtein: 0,
              totalCarbs: 0,
              totalFat: 0,
              water: 0,
              steps: 0,
              sleep: 0,
            }
      );
    }
    res.json(out);
  })
);

router.get(
  "/daily-intake/food-entries",
  asyncHandler(async (req, res) => {
    const date = req.query.date || today();
    const snap = await db
      .collection("food_entries")
      .where("userId", "==", req.user.uid)
      .where("date", "==", date)
      .orderBy("createdAt", "desc")
      .get();
    res.json(snap.docs.map((d) => d.data()));
  })
);

router.post(
  "/daily-intake/food-entries",
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const date = today();
    const f = req.body;
    const entry = {
      userId: uid,
      date,
      name: f.name,
      calories: num(f.calories),
      protein: num(f.protein),
      carbs: num(f.carbs),
      fat: num(f.fat),
      fiber: num(f.fiber),
      serving_size: f.serving_size || "1 serving",
      analysis_type: f.analysis_type || "manual",
      health_score: num(f.health_score) || 5,
      recommendations: f.recommendations || "",
      image: f.image || null,
      metadata: f.metadata || {},
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("food_entries").add(entry);
    await ensureDailyIntake(uid, date);
    await db
      .collection("daily_intake")
      .doc(`${uid}_${date}`)
      .set(
        {
          totalCalories: FieldValue.increment(entry.calories),
          totalProtein: FieldValue.increment(entry.protein),
          totalCarbs: FieldValue.increment(entry.carbs),
          totalFat: FieldValue.increment(entry.fat),
          totalFiber: FieldValue.increment(entry.fiber),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    res.json({ id: ref.id, ...entry });
  })
);

router.delete(
  "/daily-intake/food-entries/:id",
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const doc = await db.collection("food_entries").doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: "Not found" });
    const e = doc.data();
    await db.collection("food_entries").doc(req.params.id).delete();
    await db
      .collection("daily_intake")
      .doc(`${uid}_${e.date}`)
      .set(
        {
          totalCalories: FieldValue.increment(-(e.calories || 0)),
          totalProtein: FieldValue.increment(-(e.protein || 0)),
          totalCarbs: FieldValue.increment(-(e.carbs || 0)),
          totalFat: FieldValue.increment(-(e.fat || 0)),
          totalFiber: FieldValue.increment(-(e.fiber || 0)),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    res.json({ success: true });
  })
);

router.get(
  "/daily-intake/:date",
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const doc = await db
      .collection("daily_intake")
      .doc(`${uid}_${req.params.date}`)
      .get();
    if (!doc.exists) return res.json(null);
    const snap = await db
      .collection("food_entries")
      .where("userId", "==", uid)
      .where("date", "==", req.params.date)
      .orderBy("createdAt", "desc")
      .get();
    res.json({ ...doc.data(), foodEntriesData: snap.docs.map((d) => d.data()) });
  })
);

const patchDailyIntake = (field, useIncrement) =>
  asyncHandler(async (req, res) => {
    const uid = req.user.uid;
    const date = today();
    await ensureDailyIntake(uid, date);
    const value = req.body[field];
    await db
      .collection("daily_intake")
      .doc(`${uid}_${date}`)
      .set(
        {
          [field]: useIncrement ? FieldValue.increment(num(value)) : value,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    res.json({ success: true });
  });

router.post("/daily-intake/water", patchDailyIntake("water", true));
router.put("/daily-intake/steps", patchDailyIntake("steps", false));
router.put("/daily-intake/sleep", patchDailyIntake("sleep", false));
router.put("/daily-intake/mood", patchDailyIntake("mood", false));
router.put("/daily-intake/calories", patchDailyIntake("totalCalories", false));

// Daily goals (dailyIntakeService — separate from /goals)
router.get(
  "/daily-goals",
  asyncHandler(async (req, res) => {
    const doc = await db
      .collection("userGoals")
      .doc(`${req.user.uid}_daily`)
      .get();
    res.json(
      doc.exists
        ? doc.data()
        : {
            calorieGoal: 2000,
            proteinGoal: 150,
            carbsGoal: 250,
            fatGoal: 65,
            waterGoal: 8,
            stepsGoal: 10000,
            sleepGoal: 8,
          }
    );
  })
);

router.put(
  "/daily-goals",
  asyncHandler(async (req, res) => {
    await db
      .collection("userGoals")
      .doc(`${req.user.uid}_daily`)
      .set(
        { ...req.body, userId: req.user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    res.json({ success: true });
  })
);

// ---------------- Sessions (sessionService analytics) ----------------
router.post(
  "/sessions",
  asyncHandler(async (req, res) => {
    const session = {
      ...req.body,
      userId: req.user.uid,
      startTime: req.body.startTime || new Date().toISOString(),
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const ref = await db.collection("userSessions").add(session);
    res.json({ id: ref.id });
  })
);

router.put(
  "/sessions/:id",
  asyncHandler(async (req, res) => {
    await db
      .collection("userSessions")
      .doc(req.params.id)
      .set(
        { ...req.body, userId: req.user.uid, updatedAt: new Date().toISOString() },
        { merge: true }
      );
    res.json({ success: true });
  })
);

module.exports = router;
