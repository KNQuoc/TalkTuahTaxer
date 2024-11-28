from openai import AsyncOpenAI
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import io
import os
import base64
from dotenv import load_dotenv
from typing import Optional, Dict, Any
from .conversation_service import PersonaType, ConversationManager


class SpeechService:
    def __init__(self):
        """Initialize the OpenAI client with API key from environment"""
        load_dotenv()
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        # Available voices: alloy, echo, fable, onyx, nova, shimmer
        self.default_voice = "nova" 
        self.conversation_manager = ConversationManager()
        # self.conversations = {} 
        
    async def generate_debate_response(
        self, 
        product_details: dict, 
        previous_response: Optional[str] = None, 
        responding_persona: Optional[PersonaType] = None
        ) -> Dict[str, Any]:
        """Generate a response in the ongoing debate about the purchase"""
        try:
            # If no previous response, generate initial perspectives
            if previous_response is None:
                encourage_text = await self._generate_single_perspective(
                    product_details, PersonaType.ENCOURAGE
                )
                discourage_text = await self._generate_single_perspective(
                    product_details, PersonaType.DISCOURAGE
                )

                # Convert both to speech
                encourage_audio = await self.text_to_speech(encourage_text)
                discourage_audio = await self.text_to_speech(discourage_text)

                return {
                    "text": {
                        "encourage": encourage_text,
                        "discourage": discourage_text
                    },
                    "audio": {
                        "encourage": base64.b64encode(encourage_audio).decode('utf-8'),
                        "discourage": base64.b64encode(discourage_audio).decode('utf-8')
                    }
                }
            
            # For follow-up responses in the debate
            else:
                if responding_persona is None:
                    raise ValueError("Responding persona must be specified for follow-up responses")

                response_text = await self._generate_debate_continuation(
                    product_details,
                    previous_response,
                    responding_persona
                )
                response_audio = await self.text_to_speech(response_text)

                return {
                    "text": response_text,
                    "audio": base64.b64encode(response_audio).decode('utf-8')
                }
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate debate response: {str(e)}"
            )

    async def _generate_single_perspective(self, product_details: dict, persona: PersonaType) -> str:
        """Generate initial response from a single persona"""
        prompt = f"""About this product:
        Title: {product_details['title']}
        Price: ${product_details['price']}
        Description: {product_details.get('description', '')}
        
        Give your perspective on this purchase in a conversational way.
        Keep it under 50 words for clear speech output.
        """

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.conversation_manager.get_persona_prompt(persona)},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9
        )
        
        return response.choices[0].message.content

    async def _generate_debate_continuation(
        self, product_details: dict, previous_response: str, 
        responding_persona: PersonaType
    ) -> str:
        """Generate a response that continues the debate"""
        prompt = f"""Previous point: {previous_response}

        About the product:
        Title: {product_details['title']}
        Price: ${product_details['price']}
        
        Respond to the previous point about this purchase, 
        defending your perspective while acknowledging their points.
        Keep it under 50 words for clear speech output.
        """

        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": self.conversation_manager.get_persona_prompt(responding_persona)},
                {"role": "user", "content": prompt}
            ],
            temperature=0.9
        )
        
        return response.choices[0].message.content
        
    def get_or_create_conversation(self, session_id: str):
        if session_id not in self.conversations:
            self.conversations[session_id] = ConversationHistory()
        return self.conversations[session_id]

    async def generate_response(self, session_id: str, user_input: str):
        conversation = self.get_or_create_conversation(session_id)
        
        # Add user's input to history
        conversation.add_message("user", user_input)
        
        try:
            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Gen-Z shopping assistant..."},
                    *conversation.get_context()  # Include full conversation history
                ]
            )
            
            assistant_response = response.choices[0].message.content
            
            # Add assistant's response to history
            conversation.add_message("assistant", assistant_response)
            
            return assistant_response

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )
    
    async def generate_devil_advocate_response(self, product_details: dict) -> tuple[str, str]:
        """Generate both encouraging and discouraging responses"""
        try:
            # Create a prompt that will generate both perspectives
            prompt = f"""As a Gen-Z shopping assistant, create two contrasting responses about buying:
            Product: {product_details['title']}
            Price: ${product_details['price']}
            
            Create two responses:
            1. An encouraging response supporting the purchase
            2. A discouraging response against the purchase
            
            Requirements:
            - Use Gen-Z slang and current memes
            - Keep each response under 50 words for clear speech
            - Make valid points while being entertaining
            - Clearly separate the responses with '====' between them
            """

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a Gen-Z shopping assistant who speaks in memes and modern slang."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.9,  # Higher temperature for more creative responses
            )
            
            # print(response)

            # Split the response into encouraging and discouraging parts
            full_response = response.choices[0].message.content
            print(full_response)
            parts = full_response.split('====')
            print(parts)
            encourage = parts[0].strip()
            discourage = parts[1].strip() if len(parts) > 1 else "Hmm, maybe think twice about this purchase?"

            return encourage, discourage

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate response: {str(e)}"
            )

    async def text_to_speech(self, text: str, voice: Optional[str] = None) -> bytes:
        """
        Convert text to speech using OpenAI's text-to-speech API.
        Return the audio data as bytes that can be directly streamed to the client
        """
        try:
            response = await self.client.audio.speech.create(
                model="tts-1",  # The text-to-speech model
                voice=voice or self.default_voice,
                input=text
            )
            
            # # Get the speech data as bytes
            # speech_data = io.BytesIO()
            # response.write_to_file(speech_data)
            # speech_data.seek(0)
            # print("RESPONSE.CONTENT=============",response.content)
            return response.content

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Text-to-speech conversion failed: {str(e)}"
            )

async def test_openai_connection(self):
    """Test the OpenAI connection with a simple completion"""
    try:
        # Using gpt-3.5-turbo, which is more cost-effective for testing
        response = await self.client.chat.completions.create(
            model="gpt-3.5-turbo",  # Using the correct model name
            messages=[
                {"role": "system", "content": "You are a helpful assistant."},
                {"role": "user", "content": "Say hello in a creative way."}
            ],
            max_tokens=50  # Limiting response length for testing
        )
        
        # Extract the message content and return a structured response
        message_content = response.choices[0].message.content
        return {
            "status": "success",
            "message": message_content,
            "model_used": "gpt-3.5-turbo"
        }
        
    except self.client.AuthenticationError as auth_error:
        # Handle authentication issues (like invalid API key)
        raise HTTPException(
            status_code=401,
            detail=f"OpenAI authentication failed: {str(auth_error)}"
        )
        
    except self.client.APIError as api_error:
        # Handle API-specific errors
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(api_error)}"
        )
        
    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI connection test failed: {str(e)}"
        )