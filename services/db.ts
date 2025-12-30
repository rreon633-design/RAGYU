
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
    // If domain is unauthorized (localhost/preview), fallback to local user
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
    // If domain is unauthorized, fallback to local logic so the user can still enter the app
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
    // Catch domain errors and fall back to a simulated Google User
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
  // 1. Local Fallback for Guests or Offline usage
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
      console.log("Result saved to LocalStorage");
      return;
    } catch (e) {
      console.error("Failed to save to LocalStorage", e);
      return;
    }
  }

  // 2. Firebase Firestore Storage
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
    console.log("Result saved to Firestore");
  } catch (e) {
    console.error("Failed to save result to Firestore", e);
  }
};

export const getHistoryFromDB = async (userId: string) => {
  // 1. Local Fallback Retrieval
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

  // 2. Firebase Firestore Retrieval
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
