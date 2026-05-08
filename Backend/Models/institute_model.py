from pydantic import BaseModel, Field
from typing import List, Optional
from bson import ObjectId

class PaperHistoryEntry(BaseModel):
    name: str
    paperId: ObjectId
    createdOn: str

class User(BaseModel):
    email: str
    otp: str
    otpExpires: str
    paperHistory: List[PaperHistoryEntry] = Field(default_factory=list)
    
    class Config:
        arbitrary_types_allowed = True
