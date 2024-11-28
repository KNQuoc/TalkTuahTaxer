from pydantic import BaseModel
from typing import Dict, Any

class ProductData(BaseModel):
    """Product information received from frontend"""
    title: str
    price: float
    description: str
    platform: str
    url: str

class AnalysisRequest(BaseModel):
    """Main request body structure"""
    product: ProductData

class CategoryResponse(BaseModel):
    """Product categorization response"""
    category: str
    confidence: int
    reasoning: str

class AdvocateResponse(BaseModel):
    """responses"""
    encourage: str
    discourage: str

class AnalysisResponse(BaseModel):
    """Complete analysis response"""
    success: bool
    data: Dict[str, Any]
