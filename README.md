# 🌟 Rainscare - Complete Health & Nutrition Platform

A comprehensive health and nutrition platform with AI-powered food analysis, user management, and admin dashboard.

## 🏗️ Project Structure

```
rainscare/
├── backend/          # Node.js API server
├── client/           # React frontend app
├── admin/            # React admin dashboard
├── vercel.json       # Vercel deployment config
├── package.json      # Root package.json
└── README.md         # This file
```

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy (Recommended)

1. **Fork this repository** to your GitHub account

2. **Deploy to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository
   - Configure environment variables (see below)
   - Click "Deploy"

### Option 2: Command Line Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option 3: Use Deploy Scripts

**Windows:**
```bash
deploy.bat
```

**Mac/Linux:**
```bash
chmod +x deploy.sh
./deploy.sh
```

## 🔧 Environment Variables

Set these in your Vercel project settings:

See **VERCEL_DEPLOYMENT.md** for the full list. Summary:

### Backend Variables (secrets — backend project only):
```
NODE_ENV=production
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<rainscare-backend IAM key>
AWS_SECRET_ACCESS_KEY=<secret>
COGNITO_USER_POOL_ID=us-east-1_dGaDJKXsX
COGNITO_CLIENT_ID=2vguuqadsakmgtjohpftatmfuk
DDB_TABLE_PREFIX=rainscare-
S3_BUCKET=rainscare-media-uploads
BEDROCK_TEXT_CHAIN=moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,deepseek.v3.2,mistral.mistral-large-3-675b-instruct,zai.glm-5
BEDROCK_IMAGE_CHAIN=moonshotai.kimi-k2.5,amazon.nova-pro-v1:0,mistral.mistral-large-3-675b-instruct
ADMIN_API_KEY=<rotated>  ADMIN_ID=<rotated>  ADMIN_PASSWORD_HASH=<bcrypt hash>
```

### Frontend Variables (PUBLIC only — no secrets):
```
REACT_APP_API_URL=https://your-backend.vercel.app/api
REACT_APP_COGNITO_REGION=us-east-1
REACT_APP_COGNITO_USER_POOL_ID=us-east-1_dGaDJKXsX
REACT_APP_COGNITO_CLIENT_ID=2vguuqadsakmgtjohpftatmfuk
```

## 📱 Features

### 🍎 Main App (Client)
- **AI Food Analysis**: Upload food images for nutritional analysis
- **Daily Intake Tracking**: Track calories, macros, and nutrients
- **Health Metrics**: Monitor weight, BMI, and health goals
- **Recipe Suggestions**: AI-powered recipe recommendations
- **User Profiles**: Personalized health profiles and preferences

### 🔧 Admin Dashboard
- **Real Analytics**: User engagement and app usage statistics
- **User Management**: View, edit, and manage user accounts
- **Content Management**: Manage announcements, health tips, and success stories
- **Doctor Management**: Add and manage healthcare professionals
- **System Monitoring**: Real-time system health and performance

### ⚙️ Backend API
- **RESTful API**: Complete REST API for all app functionality
- **AWS Cognito**: User authentication (JWT verified server-side)
- **AWS DynamoDB**: All data storage (accessed only via the backend)
- **AWS Bedrock**: AI food analysis & recipes (Kimi K2.5 + model fallback chain)
- **AWS S3**: Media/image storage
- **Admin APIs**: Comprehensive admin management endpoints

## 🌐 Live URLs

After deployment, your app will be available at:

- **Main App**: `https://your-vercel-url.vercel.app`
- **Admin Panel**: `https://your-vercel-url.vercel.app/admin`
- **API Docs**: `https://your-vercel-url.vercel.app/api/health`

## 🔐 Admin Access

**Admin credentials are set via environment variables** (`ADMIN_ID`, `ADMIN_PASSWORD_HASH`, `ADMIN_API_KEY`) — never hard-coded.

⚠️ The previously-committed admin credentials are considered **compromised** and must be rotated (new `ADMIN_API_KEY`, new `ADMIN_ID`, and a fresh bcrypt `ADMIN_PASSWORD_HASH`) in Vercel.

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- AWS account with Cognito, DynamoDB, S3, and Bedrock (model access) — see `CLAUDE.md`
- AWS credentials for the backend (IAM user `rainscare-backend`)

### Setup
```bash
# Clone repository
git clone <your-repo-url>
cd rainscare

# Install all dependencies
npm run install:all

# Set up environment variables
cp backend/.env.example backend/.env
cp client/.env.example client/.env
cp admin/.env.example admin/.env

# Start all services
npm run dev
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3001
- **Backend**: http://localhost:5000

## 📊 Tech Stack

### Frontend
- **React 18**: Modern React with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **React Hot Toast**: Notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **AWS SDK v3**: DynamoDB, Cognito, S3, Bedrock
- **aws-jwt-verify**: Cognito token verification
- **Multer**: File upload handling
- **CORS**: Cross-origin requests

### Admin Dashboard
- **React 18**: Admin interface
- **Chart.js**: Data visualization
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation
- **Recharts**: Advanced charts

## 🔒 Security Features

- **AWS Cognito**: Secure user auth (SRP; tokens verified server-side)
- **No secrets in the frontend**: browser holds only public Cognito/API config; all AWS credentials stay in the backend
- **All DB access via backend**: the browser never touches DynamoDB directly
- **API Key Protection**: Admin API security
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Server-side validation
- **Error Handling**: Comprehensive error management

## 📈 Analytics & Monitoring

- **Real User Analytics**: Track user engagement
- **Performance Monitoring**: API response times
- **Error Tracking**: Automatic error logging
- **Usage Statistics**: Detailed usage metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

Need help? Check out:
- [Vercel Documentation](https://vercel.com/docs)
- [AWS Documentation](https://docs.aws.amazon.com/)
- [React Documentation](https://reactjs.org/docs)

## 🎉 Success!

Your Rainscare platform is now live! 🚀

**Next Steps:**
1. Update environment variables with your actual values
2. Confirm AWS resources (Cognito/DynamoDB/S3/Bedrock) and IAM scoping
3. Set up custom domain (optional)
4. Monitor performance and usage
5. Add your own branding and content

Happy coding! 💻✨