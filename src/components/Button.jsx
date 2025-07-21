import React, { useEffect, useState } from 'react';
import './Button.css'; // Keep your styling

function Button({ lastRoadmap, setLastRoadmap }) {
  const [profile, setProfile] = useState(null);
  const [mode, setMode] = useState('generate');
  const [editInput, setEditInput] = useState('');

  // Listen for profileSubmitted event
  useEffect(() => {
    const handleProfileEvent = (e) => {
      setProfile(e.detail);
    };
    window.addEventListener('profileSubmitted', handleProfileEvent);
    return () => window.removeEventListener('profileSubmitted', handleProfileEvent);
  }, []);

  const sendToChat = (prompt) => {
    const event = new CustomEvent('sendToChat', { detail: prompt });
    window.dispatchEvent(event);
  };

  const handleGenerate = () => {
    if (!profile) {
      sendToChat("Please fill in your profile to generate your roadmap.");
      return;
    }

    const prompt = `Generate a personalized roadmap for someone named ${profile.name}, age ${profile.age}, with the goal of "${profile.goal}" within ${profile.timeframe}, who prefers learning by ${profile.method}.`;
    sendToChat(prompt);
    setLastRoadmap(prompt);
    setMode('edit');
  };

  const handleEdit = () => {
    if (!editInput.trim()) return;
    const editPrompt = `Edit the last roadmap based on this input: "${editInput}". The original roadmap was: "${lastRoadmap}"`;
    sendToChat(editPrompt);
    setLastRoadmap(editPrompt);
    setEditInput('');
  };

  return (
    <div className="button-container">
      {mode === 'generate' ? (
        <button onClick={handleGenerate}>Generate Your Roadmap</button>
      ) : (
        <>
          <p>Last Roadmap Prompt: {lastRoadmap}</p>
          <input
            type="text"
            placeholder="Edit your roadmap..."
            value={editInput}
            onChange={(e) => setEditInput(e.target.value)}
          />
          <button onClick={handleEdit}>Edit Your Roadmap</button>
        </>
      )}
    </div>
  );
}

export default Button;
