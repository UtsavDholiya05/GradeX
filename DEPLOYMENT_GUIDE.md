# GradeX Deployment Guide - Authentication Enabled

This guide covers deploying GradeX with full authentication to Vercel (Frontend) and Render (Backend).

## Prerequisites

1. **MongoDB Atlas Account**
   - Create a cluster at https://www.mongodb.com/cloud/atlas
   - Create a database user with read/write permissions
   - Whitelist your Render IP address

2. **Gmail Account with 2FA**
   - Enable 2FA in your Google Account
   - Generate an App Password at https://myaccount.google.com/apppasswords
   - This will be your `PASS` environment variable

3. **API Keys**
   - Groq API Key: https://console.groq.com/keys
   - Google Gemini API Key: https://aistudio.google.com/apikey

4. **Hosting Accounts**
   - Vercel account (for frontend)
   - Render account (for backend)

---

## Backend Deployment (Render)

### Step 1: Prepare Environment Variables

Create these environment variables in Render dashboard:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gradex?retryWrites=true&w=majority
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
USER=your-email@gmail.com
PASS=your_gmail_app_password
JWT_SECRET=generate-a-strong-random-string-here
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Step 2: Deploy to Render

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `uvicorn app:app --host 0.0.0.0 --port 8000`
5. Add the environment variables from Step 1
6. Deploy

### Step 3: Get Your Backend URL

After deployment, you'll get a URL like: `https://gradex-npg5.onrender.com`

---

## Frontend Deployment (Vercel)

### Step 1: Update Environment Files

**`.env.development`** (local development):
```
VITE_BACKEND_URL=http://localhost:8000
```

**`.env.production`** (Vercel deployment):
```
VITE_BACKEND_URL=https://your-render-backend-url.onrender.com
```

### Step 2: Deploy to Vercel

1. Connect your GitHub repository to Vercel
2. Select the `Frontend` folder as the root directory
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

### Step 3: Get Your Frontend URL

After deployment, you'll get a URL like: `https://gradex.vercel.app`

---

## Update Backend FRONTEND_URL

After deploying the frontend to Vercel:

1. Go to Render dashboard
2. Update the `FRONTEND_URL` environment variable with your Vercel URL
3. Redeploy the backend

---

## Authentication Flow

### 1. User lands on the site (unauthenticated)
- Redirected to `/auth` (AuthenticationPage)

### 2. User enters email and clicks "Send OTP"
- **POST** `/v1/send-otp` with `{ email: "user@example.com" }`
- Backend sends OTP via Gmail SMTP
- OTP stored in MongoDB with 5-minute expiration

### 3. User enters OTP and clicks "Verify"
- **POST** `/v1/verify-otp` with `{ email: "user@example.com", otp: "123456" }`
- Backend validates OTP and generates JWT token
- Token stored in localStorage as `institute-auth`
- Email stored in localStorage as `email`

### 4. User redirected to `/app`
- All subsequent API calls include Authorization header: `Bearer <token>`
- JWT middleware validates token on every request

### 5. User uploads files
- Files are associated with user's MongoDB ID
- Files persist across sessions (stored in database)
- When user logs out, localStorage is cleared but files remain in database

---

## Local Development Setup

### 1. Install Dependencies

**Backend:**
```bash
cd Backend
pip install -r requirements.txt
```

**Frontend:**
```bash
cd Frontend
npm install
```

### 2. Create Backend `.env` File

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gradex
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
USER=your-email@gmail.com
PASS=your_gmail_app_password
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

### 3. Run Both Servers

**Backend:**
```bash
cd Backend
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd Frontend
npm run dev
```

Visit: http://localhost:5173

---

## Testing the Authentication

1. Open http://localhost:5173
2. Click "Get Started"
3. You should see the login page
4. Enter your email
5. Click "Send OTP"
6. Check your Gmail for the OTP
7. Enter OTP and click "Verify"
8. You should be redirected to `/app`
9. Upload files to test the full flow

---

## Important Security Notes

1. **JWT_SECRET**: Use a strong, random string. Generate one with:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **CORS**: Only add trusted domains to `FRONTEND_URL`

3. **Database**: 
   - Keep MongoDB credentials secure
   - Use environment variables, never hardcode

4. **Email**: 
   - Use Gmail App Password (not regular password)
   - Enable 2FA on Gmail account

5. **Token Expiration**: 
   - Currently set to 30 days in `create_access_token()`
   - Adjust in `routes.py` if needed

---

## Troubleshooting

### "Missing or invalid token" error
- User's token expired or was not saved
- Clear localStorage and login again

### "OTP not received" email
- Check Gmail spam folder
- Verify SMTP credentials are correct
- Ensure Gmail App Password is used, not regular password

### CORS errors
- Make sure `FRONTEND_URL` is set correctly in backend
- Check that frontend and backend URLs are whitelisted

### Database connection fails
- Verify MongoDB URI is correct
- Check that Render IP is whitelisted in MongoDB Atlas
- Ensure database user has correct permissions

---

## Environment Variables Summary

### Backend (.env or Render)
- `MONGODB_URI` - MongoDB connection string
- `GROQ_API_KEY` - Groq API key
- `GEMINI_API_KEY` - Google Gemini API key
- `USER` - Gmail email address
- `PASS` - Gmail App Password
- `JWT_SECRET` - JWT signing secret
- `FRONTEND_URL` - Frontend domain for CORS

### Frontend (.env files)
- `VITE_BACKEND_URL` - Backend API URL

---

## File Persistence

Files uploaded by users are stored in:
1. Question papers metadata in `question_papers` collection
2. Answer sheets in `answer_sheets` collection
3. Student info in `students` collection
4. User profile and history in `users` collection (references to papers)

All data persists in MongoDB, so files will be available on subsequent logins.
