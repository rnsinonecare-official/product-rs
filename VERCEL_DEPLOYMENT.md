# Vercel Deployment Guide (AWS backend)

Rainscare runs as **three separate Vercel projects** (backend, client, admin). Hosting is Vercel; all data/auth/AI/storage are on **AWS** (Cognito, DynamoDB, Bedrock, S3) in account `744488454775`, region `us-east-1`.

> 🔒 **Security:** Never commit secrets. Set all values below in the Vercel dashboard (Project → Settings → Environment Variables). Only the backend holds AWS credentials — the client/admin get **public** config only.

## 1. Backend project (`/backend`)

Environment variables:

| Key | Value |
|---|---|
| `AWS_REGION` | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | access key for the `rainscare-backend` IAM user |
| `AWS_SECRET_ACCESS_KEY` | its secret (secret — Vercel only) |
| `COGNITO_USER_POOL_ID` | `us-east-1_dGaDJKXsX` |
| `COGNITO_CLIENT_ID` | `2vguuqadsakmgtjohpftatmfuk` |
| `DDB_TABLE_PREFIX` | `rainscare-` |
| `S3_BUCKET` | `rainscare-media-uploads` |
| `BEDROCK_TEXT_CHAIN` | `moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,deepseek.v3.2,mistral.mistral-large-3-675b-instruct,zai.glm-5` |
| `BEDROCK_IMAGE_CHAIN` | `moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,mistral.mistral-large-3-675b-instruct` |
| `ADMIN_API_KEY` | rotated admin key (secret) |
| `ADMIN_ID` | rotated admin id |
| `ADMIN_PASSWORD_HASH` | bcrypt hash of the new admin password |
| `FRONTEND_URL` | the client's Vercel URL (for CORS) |
| `EDAMAM_APP_ID` / `EDAMAM_APP_KEY` / `SPOONACULAR_API_KEY` | only if those food APIs are used |

Deploy — Vercel uses `backend/vercel.json` (Node runtime, entry `src/server.js`).

## 2. Client project (`/client`)

**Public config only — no secrets:**

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://<backend>.vercel.app/api` |
| `REACT_APP_COGNITO_REGION` | `us-east-1` |
| `REACT_APP_COGNITO_USER_POOL_ID` | `us-east-1_dGaDJKXsX` |
| `REACT_APP_COGNITO_CLIENT_ID` | `2vguuqadsakmgtjohpftatmfuk` |
| `REACT_APP_ADMIN_URL` | the admin app's Vercel URL |

## 3. Admin project (`/admin`)

The admin app talks only to the backend API (no Firebase, no AWS creds):

| Key | Value |
|---|---|
| `REACT_APP_API_URL` | `https://<backend>.vercel.app/api` |
| `REACT_APP_ADMIN_API_KEY` | the rotated admin key |

## Order

1. Deploy **backend** first → note its URL.
2. Set `REACT_APP_API_URL` on client + admin to `<backend-url>/api`, deploy them.
3. Set `FRONTEND_URL` on the backend to the client URL (CORS), redeploy backend.

## URLs

- Backend: `https://<backend>.vercel.app`
- Client: `https://<client>.vercel.app`
- Admin: `https://<admin>.vercel.app`
