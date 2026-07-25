Guardian — AI-Powered Personal Safety App
What it does & the problem it solves

Guardian is an AI-powered personal safety app built for people who feel vulnerable while alone — whether commuting late at night, walking through an unfamiliar area, or simply wanting a safety net during everyday life. It targets women, students, solo travelers, children, and elderly users who want a fast, reliable way to alert trusted contacts and get real-time safety guidance if something feels wrong.

Instead of a static "panic button," Guardian layers AI on top of the emergency-response flow: it can analyze what's happening around the user (via conversation, transcript, or movement data) and decide whether the situation actually warrants an alert — reducing both false alarms and delayed responses.

Live URL: https://safety-app-one.vercel.app

Features
User authentication — sign up / log in
Emergency contacts management — add, view, and remove trusted contacts (family, emergency services, custom)
One-tap SOS alert — sends a real SMS (via Twilio) to all emergency contacts with the user's last known location
AI Safety Advisor chat — users can ask for safety advice in plain language and get calm, practical guidance
AI transcript danger analysis — analyzes live/recorded audio transcripts for signs of distress or threat
AI movement analysis — analyzes movement sensor data (speed, acceleration spikes, route deviation) to flag suspicious activity like a struggle or sudden fall
Works as a web app, and can be packaged as an Android app via Capacitor
The AI feature

Guardian's AI layer is powered by Google's Gemini API (gemini-1.5-flash) and drives three real-time features:

Safety Advisor Chat — a conversational assistant that gives short, calm, practical safety advice, and prioritizes directing users to the SOS button or local emergency services when danger is described.
Transcript Danger Analysis — takes a text transcript and returns a structured JSON verdict (isDanger, reason) on whether it contains signs of a threat.
Movement Anomaly Analysis — takes movement sensor data and returns a structured JSON verdict (activity, isSuspicious, reason) on whether the pattern looks abnormal (e.g. a fall or struggle).

System prompt used for the Safety Advisor Chat:

You are Guardian, an AI personal safety advisor inside a mobile safety app.
Your job: give short, calm, practical safety advice to the user based on their message.
If they describe an emergency or immediate danger, prioritize telling them to use the
app's SOS/alert button and contact local emergency services.
Keep responses under 80 words, warm but direct tone.

The transcript and movement analyzers use similar structured prompts that force the model to reply in strict JSON, so the app can act on the result programmatically (e.g., auto-triggering an alert).

Tools, services & models used
Frontend: React
Backend: Node.js / Express (deployed as Vercel serverless functions)
AI model: Google Gemini (gemini-1.5-flash) via @google/generative-ai
SMS/alerts: Twilio
Mobile packaging: Capacitor (for Android build)
Hosting: Vercel
Phone validation: libphonenumber-js
Screenshots

Add 3+ screenshots here before submitting — e.g. login screen, emergency contacts screen, SOS alert flow, AI chat in action.

Show Image Show Image Show Image

How to run this project locally
Prerequisites
Node.js (v18+)
A Gemini API key (Google AI Studio)
A Twilio account (SID, Auth Token, and a Twilio phone number)
Setup
bash
# Clone the repo
git clone https://github.com/Sabahat-Ilyas/safety-app.git
cd safety-app

# Install dependencies
npm install

# Create a .env file in the root with:
GEMINI_API_KEY=your_gemini_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Run the backend
npm start

# In a separate terminal, run the frontend (from /client)
cd client
npm install
npm run dev

The app will be available at http://localhost:5173 (frontend) with the API running on http://localhost:5000.

Building the Android app (optional)
bash
npx cap sync android
npx cap open android

Set API_BASE_URL in config.js to your live Vercel URL before building the APK.

What I learned

Building Guardian end-to-end taught me how to connect a real AI model to a safety-critical decision flow — not just generating text, but getting structured, actionable output (JSON) that the app can act on automatically. I also learned the importance of keeping API keys out of source control and wiring third-party services (Twilio) securely through environment variables on the hosting platform rather than in code.
