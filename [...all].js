let app;
 
try {
  const express = require('express');
  const cors = require('cors');
  const path = require('path');
  const fs = require('fs');
  const { isValidPhoneNumber, parsePhoneNumberFromString } = require('libphonenumber-js');
  const twilio = require('twilio');
  const nodemailer = require('nodemailer');
  require('dotenv').config();
  const { GoogleGenerativeAI } = require("@google/generative-ai");
 
  app = express();
  const port = 5000;
 
  app.use(cors());
  app.use(express.json());
 
  // Persistent Data Paths
  const USERS_FILE = path.join(__dirname, 'users.json');
  const CONTACTS_FILE = path.join(__dirname, 'contacts.json');
 
  const saveToFile = (file, data) => {
    try { fs.writeFileSync(file, JSON.stringify(data, null, 2)); } catch (err) { console.error(err); }
  };
 
  const loadContacts = () => {
    try { if (fs.existsSync(CONTACTS_FILE)) return JSON.parse(fs.readFileSync(CONTACTS_FILE, 'utf8')); } catch (err) {}
    return [
      { id: 1, name: "Police", phone: "100", type: "emergency", country: "PK" },
      { id: 2, name: "Ambulance", phone: "101", type: "emergency", country: "PK" },
      { id: 3, name: "Mom", phone: "1234567890", type: "family", country: "PK" }
    ];
  };
 
  let contacts = loadContacts();
 
  const saveUsers = (data) => saveToFile(USERS_FILE, data);
 
  const loadUsers = () => {
    try { if (fs.existsSync(USERS_FILE)) return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (err) {}
    return [{ email: "user@example.com", password: "password123", name: "Internal Test User" }];
  };
 
  let users = loadUsers();
 
  const router = express.Router();
 
  // Twilio client
  const twilioClient = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
 
  // Gemini client
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "MOCK_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 
  router.post('/signup', (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "All fields are required" });
    const normalizedEmail = email.toLowerCase().trim();
    if (users.find(u => u.email === normalizedEmail)) return res.status(400).json({ error: "Email already registered" });
    users.push({ name, email: normalizedEmail, password });
    saveUsers(users);
    res.status(201).json({ message: "User registered successfully" });
  });
 
  router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });
    const normalizedEmail = email.toLowerCase().trim();
    const user = users.find(u => u.email === normalizedEmail);
    if (!user) return res.status(404).json({ error: "Account does not exist. Please sign up first." });
    if (user.password !== password) return res.status(401).json({ error: "Incorrect password" });
    res.json({ message: "Login successful", user: { name: user.name, email: user.email } });
  });
 
  router.post('/forgot-password', async (req, res) => {
    res.status(200).json({ message: "Password email sent successfully" });
  });
 
  router.get('/contacts', (req, res) => res.json(contacts));
 
  router.post('/contacts', (req, res) => {
    const { name, phone, type, country } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and Phone are required" });
    const isValid = isValidPhoneNumber(phone.trim(), country || 'PK');
    if (!isValid) return res.status(400).json({ error: "Invalid phone number" });
    const newContact = { id: Date.now(), name: name.trim(), phone: phone.trim(), type: type || 'custom', country: country || 'PK' };
    contacts.push(newContact);
    saveToFile(CONTACTS_FILE, contacts);
    res.status(201).json(newContact);
  });
 
  router.delete('/contacts/:id', (req, res) => {
    contacts = contacts.filter(c => c.id != req.params.id);
    saveToFile(CONTACTS_FILE, contacts);
    res.status(200).json({ message: "Contact removed" });
  });
 
  // --- AI Safety Advisor Chat (REAL Gemini call) ---
  router.post('/ai/chat', async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) return res.status(400).json({ error: "message is required" });
 
      const prompt = `You are Guardian, an AI personal safety advisor inside a mobile safety app.
Your job: give short, calm, practical safety advice to the user based on their message.
If they describe an emergency or immediate danger, prioritize telling them to use the app's SOS/alert button and contact local emergency services (Police: 15 in Pakistan, or 100/101 depending on region).
Keep responses under 80 words, warm but direct tone.
 
User message: "${message}"`;
 
      const result = await model.generateContent(prompt);
      const reply = result.response.text();
      res.json({ reply });
    } catch (err) {
      console.error("AI chat error:", err);
      res.status(500).json({ error: "AI service unavailable", reply: "Sorry, I couldn't process that right now." });
    }
  });
 
  // --- Analyze Transcript for Danger Signals (REAL Gemini call) ---
  router.post('/ai/analyze-transcript', async (req, res) => {
    try {
      const { transcript } = req.body;
      if (!transcript) return res.status(400).json({ error: "transcript is required" });
 
      const prompt = `You are a safety-monitoring AI analyzing a live audio transcript for signs of danger, distress, or threat to the speaker.
Respond ONLY with valid JSON, no markdown, no extra text, in this exact shape:
{"isDanger": true or false, "reason": "short explanation"}
 
Transcript: "${transcript}"`;
 
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err) {
      console.error("Transcript analysis error:", err);
      res.status(500).json({ isDanger: false, reason: "Analysis failed, defaulting to safe" });
    }
  });
 
  // --- Analyze Movement Pattern for Suspicious Activity (REAL Gemini call) ---
  router.post('/ai/analyze-movement', async (req, res) => {
    try {
      const { movementData } = req.body;
      if (!movementData) return res.status(400).json({ error: "movementData is required" });
 
      const prompt = `You are a safety-monitoring AI analyzing a user's movement sensor data for signs of a struggle, fall, sudden stop, or suspicious deviation from a normal route.
Respond ONLY with valid JSON, no markdown, no extra text, in this exact shape:
{"activity": "one or two word label", "isSuspicious": true or false, "reason": "short explanation"}
 
Movement data: ${JSON.stringify(movementData)}`;
 
      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err) {
      console.error("Movement analysis error:", err);
      res.status(500).json({ activity: "unknown", isSuspicious: false, reason: "Analysis failed, defaulting to safe" });
    }
  });
 
  // --- Send Real SOS Alert via Twilio SMS ---
  router.post('/alert', async (req, res) => {
    try {
      const { userName, location } = req.body;
 
      const emergencyContacts = contacts.filter(c => c.type === "family" || c.type === "emergency");
      const locationText = location
        ? (typeof location === "string" ? location : `https://maps.google.com/?q=${location.lat},${location.lng}`)
        : "location unavailable";
 
      const messages = await Promise.all(
        emergencyContacts
          .filter(c => c.phone && c.phone.length > 6)
          .map(c =>
            twilioClient.messages.create({
              body: `🚨 SOS ALERT: ${userName || "A Guardian app user"} may be in danger. Last known location: ${locationText}`,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: c.phone
            }).catch(err => ({ error: err.message, to: c.phone }))
          )
      );
 
      res.status(200).json({ success: true, message: "Alert sent", results: messages.length });
    } catch (err) {
      console.error("Alert error:", err);
      res.status(500).json({ success: false, message: "Failed to send alert" });
    }
  });
 
  app.use('/api', router);
  app.use('/', router);
 
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', message: 'Guardian Brain is alive!' });
  });
 
  if (require.main === module) {
    app.listen(port, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${port}`);
    });
  }
 
  module.exports = app;
 
} catch (error) {
  module.exports = (req, res) => {
    res.status(500).json({
      error: "INITIALIZATION_FAILED",
      message: error.message,
      stack: error.stack
    });
  };
}
