import './App.css';
import ChatBox from './components/ChatBox';
import UserProfile from './components/UserProfile';
import Tracker from './components/Tracker';
import { useRef, useState,useEffect } from 'react';
// 🧠 Add these imports at the top:
import { getAuth, signInAnonymously, onAuthStateChanged } from "firebase/auth";



function App() {
  const desktopVideoRef = useRef(null);
  const mobileVideoRef = useRef(null);

  const [profile, setProfile] = useState({
    name: '',
    age: '',
    goal: '',
    timeframe: '',
    method: ''
  });

  // Track if tracker overlay is open
  const [showTracker, setShowTracker] = useState(false);

  const handleMouseMove = (e) => {
    const chatBox = document.querySelector('.chat-container');
    const rect = chatBox?.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    const isInside = rect &&
      x >= rect.left &&
      x <= rect.right &&
      y >= rect.top &&
      y <= rect.bottom;

    if (isInside) {
      if (desktopVideoRef.current) desktopVideoRef.current.pause();
      if (mobileVideoRef.current) mobileVideoRef.current.pause();
    } else {
      if (desktopVideoRef.current) desktopVideoRef.current.play();
      if (mobileVideoRef.current) mobileVideoRef.current.play();
    }
  };
const [uid, setUid] = useState(null);

useEffect(() => {
  const auth = getAuth();
  signInAnonymously(auth)
    .then(() => {
      onAuthStateChanged(auth, (user) => {
        if (user) {
          setUid(user.uid);  // ✅ Store unique anonymous UID
        }
      });
    })
    .catch((error) => {
      console.error("Anonymous sign-in failed:", error);
    });
}, []);

  return (
    <div className="app-wrapper" onMouseMove={handleMouseMove}>
      {/* Desktop Video */}
      <div className="video-wrapper desktop-video-wrapper">
        <video
          ref={desktopVideoRef}
          className="bg-video desktop-only"
          src="/humanwriting.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* Mobile Video */}
      <div className="video-wrapper mobile-video-wrapper">
        <video
          ref={mobileVideoRef}
          className="bg-video mobile-only"
          src="/humanwriting_mobile.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
      </div>

      {/* UI Layer */}
      <div className="ui-layer">
        <div className="profile-tracker-wrapper">
          <UserProfile profile={profile} setProfile={setProfile} />

          {/* Toggle Tracker Overlay Button */}
          <button
            className="tracker-toggle-btn"
            onClick={() => setShowTracker(!showTracker)}
          >
            {showTracker ? '❌ Close Tracker' : '📋 Open Tracker'}
          </button>

          {/* Conditionally render Tracker overlay */}
          {showTracker && (
            <div className="tracker-overlay-wrapper">
              <Tracker userId={profile.name || 'demoUser'} />
            </div>
          )}
        </div>

        <ChatBox />
      </div>
    </div>
  );
}

export default App;

