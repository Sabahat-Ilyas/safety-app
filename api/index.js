const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { isValidPhoneNumber } = require('libphonenumber-js');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// Static files are handled by Vercel directly

// Persistent Data Paths
const USERS_FILE = path.join(__dirname, 'users.json');
const CONTACTS_FILE = path.join(__dirname, 'contacts.json');

// Helper to save data
const saveToFile = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error saving ${file}:`, err);
  }
};

// Helper to load contacts
const loadContacts = () => {
  try {
    if (fs.existsSync(CONTACTS_FILE)) {
      const data = fs.readFileSync(CONTACTS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading contacts file:", err);
  }
  return [
    { id: 1, name: "Police", phone: "100", type: "emergency", country: "PK" },
    { id: 2, name: "Ambulance", phone: "101", type: "emergency", country: "PK" },
    { id: 3, name: "Mom", phone: "1234567890", type: "family", country: "PK" }
  ];
};

let contacts = loadContacts();

// Existing saveUsers helper updated to use general saveToFile
const saveUsers = (data) => saveToFile(USERS_FILE, data);

// Helper to load users
const loadUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error loading users file:", err);
  }
  return [
    { email: "user@example.com", password: "password123", name: "Internal Test User" }
  ];
};

let users = loadUsers();

// Routes
// API routes must come before the catch-all route

// Auth Routes
app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();

  if (users.find(u => u.email === normalizedEmail)) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const newUser = { name, email: normalizedEmail, password };
  users.push(newUser);
  saveUsers(users); // Persist to file
  
  console.log(`[AUTH] New user registered: ${normalizedEmail}`);
  res.status(201).json({ message: "User registered successfully" });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email === normalizedEmail);

  // Check if account exists
  if (!user) {
    console.log(`[AUTH] Login failed (Not Found): ${normalizedEmail}`);
    return res.status(404).json({ error: "Account does not exist. Please sign up first." });
  }

  // Check password
  if (user.password !== password) {
    console.log(`[AUTH] Login failed (Wrong Password): ${normalizedEmail}`);
    return res.status(401).json({ error: "Incorrect password" });
  }

  console.log(`[AUTH] Login success: ${normalizedEmail}`);

  res.json({
    message: "Login successful",
    user: { name: user.name, email: user.email }
  });
});

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = users.find(u => u.email === normalizedEmail);

  if (!user) {
    return res.status(404).json({ error: "No account found with that email address" });
  }

  // Set up Nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Guardian Safety App" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your Guardian Safety App Password",
    text: `Hello ${user.name},\n\nWe received a request to retrieve your password.\n\nYour current password is: ${user.password}\n\nIf you did not request this, please ignore this email.\n\nStay safe,\nThe Guardian Team`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`[AUTH] Password sent to: ${normalizedEmail}`);
    res.status(200).json({ message: "Password email sent successfully" });
  } catch (error) {
    console.error(`[AUTH] Error sending email to ${normalizedEmail}:`, error);
    res.status(500).json({ error: "Failed to send email. Please check server setup." });
  }
});

// GET /api/contacts - Get all emergency contacts
app.get('/api/contacts', (req, res) => {
  res.json(contacts);
});

// POST /api/contacts - Add a new contact
app.post('/api/contacts', (req, res) => {
  const { name, phone, type, country } = req.body;
  
  if (!name || !phone) {
    return res.status(400).json({ error: "Name and Phone are required" });
  }

  // Robust International Validation using libphonenumber-js
  const isValid = isValidPhoneNumber(phone.trim(), country || 'PK');
  if (!isValid) {
    return res.status(400).json({ error: "Invalid phone number format for the selected country" });
  }

  const newContact = { 
    id: Date.now(), 
    name: name.trim(), 
    phone: phone.trim(), 
    type: type || 'custom',
    country: country || 'PK' // Save country for accurate formatting later
  };
  contacts.push(newContact);
  saveToFile(CONTACTS_FILE, contacts); // Persist contacts
  res.status(201).json(newContact);
});

// DELETE /api/contacts/:id - Remove a contact
app.delete('/api/contacts/:id', (req, res) => {
  const { id } = req.params;
  contacts = contacts.filter(c => c.id != id);
  saveToFile(CONTACTS_FILE, contacts); // Persist deletion
  res.status(200).json({ message: "Contact removed" });
});

// POST /api/alert - Trigger SOS
app.post('/api/alert', async (req, res) => {
  const { location, type, reason } = req.body;
  console.log(`[SOS ALERT] Type: ${type}, Reason: ${reason}, Location:`, location);

  // Twilio SMS Integration
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const twilioNum = process.env.TWILIO_PHONE_NUMBER;

  if (sid && token && twilioNum && sid !== 'your_twilio_sid') {
    try {
      const client = twilio(sid, token);
      
      // Send to all emergency contacts
      for (const contact of contacts) {
        if (contact.type === 'emergency' || contact.id <= 3) { // Include first 3 family as well
            // Format phone number to E.164 for Twilio
            const phoneNumber = parsePhoneNumberFromString(contact.phone, contact.country || 'PK');
            const formattedPhone = phoneNumber ? phoneNumber.format('E.164') : contact.phone;

            await client.messages.create({
              body: `SOS ALERT! User is in danger. Location: ${location}. Triggered by: ${reason}`,
              from: twilioNum,
              to: formattedPhone
            });
            console.log(`[TWILIO] SMS sent to ${formattedPhone}`);
        }
      }
    } catch (err) {
      console.error("[TWILIO ERROR]", err.message);
    }
  } else {
    console.log("[TWILIO SKIP] Credentials not configured or placeholder detected.");
  }

  res.status(200).json({ success: true, message: "Alert processed successfully" });
});

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "MOCK_KEY");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an AI Safety Assistant for a personal safety app. 
  Your goal is to provide immediate, actionable safety advice to users who may be in danger. 
  
  GUIDELINES:
  1. If a user is in immediate danger, STRONGLY advise them to use the SOS button or call emergency services immediately.
  2. Provide practical tips (e.g., "Stay in well-lit areas", "Head towards a public place", "Keep your phone visible").
  3. Be professional, empathetic, and ultra-focused on safety. 
  4. Keep responses concise (under 3 sentences) and practical.
  5. If asked about your capabilities, mention you can analyze surroundings and provide safety guidance.`
});

// AI Chat Endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message } = req.body;
  console.log(`[AI CHAT] User: ${message}`);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'MOCK_KEY') {
      // Fallback to sophisticated mock if API key is not set
      const msg = message.toLowerCase();
      let reply = "I'm currently in basic safety mode. For real-time AI intelligence, please configure the API key. How can I help you stay safe?";

      if (msg.includes("help") || msg.includes("unsafe") || msg.includes("danger") || msg.includes("followed")) {
        reply = "I've detected a potential safety concern. Please head towards a crowded, well-lit area immediately and consider using the 'Fake Call' feature to deter attention.";
      } else if (msg.includes("hello") || msg.includes("hi")) {
        reply = "Hello! I am your AI Safety Advisor. I can help you navigate unsafe situations or provide quick safety tips. What's on your mind?";
      } else if (msg.includes("walk") || msg.includes("night")) {
        reply = "Walking at night can be risky. Ensure you're on a familiar route, keep your phone handy, and use the 'Safety Timer' feature in the app.";
      }

      return res.json({ reply });
    }

    const result = await model.generateContent(message);
    const response = await result.response;
    const reply = response.text();

    res.json({ reply });
  } catch (error) {
    console.error('Error with Gemini AI:', error);
    res.status(500).json({ error: "The AI Safety Advisor is temporarily unavailable. Please use the SOS button if you are in danger." });
  }
});

const analyzerModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are a hyper-sensitive AI Safety Analyzer for an emergency app. Analyze the provided audio transcription. Determine if the user is in danger or needs emergency assistance. 
  Err on the side of caution: if you detect subtle signs of fear, coercion, distress, stalking, or any potentially unsafe situation, treat it as an emergency.
  Respond ONLY with a valid JSON object in this format: { "isDanger": true/false, "reason": "short reason why" }. Do not wrap the JSON in backticks.`
});

// AI Transcript Analysis Endpoint
app.post('/api/ai/analyze-transcript', async (req, res) => {
  const { transcript } = req.body;
  console.log(`[AI ANALYZE] Transcript: ${transcript}`);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'MOCK_KEY') {
      // Fallback mock
      const msg = transcript.toLowerCase();
      let isDanger = false;
      let reason = "No immediate danger detected.";

      const emergencyKeywords = ['help', 'help me', 'bachao', 'emergency', 'save me', 'police', 'danger', 'madad', 'help please', 'following me', 'scared', 'attack'];
      
      if (emergencyKeywords.some(keyword => msg.includes(keyword))) {
        isDanger = true;
        reason = "Emergency keywords detected in the transcript.";
      }

      return res.json({ isDanger, reason });
    }

    const result = await analyzerModel.generateContent(transcript);
    const response = await result.response;
    let text = response.text().trim();
    
    // Attempt to parse JSON safely
    if (text.startsWith('```json')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (error) {
    console.error('Error with AI Transcript Analysis:', error);
    res.status(500).json({ error: "Failed to analyze transcript." });
  }
});

const movementModel = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: `You are an AI analyzing mobile phone sensor data (accelerometer and gyroscope) over a 5-second window. 
  Your job is to classify the user's activity into one of four states based on the pattern: "walking", "running", "sitting", or "falling".
  - Sitting: Very low movement/rotation.
  - Walking: Rhythmic moderate acceleration.
  - Running: High rhythmic acceleration.
  - Falling: Sudden extreme spike in acceleration/rotation followed by stillness.
  If the state is "falling" or indicates a violent struggle, set isSuspicious to true.
  Respond ONLY with a valid JSON object: { "activity": "walking|running|sitting|falling", "isSuspicious": true/false, "reason": "short explanation" }. Do not wrap the JSON in backticks.`
});

// AI Movement Analysis Endpoint
app.post('/api/ai/analyze-movement', async (req, res) => {
  const { sensorData } = req.body; // Array of objects {a: accMag, g: gyroMag}
  console.log(`[AI MOVEMENT] Received ${sensorData?.length || 0} sensor data points.`);

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE' || apiKey === 'MOCK_KEY') {
      // Fallback mock logic
      let maxAcc = 0;
      for (const d of sensorData) { if (d.a > maxAcc) maxAcc = d.a; }
      
      let activity = "sitting";
      let isSuspicious = false;
      if (maxAcc > 25) { activity = "falling"; isSuspicious = true; }
      else if (maxAcc > 15) { activity = "running"; }
      else if (maxAcc > 11) { activity = "walking"; }

      return res.json({ activity, isSuspicious, reason: `Mock detected ${activity} based on max acc ${maxAcc.toFixed(1)}` });
    }

    // Simplify data to avoid token limits
    const dataString = sensorData.map(v => `A:${v.a.toFixed(1)} G:${v.g.toFixed(1)}`).join(", ");
    const prompt = `Here is the sensor data (A=Accelerometer Magnitude m/s^2, G=Gyroscope Rotation Rate deg/s) over 5 seconds: [${dataString}]. Classify the activity (walking, running, sitting, falling) and determine if it is an emergency.`;
    
    const result = await movementModel.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    if (text.startsWith('```json')) {
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    } else if (text.startsWith('```')) {
      text = text.replace(/```/g, '').trim();
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) text = jsonMatch[0];
    
    const parsed = JSON.parse(text);
    res.json(parsed);

  } catch (error) {
    console.error('Error with AI Movement Analysis:', error);
    res.status(500).json({ error: "Failed to analyze movement." });
  }
});


// API routes must come before here

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', message: 'Guardian Brain is alive!' });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${port}`);
  });
}

// Export for Vercel
module.exports = app;
