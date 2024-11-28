from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from ..services.speech_service import SpeechService
from pydantic import BaseModel
from typing import Optional
import io
import base64
from ..core.models import AnalysisRequest, AnalysisResponse
from ..services.speech_service import test_openai_connection
from ..services.conversation_service import PersonaType

router = APIRouter(prefix="/v1")
speech_service = SpeechService()

class ProductRequest(BaseModel):
    title: str
    price: float
    description: Optional[str] = None
    previous_response: Optional[str] = None
    responding_persona: Optional[str] = None

class VoiceRequest(BaseModel):
    text: str
    voice: Optional[str] = None

@router.post("/debate-purchase")
async def debate_purchase(product: ProductRequest):
    """Generate a debate between encouraging and discouraging personas"""
    try:
        persona = PersonaType(product.responding_persona) if product.responding_persona else None
        
        response = await speech_service.generate_debate_response(
            product.dict(),
            product.previous_response,
            persona
        )
        
        return JSONResponse({
            "success": True,
            "data": response
        })
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate debate response: {str(e)}"
        )

@router.post("/generate-speech-response")
async def generate_speech_response(product: ProductRequest):
    """
    Generate and convert to speech both encouraging and discouraging responses
    Returns both text and audio data for each response.
    """
    try:
        # First, generate the text responses
        encourage, discourage = await speech_service.generate_devil_advocate_response({
            "title": product.title,
            "price": product.price,
            "description": product.description
        })

        # Convert both responses to speech
        encourage_speech = await speech_service.text_to_speech(encourage)
        discourage_speech = await speech_service.text_to_speech(discourage)
        
        # Convert binary audio data to base64 for JSON response
        encourage_audio_b64 = base64.b64encode(encourage_speech).decode('utf-8')
        discourage_audio_b64 = base64.b64encode(discourage_speech).decode('utf-8')

        # Return both text and audio data
        return JSONResponse({
            "success": True,
            "data": {
                "text": {
                    "encourage": encourage,
                    "discourage": discourage
                },
                "audio": {
                    "encourage": encourage_audio_b64,
                    "discourage": discourage_audio_b64
                }
            }
        })

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate speech response: {str(e)}"
        )

@router.post("/text-to-speech")
async def convert_text_to_speech(request: VoiceRequest):
    """Convert any text to speech using specified voice"""
    try:
        speech_data = await speech_service.text_to_speech(request.text, request.voice)
        
        # Create a BytesIO object from the bytes data
        audio_stream = io.BytesIO(speech_data)
        
        # Return the audio as a streaming response
        return StreamingResponse(
            audio_stream,
            media_type="audio/mpeg",
            headers={
                "Content-Disposition": "attachment; filename=speech.mp3"
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/test-connection")
async def test_connection():
    """Test the OpenAI connection"""
    try:
        await test_openai_connection()
        return {
            "status": "success",
            "message": "OpenAI connection successful"
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI connection failed: {str(e)}"
        )

@router.post("/chat/{session_id}")
async def chat(session_id: str, message: str):
    """Handles ongoing conversation with context"""
    response_text = await speech_service.generate_response(session_id, message)
    response_audio = await speech_service.text_to_speech(response_text)
    
    return {
        "success": True,
        "data": {
            "text": response_text,
            "audio": base64.b64encode(response_audio).decode('utf-8')
        }
    }
