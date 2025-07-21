// ✅ FINAL ChatBox.jsx — Fully Fixed with UID, Profile Validation, Roadmap Generation
import { useState, useEffect, useRef } from 'react';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  orderBy,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { getRoadmapFromGPT } from '../api/getRoadmapFromGPT';
import './ChatBox.css';

const ChatBox = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [uid, setUid] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("✅ UID in ChatBox:", user.uid);
        setUid(user.uid);
      } else {
        console.warn("⚠️ No user signed in.");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getCurrentUserProfile = async (uid) => {
    if (!uid) return null;
    const docRef = doc(db, "userProfiles", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.name && data.goal && (data.learningStyle || data.style)) {
        return data;
      }
    }
    return null;
  };

  const loadMessages = async (uid) => {
    if (!uid) return;
    const q = query(
      collection(db, "conversations"),
      where("userid", "==", uid),
      orderBy("timestamp", "asc")
    );
    const querySnapshot = await getDocs(q);
    const msgs = querySnapshot.docs.map(doc => doc.data());
    setMessages(msgs);
  };

  const saveMessage = async (msg) => {
    if (!uid || !msg?.text?.trim()) return;
    await addDoc(collection(db, "conversations"), {
      ...msg,
      timestamp: serverTimestamp(),
      userid: uid
    });
  };

  const saveRoadmapToFirestore = async (uid, content) => {
    if (!uid || !content?.trim()) return;
    await setDoc(doc(db, "roadmaps", uid), {
      content,
      timestamp: serverTimestamp()
    });
  };

  const loadRoadmap = async (profile) => {
    const roadmapRef = doc(db, "roadmaps", uid);
    const snap = await getDoc(roadmapRef);
    if (snap.exists()) {
      const roadmap = snap.data().content;
      setMessages(prev => [...prev, { text: roadmap, sender: 'bot' }]);
    } else {
      await sendInitialRoadmap(profile);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!uid) return;
      const profile = await getCurrentUserProfile(uid);
      console.log("👁️ Profile loaded into ChatBox:", profile);
      if (profile) {
        setUserProfile(profile);
        await loadRoadmap(profile);
      } else {
        setMessages(prev => [
          ...prev,
          { text: "⚠️ Your profile is incomplete. Please complete it first.", sender: 'bot' }
        ]);
      }
      await loadMessages(uid);
    };
    init();
  }, [uid]);

  const sendInitialRoadmap = async (profile) => {
    if (!profile) return;
    setIsThinking(true);

    const name = profile.name?.split(" ")[0] || "there";
    const style = profile.learningStyle || profile.style || "your preferred";
    const goal = profile.goal || "your goal";

    const intro = {
      text: `Hi ${name}, generating your personalized roadmap for \"${goal}\" using a ${style} learning approach... ✨`,
      sender: 'bot'
    };
    setMessages(prev => [...prev, intro]);
    await saveMessage(intro);

    try {
      const introMessage = `I am ${profile.name}, ${profile.age} years old. I want to learn ${profile.goal} in ${profile.timeframe || '1 month'}. My learning style is ${style}. Can you generate a roadmap?`;
      const chatHistory = [{ role: "user", content: introMessage }];

      const roadmap = await getRoadmapFromGPT(profile, chatHistory);
      const msg = { text: roadmap, sender: 'bot' };
      setMessages(prev => [...prev, msg]);
      await saveMessage(msg);
      await saveRoadmapToFirestore(uid, roadmap);
    } catch (err) {
      const errorMsg = { text: "Error: " + err.message, sender: 'bot' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!userProfile) {
      const errorMsg = {
        text: "⚠️ Please complete your profile first before chatting.",
        sender: 'bot'
      };
      setMessages(prev => [...prev, errorMsg]);
      return;
    }

    const userMsg = { text: input, sender: 'user' };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");

    const lower = input.trim().toLowerCase();
    const casualInputs = ['hi', 'hey', 'hello', 'yo', 'salaam', 'salaam alaikum'];

    if (casualInputs.includes(lower)) {
      const reminderMsg = {
        text: `👋 Hey ${userProfile.name}, just a gentle reminder you're working on: *${userProfile.goal}*. Want to continue or ask something about it?`,
        sender: 'bot',
      };
      setMessages(prev => [...prev, reminderMsg]);
      return;
    }

    const formattedMessages = updatedMessages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text,
    }));

    try {
      const response = await getRoadmapFromGPT(userProfile, formattedMessages);
      const botMsg = {
        text: response || "⚠️ I didn't quite get that. Can you try rephrasing?",
        sender: 'bot',
      };
      setMessages(prev => [...prev, botMsg]);

      if (response.toLowerCase().includes("roadmap")) {
        await saveRoadmapToFirestore(uid, response);
      }
    } catch (err) {
      const errorMsg = {
        text: "❌ Something went wrong while getting a reply. Try again.",
        sender: 'bot',
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!userProfile) {
      alert("⚠️ Your profile is incomplete.");
      return;
    }

    console.log("⚡ Generating roadmap with:", userProfile);

    const prompt = `
You're a roadmap generator. Based on the user's profile below, generate a clear, numbered learning roadmap (using "1.", "2.", etc) with 5–7 steps max. No intro or summary. Just the steps.

User Profile:
Name: ${userProfile.name}
Goal: ${userProfile.goal}
Timeframe: ${userProfile.timeframe || '1 month'}
Learning Style: ${userProfile.learningStyle || userProfile.style || 'self-paced'}
    `;

    try {
      const response = await getRoadmapFromGPT(userProfile, [{ role: 'user', content: prompt }]);
      setMessages(prev => [...prev, { text: response, sender: 'bot' }]);
      await saveRoadmapToFirestore(uid, response);
    } catch (err) {
      setMessages(prev => [...prev, { text: "❌ Roadmap generation failed.", sender: 'bot' }]);
      console.error("❌ GPT Error:", err);
    }
  };

  const handleEditRoadmap = async () => {
    const editPrompt = {
      text: `📝 What would you like to change about your roadmap? You can say \"Change my goal to Quantum AI\" or \"Make the style more visual.\"`,
      sender: 'bot'
    };
    setMessages(prev => [...prev, editPrompt]);
    await saveMessage(editPrompt);
  };

  return (
    <div className="chat-container">
      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`chat-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {isThinking && (
          <div className="typing-indicator">
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
            <div className="typing-dot"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask something or update your goal..."
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div className="chat-actions">
        <button onClick={handleGenerateRoadmap}>Generate Roadmap</button>
        <button onClick={handleEditRoadmap}>Edit Roadmap</button>
        {!userProfile && (
          <button
            onClick={() => (window.location.href = '/profile')}
            className="profile-button"
          >
            Go to Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBox;

