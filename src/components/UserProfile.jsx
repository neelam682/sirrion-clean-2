// ✅ FINAL UserProfile.jsx — Authenticated, UID-Based, Fully Functional
import React, { useState, useEffect } from "react";
import "./UserProfile.css";
import { db, storage, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";

function UserProfile() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoURL, setPhotoURL] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [goal, setGoal] = useState('');
  const [style, setStyle] = useState('');
  const [uid, setUid] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("✅ UID in profile:", user.uid);
        setUid(user.uid);
        const docRef = doc(db, "userProfiles", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setName(data.name || '');
          setAge(data.age || '');
          setGoal(data.goal || '');
          setStyle(data.learningStyle || '');
          setPhotoURL(data.photoURL || '');
        }
      } else {
        console.warn("⚠️ No user signed in — redirecting to login.");
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      const storageRef = ref(storage, `photos/${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setPhotoURL(url);
    }
  };

  const saveProfile = async () => {
    console.log("🔧 Saving with UID:", uid);
    if (!uid) {
      alert("❌ You must be logged in to save your profile.");
      return;
    }
    if (!name || !goal || !style || !age) {
      alert("⚠️ Please complete all profile fields.");
      return;
    }

    const profile = {
      name,
      age,
      goal,
      learningStyle: style,
      photoURL,
    };

    await setDoc(doc(db, "userProfiles", uid), profile);
    console.log("✅ Profile saved:", profile);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    navigate("/chat", { state: { profile } });
  };

  return (
    <div className="user-profile-container">
      <div className={`profile-card ${isExpanded ? "expanded" : "collapsed"}`}>
        {!isExpanded ? (
          <div className="collapsed-circle" onClick={() => setIsExpanded(true)}>
            {photoURL ? (
              <img src={photoURL} alt="Profile" className="profile-img" />
            ) : (
              <span role="img" aria-label="profile">👤</span>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => setIsExpanded(false)} className="toggle-btn">X</button>

            <div className="form-section">
              <p>Let's build your cosmic profile!</p>

              <div className="form-group">
                <label>Upload Photo:</label>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />
              </div>

              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label>Age:</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Enter your age"
                />
              </div>

              <div className="form-group">
                <label>Learning Goal:</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. Quantum Computing"
                />
              </div>

              <div className="form-group">
                <label>Preferred Learning Style:</label>
                <select value={style} onChange={(e) => setStyle(e.target.value)}>
                  <option value="">Choose your style</option>
                  <option value="visual">Visual</option>
                  <option value="auditory">Auditory</option>
                  <option value="reading">Reading/Writing</option>
                  <option value="kinesthetic">Hands-on (Kinesthetic)</option>
                </select>
              </div>

              <button className="save-btn" onClick={saveProfile}>
                Save Profile
              </button>

              {isSaved && <p className="save-message">✅ Profile saved! You'll receive your roadmap soon.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default UserProfile;

