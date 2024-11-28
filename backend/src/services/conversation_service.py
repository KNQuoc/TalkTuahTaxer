from enum import Enum
from typing import List, Dict

class PersonaType(Enum):
    ENCOURAGE = "encourage"
    DISCOURAGE = "discourage"

class ConversationManager:
    def __init__(self):
        self.conversations: Dict[str, List[Dict]] = {}

    def get_persona_prompt(self, persona: PersonaType) -> str:
        """Define the personality and style for each persona"""
        if persona == PersonaType.ENCOURAGE:
            return """You are an enthusiastic Gen-Z shopping assistant who encourages smart purchases.
                     Use trendy slang, emojis, and memes to explain why this purchase is worth it.
                     Focus on benefits, features, and positive impacts."""
        else:
            return """You are a budget-conscious Gen-Z shopping assistant who encourages saving money.
                     Use trendy slang, emojis, and memes to explain why this might not be the best purchase.
                     Focus on costs, alternatives, and practical considerations."""
        pass
