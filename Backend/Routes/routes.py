import datetime
import random
from fastapi import APIRouter, Form, HTTPException, UploadFile, File, Request
from bson import ObjectId
from DB.database_connection import get_database
import fitz
import json
import os
import base64
import re
import google.generativeai as genai
from groq import Groq
import jwt
from pydantic import BaseModel
import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
from zoneinfo import ZoneInfo

router = APIRouter()
load_dotenv()
db = get_database()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")

SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("USER")
SMTP_PASSWORD = os.getenv("PASS")

groq_client = Groq(api_key=GROQ_API_KEY)
genai.configure(api_key=GEMINI_API_KEY)


def split_pdf_into_pages(pdf_bytes):
    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    return [doc.load_page(i).get_pixmap(dpi=150).tobytes("png") for i in range(len(doc))]


def perform_ocr_with_groq(image_bytes):
    try:
        image_base64 = base64.b64encode(image_bytes)
        pass
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(f'OCR Error : {e}'))


def clean_json_output(raw_output):
    cleaned = re.sub(r"```json|```", "", raw_output).strip()
    return json.loads(cleaned)


def evaluate_with_gemini(prompt):
    try:
        pass
    except Exception as e:
        raise RuntimeError(f"Evaluation Error: {e}")


class SendOTPRequest(BaseModel):
    email: str


class VerifyOTPRequest(BaseModel):
    email: str
    otp: str


def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode["exp"] = datetime.datetime.utcnow() + datetime.timedelta(days=30)
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")
    return encoded_jwt


def send_email(to_email, subject, body):
    try:
        msg = MIMEText(body)
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = to_email
        
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, [to_email], msg.as_string())
    except Exception as e:
        print(f"Email send error: {e}")
        # Don't raise exception, just log it - email failures shouldn't block auth
        pass


@router.api_route("/", methods=["GET", "HEAD"])
async def root():
    return {"message": "Welcome to Gradex Backend!"}


@router.post("/v1/send-otp")
async def send_otp(request: SendOTPRequest):
    otp = f"{random.randint(100000, 999999)}"
    expires = datetime.datetime.now() + datetime.timedelta(minutes=5)
    
    db.users.update_one(
        {"email": request.email},
        {"$set": {"email": request.email, "otp": otp, "otpExpires": expires}, "$setOnInsert": {"paperHistory": []}},
        upsert=True,
    )
    
    send_email(request.email, "Your OTP for Gradex", f"Your OTP is {otp}. It is valid for 5 minutes.")
    return {"success": True, "message": "OTP sent."}


@router.post("/v1/verify-otp")
async def verify_otp(request: VerifyOTPRequest):
    user = db.users.find_one({"email": request.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user["otp"] != request.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if datetime.datetime.now() > user["otpExpires"]:
        raise HTTPException(status_code=400, detail="OTP expired")

    db.users.update_one({"email": request.email}, {"$set": {"otp": "", "otpExpires": ""}})
    
    token = create_access_token({"user_id": str(user["_id"])})
    return {"success": True, "message": "OTP verified", "token": token}


@router.post("/v1/upload")
async def upload_question_paper(request: Request, questionPaper: UploadFile = File(...), referenceSheet: UploadFile = File(...)):
    user_id = request.state.user["user_id"]
    if not user_id:
        raise HTTPException(status_code=404, detail="User not found")
    
    try:
        name = os.path.splitext(questionPaper.filename)[0]
        
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if user and "paperHistory" in user:
            for paper_entry in user["paperHistory"]:
                if paper_entry.get("name") == name:
                    return {"success": False, "message": f"Question paper '{name}' already exists."}

        qp_text = "\n\n".join([perform_ocr_with_groq(p) for p in split_pdf_into_pages(await questionPaper.read())])
        rs_text = "\n\n".join([perform_ocr_with_groq(p) for p in split_pdf_into_pages(await referenceSheet.read())])

        data = {}
        
        data["name"] = name
        data["createdOn"] = datetime.datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()
        data["studentsAttempted"] = []

        inserted = db.question_papers.insert_one(data)
        paper_id = inserted.inserted_id

        db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"paperHistory": {"name": name, "paperId": paper_id, "createdOn": data["createdOn"]}}}
        )

        return {"success": True, "message": "Question paper uploaded.", "questionPaperId": str(paper_id)}
    except Exception as e:
        return HTTPException(status_code=500, detail=str(e))


@router.post("/v1/upload-answers")
async def evaluate_exam(questionPaperId: str = Form(...), answerSheet: UploadFile = File(...)):
    try:
        qp = db.question_papers.find_one({"_id": ObjectId(questionPaperId)})
        
        if not qp:
            raise HTTPException(status_code=404, detail="Question paper not found.")

        filename = answerSheet.filename
        student_id = filename.split('-')[0]
        if not student_id:
            raise HTTPException(status_code=400, detail="Filename must begin with a student ID")

        student = db.students.find_one({"idNumber": student_id})
        if student:
            already = db.answer_sheets.find_one({
                "student": student["_id"],
                "questionPaper": ObjectId(questionPaperId)
            })
            if already:
                raise HTTPException(status_code=409, detail="This student's answer sheet for this paper is already evaluated.")

        qp_meta = {
            "questions" : qp.get("questions", []),
            "maxMarks" : qp.get("maxMarks", 0)
        }

        answer_text = ""
        
        result = {"evaluation": [], "totalMarks": 0}
        result["questionPaper"] = ObjectId(questionPaperId)
        
        if not student:
            sid = db.students.insert_one({"idNumber": student_id, "answers": []}).inserted_id
        else:
            sid = student["_id"]
        result["student"] = sid

        aid = db.answer_sheets.insert_one(result).inserted_id

        db.question_papers.update_one({"_id": ObjectId(questionPaperId)}, {"$addToSet": {"studentsAttempted": aid}})
        
        db.students.update_one({"idNumber": student_id}, {"$addToSet": {"answers": {"questionPaper": ObjectId(questionPaperId), "answerSheet": aid}}})

        return {"success": True, "message": "Evaluation complete.", "answerSheetId": str(aid)}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/get-question-papers")
def get_question_papers(request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        return {"papers": []}

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user or "paperHistory" not in user:
        return {"papers": []}

    papers = [
        {"id": str(entry["paperId"]), "name": entry["name"], "createdOn" : entry["createdOn"]}
        for entry in user["paperHistory"]
    ]
    
    return {"papers": papers}


@router.get("/v1/get-all-question-paper-details")
def get_all_question_paper_details(request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        return {"papers": []}

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user or "paperHistory" not in user:
        return {"papers": []}

    paper_ids = [entry["paperId"] for entry in user["paperHistory"]]
    papers_cursor = db.question_papers.find({"_id": {"$in": paper_ids}})
    
    papers = []
    for paper in papers_cursor:
        paper_dict = dict(paper)
        paper_dict["id"] = str(paper_dict.pop("_id"))
        if "studentsAttempted" in paper_dict:
            paper_dict["studentsAttempted"] = [str(sid) for sid in paper_dict["studentsAttempted"]]
        papers.append(paper_dict)
    return {"papers": papers}


@router.get("/v1/get-answer-sheets/{paper_id}")
def get_answer_sheets_for_paper(paper_id: str, request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        paper_id_obj = ObjectId(paper_id)
        
        user = db.users.find_one({"_id": ObjectId(user_id), "paperHistory.paperId": paper_id_obj})
        if not user:
            raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this paper.")

        paper = db.question_papers.find_one({"_id": paper_id_obj})
        if not paper or not paper.get("studentsAttempted"):
            return {"answerSheets": []}

        answer_sheet_ids = paper["studentsAttempted"]
        answer_sheets_cursor = db.answer_sheets.find({"_id": {"$in": answer_sheet_ids}})
        
        student_ids = [sheet['student'] for sheet in answer_sheets_cursor if 'student' in sheet]
        answer_sheets_cursor.rewind()
        
        students_cursor = db.students.find({"_id": {"$in": student_ids}})
        student_map = {str(student['_id']): student['idNumber'] for student in students_cursor}

        sheets_data = []
        for sheet in answer_sheets_cursor:
            student_name = student_map.get(str(sheet.get('student')), "Unknown Student")
            sheets_data.append({
                "id": str(sheet["_id"]),
                "studentName": student_name,
                "submittedOn": sheet["_id"].generation_time.isoformat(),
                "totalMarks": sheet.get("totalMarks")
            })
            
        return {"answerSheets": sheets_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/get-answer-sheet-details/{sheet_id}")
def get_answer_sheet_details(sheet_id: str, request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        sheet_id_obj = ObjectId(sheet_id)
        
        answer_sheet = db.answer_sheets.find_one({"_id": sheet_id_obj})
        if not answer_sheet:
            raise HTTPException(status_code=404, detail="Answer sheet not found")

        paper_id_obj = answer_sheet["questionPaper"]
        
        user = db.users.find_one({"_id": ObjectId(user_id), "paperHistory.paperId": paper_id_obj})
        if not user:
            raise HTTPException(status_code=403, detail="Forbidden: You do not have access to this paper's sheets.")
            
        question_paper = db.question_papers.find_one({"_id": paper_id_obj})
        if not question_paper:
             raise HTTPException(status_code=404, detail="Associated question paper not found")
        
        student = db.students.find_one({"_id": answer_sheet["student"]})
        student_name = student["idNumber"] if student else "Unknown Student"
        
        question_map = {q["qNo"]: q for q in question_paper.get("questions", [])}
        
        evaluation_details = []
        for ev in answer_sheet.get("evaluation", []):
            q_num_str = ev.get("questionNumber")
            q_details = question_map.get(q_num_str)
            if not q_details:
                continue
            
            comments = []
            if ev.get("reasonForDeduction"): comments.append(f"Deduction: {ev['reasonForDeduction']}")
            if ev.get("reasonForFullMarks"): comments.append(f"Full Marks: {ev['reasonForFullMarks']}")
            if ev.get("improvisationTips"): comments.append(f"Tips: {ev['improvisationTips']}")
            
            marks_awarded = ev.get("marksObtained", 0)
            max_marks = q_details.get("maxMarks", 0)

            evaluation_details.append({})

        response_sheet = {
            "id": str(answer_sheet["_id"]),
            "studentName": student_name,
            "submittedOn": answer_sheet["_id"].generation_time.isoformat(),
            "totalMarks": answer_sheet.get("totalMarks"),
            "evaluation": evaluation_details
        }
        
        return {"answerSheet": response_sheet}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/get-history")
def get_institute_question_papers(request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "paperHistory" not in user:
            return {"papers": []}

        paper_ids = [entry["paperId"] for entry in user["paperHistory"]]
        papers_cursor = db.question_papers.find({"_id": {"$in": paper_ids}})
        
        papers = [
            {
                "name": paper.get("name", "Unnamed Paper"),
                "createdOn": paper.get("createdOn", "Unknown Date")
            }
            for paper in papers_cursor
        ]
        return {"papers": papers}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/v1/institute-stats")
def get_institute_stats(request: Request):
    user_id = request.state.user.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user or "paperHistory" not in user:
            return {"totalQuestionPapers": 0, "totalAnswerSheetsCorrected": 0}

        paper_ids = [entry["paperId"] for entry in user["paperHistory"]]
        papers_cursor = db.question_papers.find({"_id": {"$in": paper_ids}})

        total_question_papers = 0
        total_answer_sheets_corrected = 0

        for paper in papers_cursor:
            total_question_papers += 1
            total_answer_sheets_corrected += len(paper.get("studentsAttempted", []))

        return {
            "totalQuestionPapers": total_question_papers,
            "totalAnswerSheetsCorrected": total_answer_sheets_corrected
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
