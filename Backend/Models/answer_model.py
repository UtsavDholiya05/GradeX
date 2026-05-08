from pydantic import BaseModel, Field
from bson import ObjectId
from typing import List, Optional

class Evaluation(BaseModel):
    questionNumber: int
    marksObtained: int
    reasonForDeduction: Optional[str] = None
    reasonForFullMarks: Optional[str] = None
    improvisationTips: Optional[str] = None

class AnswerSheet(BaseModel):
    student: ObjectId
    questionPaper: ObjectId
    evaluation: List[Evaluation]
    totalMarks: int
    
    class Config:
        arbitrary_types_allowed = True
