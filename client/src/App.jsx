import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Shield, Phone, MapPin, Menu, User } from 'lucide-react';
import Button from './components/Button';


import Contacts from './pages/Contacts';
import Location from './pages/Location';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home'; // Import extracted Home component
import FakeCall from './pages/FakeCall';
import SafetyTimer from './pages/SafetyTimer';
import VoiceSOS from './pages/VoiceSOS';
import AISafety from './pages/AISafety';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        
        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
        <Route path="/location" element={<ProtectedRoute><Location /></ProtectedRoute>} />
        <Route path="/fake-call" element={<ProtectedRoute><FakeCall /></ProtectedRoute>} />
        <Route path="/safety-timer" element={<ProtectedRoute><SafetyTimer /></ProtectedRoute>} />
        <Route path="/voice-sos" element={<ProtectedRoute><VoiceSOS /></ProtectedRoute>} />
        <Route path="/ai-threat" element={<ProtectedRoute><AISafety /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
