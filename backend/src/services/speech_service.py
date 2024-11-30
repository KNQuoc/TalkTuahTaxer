from openai import AsyncOpenAI
from fastapi import HTTPException
import io
import os
import base64
from uuid import uuid4
from dotenv import load_dotenv
from datetime import datetime
from typing import Optional, Dict, Any, List
from .persona_service import PersonaCharacteristics, Character

class SpeechService:
    def __init__(self):
        """Initialize the OpenAI client with API key from environment"""
        load_dotenv()
        self.client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.conversation_history = {}
        # Available voices: alloy, echo, fable, onyx, nova, shimmer

    async def start_debate(self, product_details: dict) -> Dict:
        """Start a new debate and return session_id"""
        session_id = str(uuid4())

        # Generate initial responses
        initial_debate = await self._generate_initial_debate(product_details)

        # Store in conversation history
        self.conversation_history[session_id] = {
            "product": product_details,
            "messages": [
                initial_debate["encourage"],
                initial_debate["discourage"]
            ]
        }

        return {
            "session_id": session_id,
            "responses": initial_debate
        }

    async def continue_debate(self, session_id: str) -> Dict:
        """Continue existing debate using stored history"""
        if session_id not in self.conversation_history:
            raise HTTPException(status_code=404, detail="Debate session not found")

        session = self.conversation_history[session_id]
        product_details = session["product"]
        previous_messages = session["messages"]

        # Get last speaker and determine next speaker
        last_speaker = previous_messages[-1]["character"].lower()
        next_speaker = Character.KAI if last_speaker == "livvy" else Character.LIVVY

        # Generate next response
        response_text = await self._get_character_response(
            next_speaker,
            product_details,
            previous_messages
        )

        # Convert to speech
        voice = "onyx" if next_speaker == Character.KAI else "nova"
        response_audio = await self.text_to_speech(response_text, voice)

        # Create response object
        new_response = {
            "character": next_speaker.value.capitalize(),
            "text": response_text,
            "audio": base64.b64encode(response_audio).decode('utf-8'),
            "timestamp": datetime.now().isoformat()
        }

        # Add to conversation history
        session["messages"].append(new_response)

        return new_response

    async def _generate_initial_debate(self, product_details: dict) -> Dict:
        """Generate opening statements from both characters"""
        # Livvy's initial take
        livvy_response = await self._get_character_response(
            Character.LIVVY,
            product_details,
            None
        )

        # Convert to initial debate format
        initial_livvy = {
            "character": "Livvy",
            "text": livvy_response
        }

        # Kai's response to Livvy
        kai_response = await self._get_character_response(
            Character.KAI,
            product_details,
            [initial_livvy]
        )

        # Convert both to speech
        livvy_audio = await self.text_to_speech(livvy_response, "nova")
        kai_audio = await self.text_to_speech(kai_response, "onyx")

        return {
            "encourage": {
                "character": "Livvy",
                "text": livvy_response,
                "audio": base64.b64encode(livvy_audio).decode('utf-8'),
                "timestamp": datetime.now().isoformat()
            },
            "discourage": {
                "character": "Kai",
                "text": kai_response,
                "audio": base64.b64encode(kai_audio).decode('utf-8'),
                "timestamp": datetime.now().isoformat()
            }
        }

    async def generate_debate_response(
        self,
        product_details: dict,
        previous_messages: Optional[List[Dict]] = None
    ) -> Dict:
        """Generate a debate response between Livvy and Kai"""
        try:
            if not previous_messages:
                return await self._generate_initial_debate(product_details)
            else:
                # Get the last speaker and determine who speaks next
                last_speaker = previous_messages[-1]["character"].lower()
                next_speaker = Character.KAI if last_speaker == "livvy" else Character.LIVVY
                
                # Generate the next response
                response_text = await self._get_character_response(
                    next_speaker,
                    product_details,
                    previous_messages
                )
                
                # Convert to speech with appropriate voice
                voice = "fable" if next_speaker == Character.KAI else "nova"
                response_audio = await self.text_to_speech(response_text, voice)
                
                return {
                    "character": next_speaker.value.capitalize(),
                    "text": response_text,
                    "audio": base64.b64encode(response_audio).decode('utf-8'),
                    "timestamp": datetime.now().isoformat()
                }
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to generate debate response: {str(e)}"
            ) from e
        
    async def _get_character_response(
        self,
        character: Character,
        product_details: dict,
        previous_messages: Optional[List[Dict]]
    ) -> str:
        """Generate a response considering budget threshold"""
        try:
            # Get base personality prompt
            personality = (
                PersonaCharacteristics.get_livvy_prompt()
                if character == Character.LIVVY
                else PersonaCharacteristics.get_kai_prompt()
            )

            # Add threshold-specific guidance
            price = product_details['price']
            threshold = product_details['threshold']
            if character == Character.LIVVY:
                if price > threshold:
                    personality += "\nThe item is over budget, so while staying positive, acknowledge the budget concern."
                else:
                    personality += "\nThe item is within budget, so emphasize the smart financial decision."
            else:  # Kai
                if price > threshold:
                    personality += "\nThe item is over budget, so strongly emphasize the budget violation."
                else:
                    personality += "\nEven though it's within budget, question if it's the best use of money."

            prompt = self._build_character_prompt(character, product_details, previous_messages)

            response = await self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": personality},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.9
            )
            
            return response.choices[0].message.content
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to get character response: {str(e)}"
            ) from e

    def _build_character_prompt(
        self,
        character: Character,
        product_details: dict,
        previous_messages: Optional[List[Dict]]
    ) -> str:
        """Build a contextual prompt for character response"""
        
        price = product_details['price']
        threshold = product_details['threshold']
        price_difference = price - threshold
        
        budget_context = (
            f"This item costs ${price:.2f}, which is ${abs(price_difference):.2f} "
            f"{'over' if price_difference > 0 else 'under'} "
            f"the budget threshold of ${threshold:.2f}."
        )
        
        base_prompt = f"""About this product: {product_details['title']}
        Price Context: {budget_context}"""
        
        if character == Character.LIVVY:
            if price <= threshold:
                base_prompt += "\nThe price is within budget - focus on value and positive aspects!"
            else:
                base_prompt += "\nThe price is over budget - focus on justifying the extra cost!"
        else:  # Kai
            if price <= threshold:
                base_prompt += "\nEven though it's within budget, suggest if the money could be better used!"
            else:
                base_prompt += "\nStrongly emphasize how much it exceeds the budget!"

        if previous_messages:
            conversation = "\n".join([
                f"{msg['character']}: {msg['text']}"
                for msg in previous_messages[-2:]  # Last 2 messages for context
            ])
            base_prompt += f"\n\nPrevious conversation:\n{conversation}"

        return base_prompt

    async def text_to_speech(self, text: str, voice: Optional[str] = None) -> bytes:
        """
        Convert text to speech using OpenAI's text-to-speech API.
        Return the audio data as bytes that can be directly streamed to the client
        """
        try:
            response = await self.client.audio.speech.create(
                model="tts-1-hd",  # The text-to-speech model
                voice=voice,
                input=text
            )

            return response.content

        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Text-to-speech conversion failed: {str(e)}"
            ) from e
        
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
            ) from e

async def test_openai_connection(self):
    """Test the OpenAI connection with a simple completion"""
    try:
        # Using gpt-3.5-turbo, which is more cost-effective for testing
        response = await self.client.chat.completions.create(
            model="gpt-4o-mini",  # Using the correct model name
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
        ) from api_error

    except self.client.APIError as api_error:
        # Handle API-specific errors
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI API error: {str(api_error)}"
        ) from api_error

    except Exception as e:
        # Handle any other unexpected errors
        raise HTTPException(
            status_code=500,
            detail=f"OpenAI connection test failed: {str(e)}"
        ) from e
