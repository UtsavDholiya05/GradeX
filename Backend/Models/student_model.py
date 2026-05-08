from pydantic import BaseModel
from bson import ObjectId
from typing import List

class Answer(BaseModel):
    questionPaper: ObjectId
    answerSheet: ObjectId
    
    class Config:
        arbitrary_types_allowed = True

class Student(BaseModel):
    idNumber: str
    answers: List[Answer]
    
    class Config:
        arbitrary_types_allowed = True
