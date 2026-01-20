
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInAnonymously,
  updateProfile,
  User as FirebaseUser
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  getDocs,
  Timestamp 
} from "firebase/firestore";
import { QuizResult, User } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyBoiFbzB3N8dACsz7HcN0sh6JLYEZjxIgQ",
  authDomain: "ragyu-fac4b.firebaseapp.com",
  projectId: "ragyu-fac4b",
  storageBucket: "ragyu-fac4b.firebasestorage.app",
  messagingSenderId: "457007238508",
  appId: "1:457007238508:web:42bfde24ae67a2c4113749",
  measurementId: "G-WBK2D22507"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export const initDB = async () => {
  console.log("Firebase Initialized");
};

// Helper to map Firebase User to App User
const mapUser = (u: FirebaseUser): User => ({
  id: u.uid,
  email: u.email,
  name: u.displayName || (u.isAnonymous ? 'Guest Explorer' : 'User'),
  isGuest: u.isAnonymous
});

// --- AUTH FUNCTIONS ---

export const registerUser = async (email: string, password: string, name: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    return mapUser({ ...userCredential.user, displayName: name } as FirebaseUser);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/operation-not-allowed') {
       console.log("Firebase Auth blocked by domain policy. Falling back to Local Mode.");
       return {
         id: `local-user-${Date.now()}`,
         email: email,
         name: name,
         isGuest: false
       };
    }
    throw new Error(error.message);
  }
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return mapUser(userCredential.user);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain') {
       console.log("Firebase Auth blocked. Falling back to Local Mode.");
       return {
         id: `local-user-${Date.now()}`, 
         email: email,
         name: 'Local User', 
         isGuest: false
       };
    }
    throw new Error(error.message);
  }
};

export const signInWithGoogle = async (): Promise<User> => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return mapUser(result.user);
  } catch (error: any) {
    if (error.code === 'auth/unauthorized-domain' || error.code === 'auth/operation-not-allowed') {
       console.log("Google Sign In blocked by domain policy. Falling back to Local Mode.");
       return {
         id: `local-google-${Date.now()}`,
         email: 'google-user@example.com',
         name: 'Google User (Local)',
         isGuest: false
       };
    }
    throw new Error(error.message);
  }
};

export const signInGuest = async (): Promise<User> => {
  try {
    const result = await signInAnonymously(auth);
    return mapUser(result.user);
  } catch (error: any) {
    console.log("Firebase Guest Login failed, falling back to local mode.");
    return {
      id: `local-guest-${Date.now()}`,
      email: null,
      name: 'Guest Explorer',
      isGuest: true
    };
  }
};

// --- DATA FUNCTIONS ---

const LOCAL_STORAGE_HISTORY_KEY = 'ragyu_local_history';

export const saveQuizResultToDB = async (result: QuizResult, examName: string, subjectName: string, userId: string) => {
  if (userId.startsWith('local-')) {
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const history = existingData ? JSON.parse(existingData) : [];
      
      const newEntry = {
        userId,
        timestamp: new Date().toISOString(),
        examName,
        subjectName,
        player1Score: result.player1.score,
        player1Accuracy: result.player1.accuracy,
        totalQuestions: result.totalQuestions,
        fullResult: JSON.stringify(result)
      };
      
      history.push(newEntry);
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
      return;
    } catch (e) {
      console.error("Failed to save to LocalStorage", e);
      return;
    }
  }

  try {
    await addDoc(collection(db, "quiz_history"), {
      userId,
      timestamp: Timestamp.now(),
      examName,
      subjectName,
      player1Score: result.player1.score,
      player1Accuracy: result.player1.accuracy,
      totalQuestions: result.totalQuestions,
      fullResult: JSON.stringify(result)
    });
  } catch (e) {
    console.error("Failed to save result to Firestore", e);
  }
};

export const getHistoryFromDB = async (userId: string) => {
  if (userId.startsWith('local-')) {
    try {
      const existingData = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      const history = existingData ? JSON.parse(existingData) : [];
      
      return history
        .filter((h: any) => h.userId === userId)
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .map((data: any) => ({
          timestamp: data.timestamp,
          examName: data.examName,
          subjectName: data.subjectName,
          player1: {
            score: data.player1Score,
            accuracy: data.player1Accuracy
          },
          totalQuestions: data.totalQuestions,
        }));
    } catch (e) {
      console.error("Failed to fetch from LocalStorage", e);
      return [];
    }
  }

  try {
    const q = query(
      collection(db, "quiz_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        timestamp: data.timestamp.toDate().toISOString(),
        examName: data.examName,
        subjectName: data.subjectName,
        player1: {
          score: data.player1Score,
          accuracy: data.player1Accuracy
        },
        totalQuestions: data.totalQuestions,
      };
    });
  } catch (e) {
    console.error("Failed to fetch history from Firestore", e);
    return [];
  }
};

/**
 * Calculates the current daily streak.
 * A streak is the number of consecutive days (ending today or yesterday) 
 * where at least one quiz was completed.
 */
export const calculateStreak = (history: any[]): number => {
  if (!history || history.length === 0) return 0;

  // Get unique dates in YYYY-MM-DD format, sorted descending
  const dates = Array.from(new Set(
    history.map(h => new Date(h.timestamp).toISOString().split('T')[0])
  )).sort((a, b) => b.localeCompare(a));

  const today = new Date().toISOString().split('T')[0];
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  // If the last entry isn't today or yesterday, streak is broken
  if (dates[0] !== today && dates[0] !== yesterday) {
    return 0;
  }

  let streak = 0;
  let currentRefDate = new Date(dates[0]);

  for (let i = 0; i < dates.length; i++) {
    const dateStr = dates[i];
    const dateObj = new Date(dateStr);
    
    // Check if this date is consecutive to the previous one in our loop
    if (i === 0) {
      streak = 1;
    } else {
      const diffTime = Math.abs(currentRefDate.getTime() - dateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
        currentRefDate = dateObj;
      } else {
        break; // Streak broken
      }
    }
  }

  return streak;
};
