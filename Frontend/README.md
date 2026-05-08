# Gradex Frontend

AI-powered answer sheet evaluation platform that automates the grading process for educational institutions.

## Features

- Modern UI with React 19, Tailwind CSS 4, and Framer Motion
- AI-Powered evaluation of answer sheets
- Dashboard analytics and paper management
- OTP-based authentication
- Real-time progress tracking
- Responsive design

## Technology Stack

- React
- Tailwind CSS
- React Router DOM
- Axios
- Lucide React
- date-fns
- React Toastify

## Project Structure

```
src/
├── components/
│   └── ui.jsx              
├── lib/
│   └── useFileUpload.js    
├── Pages/
│   ├── app/
│   │   └── UpdatedAppPage.jsx  
│   ├── AuthenticationPage.jsx  
│   ├── Dashboard.jsx       
│   ├── History.jsx         
│   ├── LandingPage.jsx     
│   └── Troubles.jsx        
├── Header.jsx              
├── Layout.jsx              
├── Sidebar.jsx             
├── main.jsx               
└── index.css              
```

## Routes

```
/ → Landing Page
/auth → Authentication
/dashboard → Dashboard
/app → Upload Interface
/history → Evaluation History
/troubles → Error Page
```

## Running the App

```bash
npm install
npm run dev
```

The development server proxies `/v1` requests to `localhost:8000`.
