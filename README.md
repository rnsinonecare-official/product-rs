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

### Backend Variables:
```
NODE_ENV=production
ADMIN_API_KEY=rainscare_admin_key_2024
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
GOOGLE_AI_API_KEY=your-google-ai-key
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend Variables:
```
REACT_APP_API_URL=https://your-vercel-url.vercel.app/api
REACT_APP_ENVIRONMENT=production
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
- **Firebase Integration**: User authentication and data storage
- **AI Services**: Google Gemini integration for food analysis
- **Admin APIs**: Comprehensive admin management endpoints
- **Real-time Data**: Live analytics and user data

## 🌐 Live URLs

After deployment, your app will be available at:

- **Main App**: `https://your-vercel-url.vercel.app`
- **Admin Panel**: `https://your-vercel-url.vercel.app/admin`
- **API Docs**: `https://your-vercel-url.vercel.app/api/health`

## 🔐 Admin Access

**Default Admin Credentials:**
- **Username**: `admin`
- **Password**: `admin123`
- **API Key**: `rainscare_admin_key_2024`

⚠️ **Change these credentials after first login!**

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project
- Google AI API key

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
- **Firebase Admin**: Database and auth
- **Google AI**: Gemini integration
- **Multer**: File upload handling
- **CORS**: Cross-origin requests

### Admin Dashboard
- **React 18**: Admin interface
- **Chart.js**: Data visualization
- **Lucide React**: Icon library
- **Date-fns**: Date manipulation
- **Recharts**: Advanced charts

## 🔒 Security Features

- **Firebase Authentication**: Secure user auth
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
- [Firebase Documentation](https://firebase.google.com/docs)
- [React Documentation](https://reactjs.org/docs)

## 🎉 Success!

Your Rainscare platform is now live! 🚀

**Next Steps:**
1. Update environment variables with your actual values
2. Configure Firebase security rules
3. Set up custom domain (optional)
4. Monitor performance and usage
5. Add your own branding and content

Happy coding! 💻✨