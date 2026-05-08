from pydantic import BaseModel
from bson import ObjectId
from typing import List
from datetime import datetime

class Question(BaseModel):
    qNo: str
    question: str
    maxMarks: int
    guidelines: str

class QuestionPaper(BaseModel):
    name: str
    questions: List[Question]
    maxMarks: int
    studentsAttempted: List[ObjectId]
    createdOn: str
    icon: str

    class Config:
        arbitrary_types_allowed = True
