import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBccziH3sKqFK1POjqETmtW0ZAjr-t8r8M",
  authDomain: "sirrion-897eb.firebaseapp.com",
  projectId: "sirrion-897eb",
  storageBucket: "sirrion-897eb.appspot.com",
  messagingSenderId: "463295670162",
  appId: "1:463295670162:web:a7df2bba0dc1bb342a034b",
  measurementId: "G-FJP44F3101"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get services
const db = getFirestore(app);



// Enable offline persistence
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open.');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence is not available in this browser.');
  }
});

const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
