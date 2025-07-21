// src/utils/saveRoadmapToFirestore.js
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const saveRoadmapToFirestore = async (userid, content, steps) => {
  try {
    const userDocRef = doc(db, "roadmaps", userid);
    // Change this line only - flatten the structure
    await setDoc(userDocRef, { 
      content,      // <- now at root level
      steps,        // <- now at root level  
      timestamp: serverTimestamp() 
    });
    console.log("✅ Roadmap saved to Firestore");
  } catch (error) {
    console.error("❌ Error saving roadmap:", error);
  }
};