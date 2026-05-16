import { API_BASE_URL } from '../config.js';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Trash2, Phone, User, Globe } from 'lucide-react';
import Button from '../components/Button';
import { isValidPhoneNumber } from 'libphonenumber-js';

const Contacts = () => {
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newContact, setNewContact] = useState({ name: '', phone: '', type: 'family' });
    const [country, setCountry] = useState('PK'); // Default to Pakistan
    const [error, setError] = useState('');

    // Fetch Contacts
    useEffect(() => {
        fetchContacts();
    }, []);

    const fetchContacts = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`);
            const data = await res.json();
            setContacts(data);
        } catch (err) {
            console.error("Failed to load contacts", err);
        } finally {
            setLoading(false);
        }
    };

    // Add Contact
    const handleAdd = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!newContact.name || !newContact.phone) {
            setError('Please fill in all fields');
            return;
        }

        // Robust International Validation using libphonenumber-js
        const isValid = isValidPhoneNumber(newContact.phone, country);
        if (!isValid) {
            const countryNames = { 'PK': 'Pakistan', 'US': 'USA', 'CN': 'China' };
            setError(`Invalid phone number format for ${countryNames[country]}`);
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newContact,
                    phone: newContact.phone.trim(),
                    country // Pass country for backend validation
                })
            });
           if (res.ok) {
                fetchContacts();
                setShowAddForm(false);
                setNewContact({ name: '', phone: '', type: 'family' });
            }
        } catch (err) {
            console.error("Failed to add contact", err);
        }
    };

    // Delete Contact
    const handleDelete = async (id) => {
        try {
            await fetch(`${API_BASE_URL}/api/contacts/${id}`, { method: 'DELETE' });
            setContacts(contacts.filter(c => c.id !== id));
        } catch (err) {
            console.error("Failed to delete contact", err);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg text-white p-6 relative">
            <header className="flex items-center gap-4 mb-8">
                <button onClick={() => navigate(-1)} className="p-2 bg-white/5 rounded-full hover:bg-white/10">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <h1 className="text-2xl font-bold">Trusted Contacts</h1>
            </header>

            <main className="space-y-6">
                {/* Add Button */}
                {!showAddForm && (
                    <Button variant="secondary" onClick={() => setShowAddForm(true)} className="mb-6">
                        <UserPlus className="w-5 h-5 text-green-400" />
                        <span>Add New Contact</span>
                    </Button>
                )}

                {/* Add Form */}
                {showAddForm && (
                    <form onSubmit={handleAdd} className="bg-dark-card p-4 rounded-xl space-y-4 border border-white/10 animate-fade-in-up">
                        <h3 className="font-bold text-lg">New Contact</h3>
                        {error && (
                            <div className="bg-red-500/20 border border-red-500/50 text-red-200 text-xs p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}
                       <input
                            type="text"
                            placeholder="Name"
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-safety-orange outline-none"
                            value={newContact.name}
                            onChange={e => setNewContact({ ...newContact, name: e.target.value })}
                        />
                        
                        <div className="flex gap-2">
                             <div className="relative w-1/3">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <select 
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 pl-9 text-white focus:border-safety-orange outline-none appearance-none cursor-pointer"
                                    value={country}
                                    onChange={(e) => setCountry(e.target.value)}
                                >
                                    <option value="PK" className="bg-dark-bg">PK (+92)</option>
                                    <option value="US" className="bg-dark-bg">US (+1)</option>
                                    <option value="CN" className="bg-dark-bg">CN (+86)</option>
                                </select>
                            </div>
                            <input
                                type="tel"
                                placeholder="Phone Number"
                                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-safety-orange outline-none"
                                value={newContact.phone}
                                onChange={e => setNewContact({ ...newContact, phone: e.target.value })}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" variant="ghost" onClick={() => setShowAddForm(false)} className="flex-1">Cancel</Button>
                            <Button type="submit" variant="primary" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600">Save</Button>
                        </div>
                    </form>
                )}

                {/* Contacts List */}
                <div className="space-y-3">
                    {loading ? <p className="text-center text-white/40">Loading...</p> : contacts.map(contact => (
                        <div key={contact.id} className="bg-dark-card p-4 rounded-xl flex items-center justify-between border border-white/5 hover:border-white/20 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.type === 'emergency' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                    {contact.type === 'emergency' ? <Phone className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className="text-left">
                                    <p className="font-bold">{contact.name}</p>
                                    <p className="text-sm text-white/50">{contact.phone}</p>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(contact.id)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    ))}

                    {!loading && contacts.length === 0 && (
                        <div className="text-center py-10 text-white/30">
                            No contacts added yet.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Contacts;
