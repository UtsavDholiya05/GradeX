# Gradex Backend

## Project Structure

```
Backend/
├── app.py                  
├── requirements.txt        
├── DB/
│   ├── __init__.py        
│   └── database_connection.py  
├── Middlewares/
│   └── auth.py            
├── Models/
│   ├── answer_model.py    
│   ├── institute_model.py 
│   ├── question_model.py  
│   └── student_model.py   
└── Routes/
    └── routes.py          
```

## Core Features

### Authentication System
- OTP-based Login with email verification
- JWT Tokens with 30-day expiration
- Protected Routes via middleware

### Question Paper Processing
- PDF Upload for question papers and reference answers
- OCR Processing using Groq AI
- AI Parsing with Gemini to structure questions and guidelines

### Answer Evaluation
- Automated Grading against reference guidelines
- Student Identification from filenames
- Marks Calculation with optional question handling
- Feedback Generation with improvement suggestions

### Data Management
- Paper History tracking
- Statistics for papers and evaluations

## Technology Stack

- FastAPI - Python web framework
- MongoDB - NoSQL database
- JWT - Authentication
- PyMuPDF - PDF processing

## API Endpoints

### Public Endpoints
- `GET /` - Health check
- `POST /v1/send-otp` - Generate and send OTP
- `POST /v1/verify-otp` - Verify OTP and get token

### Protected Endpoints
- `POST /v1/upload` - Upload question paper
- `POST /v1/upload-answers` - Upload and evaluate answer sheet
- `GET /v1/get-question-papers` - List user's papers
- `GET /v1/get-all-question-paper-details` - Get detailed paper info
- `GET /v1/get-answer-sheets/{paper_id}` - List answer sheets for paper
- `GET /v1/get-answer-sheet-details/{sheet_id}` - Get evaluation details
- `GET /v1/get-history` - Get paper history
- `GET /v1/institute-stats` - Get usage statistics


## Running the Server

```bash
pip install -r requirements.txt
uvicorn app:app
```
