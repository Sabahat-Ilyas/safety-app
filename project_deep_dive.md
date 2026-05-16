# Safety App: Project Deep Dive

This document provides a comprehensive breakdown of every feature, technology, and implementation detail used in the Safety App.

---

## 1. Core Technology Stack

The project uses a **Full-Stack JavaScript** architecture:

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | A fast, modern library for building the user interface. |
| **Backend** | **Node.js + Express** | The server that handles API requests, database logic, and integrations. |
| **Styling** | **Tailwind CSS** | Used for rapid, responsive, and modern UI styling. |
| **Animations** | **Framer Motion** | Provides smooth, professional transitions and micro-animations. |
| **Icons** | **Lucide React** | A clean and consistent icon set used throughout the app. |
| **Database** | **JSON Files** | Simplified persistent storage (`users.json`, `contacts.json`) for quick setup. |

---

## 2. Key Features & Their Implementation

### 🛡️ 1. Safety Dashboard ([AISafetyStatus.jsx](file:///d:/safety%20app/client/src/components/dashboard/AISafetyStatus.jsx))
- **What it does**: Provides a high-level overview of the user's safety status.
- **Tech used**: `lucide-react` for icons, `React Hooks` for state management.
- **Implementation**: It includes a "Quick Scan" feature that simulates environment analysis to reassure the user.

### 🎙️ 2. Voice SOS Detection ([VoiceSOS.jsx](file:///d:/safety%20app/client/src/pages/VoiceSOS.jsx) & [useVoiceRecognition.js](file:///d:/safety%20app/client/src/features/useVoiceRecognition.js))
- **What it does**: Automatically triggers an SOS alert if the user shouts for help.
- **Tech used**: **Web Speech API** (`webkitSpeechRecognition`).
- **Implementation**: A custom hook ([useVoiceRecognition](file:///d:/safety%20app/client/src/features/useVoiceRecognition.js#3-88)) monitors the microphone for keywords like "help", "emergency", or "danger". When detected, it calls the SOS trigger.

### 🤖 3. AI Safety Advisor ([AISafety.jsx](file:///d:/safety%20app/client/src/pages/AISafety.jsx))
- **What it does**: A proactive AI assistant that gives safety advice.
- **Tech used**: **Google Gemini 1.5 Flash API**.
- **Implementation**: User messages are sent to the backend, which consults Gemini AI to provide actionable, concise safety tips. It includes a fallback system if the API key is missing.

### 📍 4. Location Tracking ([Location.jsx](file:///d:/safety%20app/client/src/pages/Location.jsx) & [LocationCard.jsx](file:///d:/safety%20app/client/src/components/features/LocationCard.jsx))
- **How it works**: Uses the browser's **Geolocation API** to get the user's coordinates.
- **Display**: Uses **Leaflet (React-Leaflet)** to show the user's position on a map.

### 📞 5. Emergency Contacts ([Contacts.jsx](file:///d:/safety%20app/client/src/pages/Contacts.jsx))
- **What it does**: Allows users to manage a list of trusted people to alert in an emergency.
- **Tech used**: `libphonenumber-js` for international phone number validation.
- **Implementation**: Contacts are saved to `contacts.json` on the server and are notified during an SOS alert.

### ⌛ 6. Safety Timer ([SafetyTimer.jsx](file:///d:/safety%20app/client/src/pages/SafetyTimer.jsx))
- **What it does**: A "check-in" timer. If the user doesn't deactivate it before time runs out, an alert is sent.
- **Implementation**: Uses standard JavaScript `setInterval` logic combined with backend alert triggers.

### 🎭 7. Fake Call ([FakeCall.jsx](file:///d:/safety%20app/client/src/pages/FakeCall.jsx))
- **What it does**: Simulates an incoming phone call to help the user exit uncomfortable or unsafe situations.
- **Implementation**: Uses a simulated caller UI and audio to provide a realistic deterrent.

---

## 3. Backend Integrations

### 💬 SMS Alerts (Twilio)
- **Integration**: Found in [server/index.js](file:///d:/safety%20app/server/index.js).
- **Logic**: When an alert is triggered (via Voice or button), the server uses the **Twilio API** to send automated SMS messages to all saved emergency contacts.

### 🔐 Authentication ([Login.jsx](file:///d:/safety%20app/client/src/pages/Login.jsx), [Signup.jsx](file:///d:/safety%20app/client/src/pages/Signup.jsx))
- **Logic**: A simple but effective email/password system that persists users in `users.json`. It includes validation to ensure only registered users can access the dashboard.

---

## 4. File Structure Overview

- **/client**: Contains the entire frontend application.
  - `/src/pages`: Individual screens like Home, Login, VoiceSOS.
  - `/src/components`: Reusable UI elements like buttons and cards.
  - `/src/features`: Logic hooks like voice recognition.
- **/server**: Contains the backend API.
  - [index.js](file:///d:/safety%20app/server/index.js): The heart of the server where all routes and AI logic live.
  - `users.json` / `contacts.json`: Our simplified database.
