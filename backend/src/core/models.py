from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class ProductRequest(BaseModel):
    """Request model for product analysis"""
    title: str = Field(..., example="Sony WH-1000XM4 Headphones")
    price: float = Field(..., example=349.99)
    threshold: int = Field(..., example=500)
    # previous_messages: Optional[List[Dict[str, Any]]] = None
    
class DebateMessage(BaseModel):
    """Structure for a single debate message"""
    character: str
    text: str
    audio: str
    timestamp: datetime

class DebateResponse(BaseModel):
    """Response model for debate endpoints"""
    success: bool
    data: Dict[str, Any]
