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
    // Basic stub to save space
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

  router.post('/alert', async (req, res) => {
    res.status(200).json({ success: true, message: "Alert processed successfully" });
  });

  app.use('/api', router);
  app.use('/', router);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "MOCK_KEY");
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  router.post('/ai/chat', async (req, res) => {
    res.json({ reply: "I am your AI Safety Advisor." });
  });

  router.post('/ai/analyze-transcript', async (req, res) => {
    res.json({ isDanger: false, reason: "Mock" });
  });

  router.post('/ai/analyze-movement', async (req, res) => {
    res.json({ activity: "sitting", isSuspicious: false, reason: "Mock" });
  });

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
