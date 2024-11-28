from flask import Flask, request, jsonify, send_file
from google.cloud import texttospeech
import os
import openai

# Initialize Flask app
app = Flask(__name__)

# Set up Google Cloud credentials
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "path to api key"

# Generate text using OpenAI GPT-3
openai.api_key = 'your-openai-api-key'
def generate_text(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",  # or another model
        prompt=prompt,
        max_tokens=150
    )
    return response.choices[0].text.strip()

# Route for generating audio from text
@app.route('/generate-audio', methods=['POST'])
def generate_audio():
    try:
        # Get the prompt for GPT from the frontend request
        data = request.get_json()
        prompt = data.get("prompt", "No prompt provided")

        # Generate text using OpenAI GPT-3
        generated_text = generate_text(prompt)

        # Initialize TTS client
        client = texttospeech.TextToSpeechClient()
        synthesis_input = texttospeech.SynthesisInput(text=generated_text)
        voice = texttospeech.VoiceSelectionParams(
            language_code="en-US",
            ssml_gender=texttospeech.SsmlVoiceGender.NEUTRAL,
        )
        audio_config = texttospeech.AudioConfig(
            audio_encoding=texttospeech.AudioEncoding.MP3
        )

        # Convert text to speech
        response = client.synthesize_speech(
            input=synthesis_input,
            voice=voice,
            audio_config=audio_config
        )

        # Save audio to file
        audio_path = "output_audio.mp3"
        with open(audio_path, "wb") as audio_file:
            audio_file.write(response.audio_content)

        # Return the audio file
        return send_file(audio_path, mimetype="audio/mpeg")
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
