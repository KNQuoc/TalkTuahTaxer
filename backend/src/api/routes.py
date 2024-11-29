from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse
from typing import Optional, List, Dict
import io
from ..core.models import DebateResponse, ProductRequest
from ..services.speech_service import test_openai_connection, SpeechService

router = APIRouter()
speech_service = SpeechService()

@router.post("/debate", response_model=DebateResponse)
async def start_or_continue_debate(product: ProductRequest):
    """
    Start or continue a debate about a product purchase.
    If no previous_messages provided, starts a new debate.
    If previous_messages provided, continues the existing debate.
    """
    try:
        
        # Convert the Pydantic model to a dict
        product_dict = {
            "title": product.title,
            "price": product.price,
            "description": product.description
        }
        
        response = await speech_service.generate_debate_response(
            product_details=product_dict,
            previous_messages=product.previous_messages
        )
        
        return JSONResponse({
            "success": True,
            "data": response
        })
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e

@router.post("/start-debate")
async def start_debate(product: ProductRequest):
    """Start a new debate session"""
    try:
        response = await speech_service.start_debate(product.dict())
        return {
            "success": True,
            "data": response
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e

@router.post("/continue-debate/{session_id}")
async def continue_debate(session_id: str):
    """Continue an existing debate using stored history"""
    try:
        response = await speech_service.continue_debate(session_id)
        return {
            "success": True,
            "data": response
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) from e

@router.get("/debate-history/{session_id}")
async def get_debate_history(session_id: str):
    """Get the full conversation history for a debate"""
    if session_id not in speech_service.conversation_history:
        raise HTTPException(status_code=404, detail="Debate session not found")
        
    return {
        "success": True,
        "data": speech_service.conversation_history[session_id]
    }

# @router.post("/generate-speech-response")
# async def generate_speech_response(product: ProductRequest):
#     """
#     Generate and convert to speech both encouraging and discouraging responses
#     Returns both text and audio data for each response.
#     """
#     try:
#         # First, generate the text responses
#         encourage, discourage = await speech_service.generate_devil_advocate_response({
#             "title": product.title,
#             "price": product.price,
#             "description": product.description
#         })

#         # Convert both responses to speech
#         encourage_speech = await speech_service.text_to_speech(encourage)
#         discourage_speech = await speech_service.text_to_speech(discourage)
        
#         # Convert binary audio data to base64 for JSON response
#         encourage_audio_b64 = base64.b64encode(encourage_speech).decode('utf-8')
#         discourage_audio_b64 = base64.b64encode(discourage_speech).decode('utf-8')

#         # Return both text and audio data
#         return JSONResponse({
#             "success": True,
#             "data": {
#                 "text": {
#                     "encourage": encourage,
#                     "discourage": discourage
#                 },
#                 "audio": {
#                     "encourage": encourage_audio_b64,
#                     "discourage": discourage_audio_b64
#                 }
#             }
#         })

#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Failed to generate speech response: {str(e)}"
#         )

@router.post("/text-to-speech")
async def convert_text_to_speech(request):
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
        ) from e

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
