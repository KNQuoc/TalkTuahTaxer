from elevenlabs import ElevenLabs, VoiceSettings
from typing import Dict

class VoiceConfig:
    LIVVY_VOICE_ID = "kPzsL2i3teMYv0FxEYQ6"  # Brittney
    KAI_VOICE_ID = "X2j354mOfDROQk9ghjz4"    # Tyrone

class ElevenLabsService:
    def __init__(self, api_key: str):
        self.client = ElevenLabs(api_key=api_key)

    async def generate_streaming_audio(self, text: str, character: str):
        """Generate streaming audio based on character"""
        try:
            voice_id = (
                VoiceConfig.LIVVY_VOICE_ID if character.lower() == "livvy"
                else VoiceConfig.KAI_VOICE_ID
            )
            
            # Configure voice settings based on character
            if character.lower() == "livvy":
                voice_settings = VoiceSettings(
                    stability=0.71,  # More stable for clear, consistent speech
                    similarity_boost=0.75,  # Higher to match Livvy's enthusiastic tone
                    style=0.2,  # Moderate style for personality
                )
            else:  # Kai
                voice_settings = VoiceSettings(
                    stability=0.65,  # Slightly less stable for more dynamic speech
                    similarity_boost=0.8,  # Higher to match Kai's distinctive style
                    style=0.3,  # More style for Kai's energetic personality
                )

            # Generate audio stream
            audio_stream = self.client.text_to_speech.convert_as_stream(
                voice_id=voice_id,
                text=text,
                optimize_streaming_latency="0",  # Lowest latency
                output_format="mp3_22050_32",    # Good balance of quality and size
                voice_settings=voice_settings
            )

            return audio_stream

        except Exception as e:
            raise Exception(f"ElevenLabs streaming failed: {str(e)}")