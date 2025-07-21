// src/ChatPage.jsx
import React from 'react';
import ChatBox from './components/ChatBox';
import FormModal from './components/FormModal';
import Tracker from './components/Tracker';
import RoadmapModal from './components/RoadmapModal';
import UserProfile from './components/UserProfile';

const ChatPage = () => {
  return (
    <div className="chat-page">
      <h1>Welcome to the ChatPage</h1>
      <ChatBox />
      <FormModal />
      <Tracker />
      <RoadmapModal />
      <UserProfile />
    </div>
  );
};

export default ChatPage;
