/**
 * Compatibility bridge — Firebase has been fully replaced by AWS.
 * The real implementation (DynamoDB / Cognito / S3 / Bedrock + a
 * Firestore-compatible `db`/`admin` adapter) lives in ./aws.js.
 * Existing `require('../config/firebase')` imports resolve here unchanged.
 */
module.exports = require("./aws");
