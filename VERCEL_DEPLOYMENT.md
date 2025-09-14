# Vercel Deployment Guide

Deploy your Rainscare Health Platform on Vercel with separate projects for backend, frontend, and admin.

## 🚀 Quick Deployment Steps

### 1. Backend Deployment

1. **Create new Vercel project** from `/backend` folder
2. **Add environment variables** from `backend/vercel-env-vars.txt`
3. **Encode Firebase service account:**
   ```bash
   cat backend/config/service-account.json | base64 -w 0
   ```
   Add this as `GOOGLE_SERVICE_ACCOUNT_KEY` in Vercel
4. **Deploy** - Vercel will automatically use `vercel.json` config

### 2. Frontend Deployment

1. **Create new Vercel project** from `/client` folder
2. **Add environment variables** from `client/vercel-env-vars.txt`
3. **Update `REACT_APP_API_URL`** with your backend Vercel URL
4. **Deploy** - Vercel will build and deploy React app

### 3. Admin Panel Deployment

1. **Create new Vercel project** from `/admin` folder
2. **Add environment variables** from `admin/vercel-env-vars.txt`
3. **Update `REACT_APP_API_URL`** with your backend Vercel URL
4. **Deploy** - Vercel will build and deploy admin panel

## 📝 Environment Variables Setup

### Backend (Copy from `backend/vercel-env-vars.txt`)
- All your current environment variables
- `GOOGLE_SERVICE_ACCOUNT_KEY` (base64 encoded Firebase service account)
- `FRONTEND_URL` (your frontend Vercel URL)

### Frontend (Copy from `client/vercel-env-vars.txt`)
- `REACT_APP_API_URL` (your backend Vercel URL + `/api`)
- All Firebase configuration variables

### Admin (Copy from `admin/vercel-env-vars.txt`)
- `REACT_APP_API_URL` (your backend Vercel URL + `/api`)
- `REACT_APP_ADMIN_API_KEY`
- All Firebase configuration variables

## 🔗 URL Structure

After deployment, you'll have:
- **Backend:** `https://your-backend.vercel.app`
- **Frontend:** `https://your-frontend.vercel.app`
- **Admin:** `https://your-admin.vercel.app`

## ⚠️ Important Notes

1. **Deploy backend first** to get the API URL
2. **Update frontend and admin** with the backend URL
3. **Update backend** with the frontend URL for CORS
4. **Firebase service account** must be base64 encoded for Vercel
5. **All projects are separate** - deploy each folder individually

## 🔧 Vercel Configuration Files

- `vercel.json` files are already created for each component
- Backend uses Node.js runtime
- Frontend/Admin use static build with React Router support

That's it! Your app will be live on Vercel with separate URLs for each component.