# TalkTuahTaxer 🛒

We've all been there—late-night scrolling turns into “just one more thing in the cart.” Whether it’s grabbing the latest gadgets, splurging on unnecessary decor, or stocking up on way too many snacks, sticking to a budget can feel impossible. Traditional budgeting apps? Too passive. Sheer willpower? Let’s be real. That’s where TalkTuahTaxer steps in.
It’s your no-nonsense spending buddy, ready to call you out before you hit Confirm Purchase and help you think twice about that “essential” fifth pair of headphones.

## What It Does
**TalkTuahTaxer** is a Chrome extension designed to help you control your online spending. Whenever you're on Amazon checkout page, it locks the *BUY NOW* button and throws you into a scary-basement-style scenario! Two influencers will argue your purchase:
- **Kai Cenat**: Explains how buying this will give you negative aura and why you should not buy the item
- **Livvy Dunne**: Lure you into buying the item by stating how it can help you.

![Kai Cenat](talktuahtaxer/public/KaiCenat.png) ![Livvy Dunne](talktuahtaxer/public/LivvyDunne.png)
The arguments are based on your monthly budget, previous spending, and the items in your cart. By making you think twice about the pros and cons, **TalkTuahTaxer** helps you make more informed, mindful financial decisions before you proceed with any purchase.
![CaseOh](talktuahtaxer/public/CaseOh.png)

## How We Built It
we built the user interface using react keeping it clean and sigma-worthy, The backend is the vanilla cream of Node.js and FastAPI. We used openAI for conversation between Kai Cenat, Livvy Dunne, and CaseOh. As for text-to-speech, we used ElevenLabs (Goated)

## Challenges We Ran Into
Backend and Frontend Integration: Ensuring seamless communication between the backend and frontend was a significant challenge. It required a lot of debugging and optimization to maintain smooth functionality and cordination. 
Dynamic Content Handling: Amazon’s dynamicly changing content required us to create adaping dynamic scripts, ensuring they remained robust and up-to-date.

## Accomplishments That We're Proud Of
Making Finance Engaging and Fun: We succeeded in turning financial management into an enjoyable experience, encouraging users (specially gen z and alpha) to rethink their spending habits and make more responsible decisions—one Don Apollo Chicken at a time.
Our team’s dedication shone through during a 24+ hour call in a single day. From late-night brainstorming sessions to seamless collaboration, we demonstrated commitment and synergy throughout the project.

## What we learned
Innovative Approaches: Adapting creative, engaging methods can help younger generations understand and adopt essential concepts across different fields. We also learned that We learned that saving money is more than practical—it’s empowering. By making financial management accessible and fun, we’re helping users take control of their spending habits.

## Features 🌟

### Core Functionality
- 🎭 Interactive debates between two distinct personalities:
  - Livvy Dunne (Encouraging) 💅: LSU gymnast and social media star
  - Kai Cenat (Discouraging) 😤: Famous streamer with street-smart takes
- 🔊 Real-time voice synthesis with unique character voices
- 💬 Synchronized text and audio display
- 💰 Customizable price threshold settings
- 🎯 Smart product analysis
- ⚡ Real-time response generation

### Technical Features
- OpenAI integration for intelligent text generation
- ElevenLabs voice synthesis (Brittney for Livvy, Tyrone for Kai)
- Synchronized audio streaming and text display
- Chrome Storage API integration
- Dynamic UI elements

## Tech Stack 🛠️

### Frontend
- React
- TypeScript
- Tailwind CSS
- Chrome Extensions API

### Backend
- FastAPI
- OpenAI API (GPT-4o mini)
- ElevenLabs API (Text-to-Speech Streaming)
- Python 3.12+

### Required API Keys
- OpenAI API Key
- ElevenLabs API Key

## Installation & Setup 🚀
### Backend Setup
1. Clone the repository:
```bash
git clone https://github.com/KNQuoc/TalkTuahTaxer.git
cd TalkTuahTaxer
```

2. Set up Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Create .env file:
```bash
OPENAI_API_KEY=your_openai_key_here
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

5. Run the backend server:
```bash
uvicorn src.main:app --reload
```

### Frontend Setup

1. Install Dependencies:
```bbash
cd talktuahtaxer
npm install
```

2. Build the extension
```bash
npm run build
```

3. Load in Chrome:
- Open Chrome and navigate to `chrome://extensions/`
- Enable "Developer mode"
- Click "Load unpacked"
- Select the `talktuahtaxer/dist` directory

## API Endpoints 📡

1. Start Debate
```bash
POST /api/v1/start-debate
```

Request body:
```bash
jsonCopy{
  "title": "Product Name",
  "price": 199.99,
  "threshold": 150.00
}
```

Response Body:
```bash
{
  "success": true,
  "session_id": "{unique_session_id}",
  "data": {
    "responses": {
      "encourage": {
        "text": "Livvy's response",
        "character": "Livvy"
      },
      "discourage": {
        "text": "Kai's response",
        "character": "Kai"
      }
    }
  }
}
```

2. Get Audio Stream
```bash
GET /get-audio/{session_id}/{character}
```
character: 'livvy' or 'kai'  
Returns: Audio stream (MP3)

## Usage 🎮

1. Navigate to any Amazon product page
2. Set your price threshold using the slider
3. Watch and listen as Livvy and Kai debate your potential purchase
4. Make your decision based on their arguments

## Development 👩‍💻

1. Access API documentation:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

2. Testing API:
```bash
# Start a debate
curl -X POST http://localhost:8000/api/v1/start-debate \
-H "Content-Type: application/json" \
-d '{
  "title": "Nike Air Max",
  "price": 199.99,
  "threshold": 150.00
}'

# Get audio stream
curl http://localhost:8000/api/v1/get-audio/{session_id}/livvy > livvy_response.mp3
```

## Contributing 🤝

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## What's next for TalkTuahTaxer
Expaaaaaaand, Why stop at Amazon? We’re setting our sights on platforms like eBay and Walmart to make the magic happen everywhere. Introducing a scoring system to track how responsible (or skibidi) you are with your spending habits—because accountability should come with style. Integrate Retell AI for voice chat between users and the extension—because sometimes, you really need to TalkTuah before you buy.