// ✅ Updated Tracker.jsx — uses Firebase Auth UID like ChatBox
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

function Tracker() {
  const [steps, setSteps] = useState([]);
  const [checkedSteps, setCheckedSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uid, setUid] = useState(null);
  const [name, setName] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUid(user.uid);
        await fetchRoadmap(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchRoadmap = async (uid) => {
    setLoading(true);
    try {
      const roadmapRef = doc(db, 'roadmaps', uid);
      const roadmapSnap = await getDoc(roadmapRef);

      const userRef = doc(db, 'userProfiles', uid);
      const userSnap = await getDoc(userRef);
      const userName = userSnap.exists() ? userSnap.data().name : 'User';
      setName(userName);

      if (roadmapSnap.exists()) {
        const roadmapText = roadmapSnap.data().content;

        const parsedSteps = roadmapText
          .split(/\n|(?=\d+\.\s)/)
          .filter(step => step.trim() !== '')
          .map((step, index) => ({
            id: index.toString(),
            title: step.trim(),
          }));

        setSteps(parsedSteps);
      } else {
        console.warn(`No roadmap found for uid "${uid}".`);
        setSteps([]);
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setSteps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = (id) => {
    setCheckedSteps(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const progress = steps.length ? (checkedSteps.length / steps.length) * 100 : 0;

  return (
    <div className="tracker-overlay" style={{ padding: '1rem', color: 'white' }}>
      <h2>📍 {name}'s Roadmap Progress</h2>

      {/* Progress Bar */}
      <div className="progress-bar-container" style={{
        background: '#2e2e3e',
        borderRadius: '8px',
        overflow: 'hidden',
        marginBottom: '1rem',
        height: '10px'
      }}>
        <div
          className="progress-bar"
          style={{
            width: `${progress}%`,
            backgroundColor: '#00ffa6',
            height: '100%',
            transition: 'width 0.3s ease'
          }}
        ></div>
      </div>

      {loading ? (
        <p>Loading roadmap...</p>
      ) : steps.length === 0 ? (
        <p>No roadmap steps found.</p>
      ) : (
        <ul className="tracker-list">
          {steps.map((step) => (
            <li key={step.id} className="tracker-step" style={{
              marginBottom: '0.5rem',
              background: '#10132c',
              padding: '0.5rem',
              borderRadius: '5px',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type="checkbox"
                checked={checkedSteps.includes(step.id)}
                onChange={() => handleCheck(step.id)}
                style={{ marginRight: '10px' }}
              />
              {step.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tracker;
