/**
 * Compatibility bridge — Firebase has been fully replaced by AWS Cognito.
 * The real auth implementation lives in ../aws/cognitoAuth. Existing imports of
 * `{ auth }` from '../firebase/config' keep working unchanged. There is no
 * client-side database anymore: ALL data access goes through the backend API,
 * so `db` is null on purpose.
 */
import auth from "../aws/cognitoAuth";

const db = null; // no direct DB from the browser — use the backend API
const analytics = null;
const app = null;

export { app, auth, db, analytics };
