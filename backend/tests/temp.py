# main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import AsyncOpenAI
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="Simple OpenAI Integration")

# Configure OpenAI with API key from environment variables
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Define request model for chat messages
class ChatMessage(BaseModel):
    message: str

# Define route for basic chat completion
@app.post("/chat")
async def chat_with_ai(chat_input: ChatMessage):
    """
    A simple endpoint that sends a message to OpenAI and returns the response.
    """
    try:
        # Create a chat completion using OpenAI's API
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using the most common model
            messages=[
                {"role": "user", "content": chat_input.message}
            ]
        )
        
        # Extract and return the AI's response
        return {
            "response": response.choices[0].message.content,
            "status": "success"
        }
        
    except client.AuthenticationError:
        # Handle authentication errors (wrong API key)
        raise HTTPException(
            status_code=401,
            detail="OpenAI API key is invalid"
        )
        
    except client.APIError as e:
        # Handle API errors
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(e)}"
        )
        
    except Exception as e:
        # Handle any other errors
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}"
        )

# Add a health check endpoint
@app.get("/health")
async def health_check():
    """
    Simple health check endpoint to verify the API is running
    """
    return {"status": "healthy"}

# Add a test endpoint for OpenAI connection
@app.get("/test-openai")
async def test_openai():
    """
    Test the OpenAI connection with a simple completion
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say hello!"}
            ],
            max_tokens=10  # Limit response length for testing
        )
        
        return {
            "status": "success",
            "message": response.choices[0].message.content
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI connection test failed: {str(e)}"
        )

# If running this file directly, start the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)