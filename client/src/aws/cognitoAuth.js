/**
 * Cognito auth module — presents a small Firebase-Auth-compatible surface so the
 * rest of the app (api.js interceptor, UserContext) keeps working. Uses
 * amazon-cognito-identity-js (SRP: the password is never sent in plaintext and
 * NO AWS credentials live in the browser). Tokens are persisted in localStorage
 * by the SDK, so users stay logged in across reloads.
 */
import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
} from "amazon-cognito-identity-js";

const REGION = process.env.REACT_APP_COGNITO_REGION;
const USER_POOL_ID = process.env.REACT_APP_COGNITO_USER_POOL_ID;
const CLIENT_ID = process.env.REACT_APP_COGNITO_CLIENT_ID;

if (!USER_POOL_ID || !CLIENT_ID) {
  console.error(
    "Missing Cognito config. Set REACT_APP_COGNITO_USER_POOL_ID and REACT_APP_COGNITO_CLIENT_ID."
  );
}

const pool = new CognitoUserPool({
  UserPoolId: USER_POOL_ID,
  ClientId: CLIENT_ID,
});

let subscribers = [];
function notify(user) {
  subscribers.forEach((cb) => {
    try {
      cb(user);
    } catch (e) {
      /* ignore subscriber errors */
    }
  });
}

function decodeJwt(jwt) {
  try {
    return JSON.parse(atob(jwt.split(".")[1]));
  } catch {
    return {};
  }
}

// Synchronously read the stored ID token (SDK persists it in localStorage).
function readStoredIdToken() {
  const cu = pool.getCurrentUser();
  if (!cu) return null;
  const prefix = `CognitoIdentityServiceProvider.${CLIENT_ID}.${cu.getUsername()}`;
  return localStorage.getItem(`${prefix}.idToken`) || null;
}

function sessionPromise(cognitoUser) {
  return new Promise((resolve, reject) => {
    cognitoUser.getSession((err, session) => {
      if (err || !session || !session.isValid()) {
        reject(err || new Error("Invalid Cognito session"));
      } else {
        resolve(session);
      }
    });
  });
}

// Build the Firebase-like `currentUser` object (or null) from stored tokens.
function buildCurrentUser() {
  const idToken = readStoredIdToken();
  if (!idToken) return null;
  const claims = decodeJwt(idToken);
  const cognitoUser = pool.getCurrentUser();
  return {
    uid: claims.sub,
    email: claims.email,
    displayName: claims.name,
    getIdToken: async (forceRefresh = false) => {
      if (!cognitoUser) throw new Error("No authenticated user");
      const session = await sessionPromise(cognitoUser); // auto-refreshes if expired
      if (forceRefresh) {
        return new Promise((resolve, reject) => {
          cognitoUser.refreshSession(session.getRefreshToken(), (e, s) => {
            if (e) reject(e);
            else resolve(s.getIdToken().getJwtToken());
          });
        });
      }
      return session.getIdToken().getJwtToken();
    },
  };
}

// Firebase-compatible `auth` object used by api.js and others.
const auth = {
  get currentUser() {
    return buildCurrentUser();
  },
  signOut: async () => {
    const cu = pool.getCurrentUser();
    if (cu) cu.signOut();
    notify(null);
  },
};

// Sign in with email + password (SRP). Resolves to the currentUser object.
function signIn(email, password) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    const details = new AuthenticationDetails({
      Username: email,
      Password: password,
    });
    cognitoUser.authenticateUser(details, {
      onSuccess: () => {
        const user = buildCurrentUser();
        notify(user);
        resolve(user);
      },
      onFailure: (err) => reject(err),
      newPasswordRequired: () => {
        reject(new Error("New password required. Please reset your password."));
      },
    });
  });
}

async function signOutUser() {
  await auth.signOut();
}

// Initiate a forgot-password flow (sends a verification code to the user's email).
function forgotPassword(email) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    cognitoUser.forgotPassword({
      onSuccess: () => resolve(true),
      onFailure: (err) => reject(err),
      inputVerificationCode: () => resolve(true),
    });
  });
}

// Complete a forgot-password flow with the emailed code + new password.
function confirmPassword(email, code, newPassword) {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({ Username: email, Pool: pool });
    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => resolve(true),
      onFailure: (err) => reject(err),
    });
  });
}

// Firebase-like auth state listener. Fires immediately with the current user,
// then on every subsequent sign-in / sign-out. Returns an unsubscribe fn.
function onAuthStateChange(callback) {
  subscribers.push(callback);
  (async () => {
    const cu = pool.getCurrentUser();
    if (!cu) return callback(null);
    try {
      await sessionPromise(cu); // validate/refresh
      callback(buildCurrentUser());
    } catch {
      callback(null);
    }
  })();
  return () => {
    subscribers = subscribers.filter((s) => s !== callback);
  };
}

export {
  auth,
  pool,
  signIn,
  signOutUser,
  forgotPassword,
  confirmPassword,
  onAuthStateChange,
};
export default auth;
