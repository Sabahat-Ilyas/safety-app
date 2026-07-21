# Guardian Safety App

Guardian is a comprehensive, full-stack personal safety application designed to provide immediate assistance, emergency tracking, and AI-powered threat detection. It is built as a web application with the ability to be packaged as a native Android app using Capacitor.

## Architecture Overview

The project is structured as a monorepo containing both the frontend client and the backend API server.

- **Frontend (`/client`)**: A modern single-page React application powered by Vite.
- **Backend (`/api`)**: A robust Node.js and Express server that handles data persistence, authentication, and external API integrations (SMS, Email, AI).

---

## Technology Stack & Libraries Used

### 馃帹 Frontend (Client-Side)
*   **React (`react`, `react-dom`)**: The core library used for building the interactive user interface.
*   **Vite (`vite`, `@vitejs/plugin-react`)**: A lightning-fast development server and bundler used instead of Create React App.
*   **Tailwind CSS (`tailwindcss`, `@tailwindcss/postcss`)**: A utility-first CSS framework used for all styling. Enables rapid, responsive UI design without writing custom CSS files.
*   **React Router (`react-router-dom`)**: Handles navigation between different screens (Login, Dashboard, First Aid, Profile) without reloading the page.
*   **Lucide React (`lucide-react`)**: Provides the beautiful, consistent SVG icons used throughout the app (e.g., arrows, user icons, bells, shields).
*   **Leaflet & React-Leaflet (`leaflet`, `react-leaflet`)**: Open-source mapping libraries used to render interactive maps and pinpoint the user's real-time GPS location during emergencies.
*   **Capacitor (`@capacitor/core`, `@capacitor/android`, `@capacitor/cli`)**: Used to convert this web application into a deployable native Android APK file.

### 鈿欙笍 Backend (Server-Side)
*   **Node.js & Express (`express`)**: The foundation of the API server. Handles routing for user authentication, profile updates, and triggering alerts.
*   **Google Generative AI (`@google/generative-ai`)**: Integrates the Gemini AI model to act as an AI Safety Advisor, analyze microphone transcripts, and process movement data to detect suspicious activity.
*   **Twilio (`twilio`)**: Used for sending automated SMS emergency alerts to the user's trusted contacts when an SOS is triggered.
*   **Nodemailer (`nodemailer`)**: Used for sending automated email notifications (e.g., password reset emails).
*   **Libphonenumber-js (`libphonenumber-js`)**: An advanced library used to strictly validate and format international phone numbers added to the emergency contacts list.
*   **Cors (`cors`)**: Middleware that allows the frontend (running on a different port) to securely communicate with the backend.
*   **Dotenv (`dotenv`)**: Securely loads environment variables (like API keys) from a `.env` file so they aren't hardcoded into the source code.

---

## How Data is Managed

Currently, the application uses local JSON files for persistent data storage. This mimics a real database for development purposes.

1.  **`api/users.json`**: Stores registered user accounts, passwords, full names, emails, and their app preferences (like Dark Mode toggles and Deactivation PINs).
2.  **`api/contacts.json`**: Stores the user's customized list of emergency contacts, categorized by type (family, emergency, custom).
3.  **`api/firstaid.json`**: Stores the dynamic emergency guides (CPR, Choking, etc.) that the frontend fetches and displays in the First Aid Guide screen.

## Project Scripts & Execution

- `npm run dev` (in `/client`): Starts the Vite frontend development server at `http://localhost:5173`.
- `npm start` (in root): Starts the Express backend API server at `http://localhost:5000`.

*Note: For local development, the Vite configuration (`vite.config.js`) proxies all API requests starting with `/api` to the backend server.*
