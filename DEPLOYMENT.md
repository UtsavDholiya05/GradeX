# GradeX Deployment Guide

## **Frontend (Vercel)** ✅

1. **Push to GitHub** - Commit all changes
2. **Connect to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Deploy (no extra config needed)

3. **Update `.env.production`** with your backend URL once deployed

---

## **Backend Deployment Options**

### **Option 1: Railway (Recommended)** 🚀

1. Sign up at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Select your repo
4. Configure environment variables:
   - `MONGODB_URI` (your MongoDB connection)
   - `JWT_SECRET`
   - Any other `.env` variables

5. Railway will auto-detect FastAPI and deploy
6. Copy your Railway URL and update `.env.production` in Frontend

**Backend URL format:** `https://your-railway-app.railway.app`

---

### **Option 2: Render** 🎨

1. Sign up at https://render.com
2. Click "New Web Service"
3. Connect GitHub repo
4. Set:
   - **Build Command:** `pip install -r Backend/requirements.txt`
   - **Start Command:** `cd Backend && uvicorn app:app --host 0.0.0.0 --port 8000`

5. Add environment variables
6. Deploy and copy the URL

---

### **Option 3: Heroku** (Legacy but works)

Similar to Render - set build & start commands

---

## **Fix for Current Vercel Error**

✅ **Already fixed**: Recreated `requirements.txt` with proper UTF-8 encoding

**Changes made**:
- ✅ `requirements.txt` - Now UTF-8 encoded (was UTF-16 BOM)
- ✅ `vercel.json` - Frontend-only configuration
- ✅ Environment variables setup for production

---

## **Next Steps**

1. **Deploy Frontend on Vercel** (ready now)
2. **Deploy Backend on Railway/Render** (choose one)
3. **Update `.env.production`** with backend URL
4. **Redeploy Frontend** on Vercel

---

## **Testing Locally**

```bash
# Terminal 1: Backend
cd Backend
pip install -r requirements.txt
uvicorn app:app --reload

# Terminal 2: Frontend
cd Frontend
npm install
npm run dev
```

Visit: http://localhost:5173
