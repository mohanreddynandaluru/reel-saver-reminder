// extenstion/firebase-config.js
import { initializeApp, getAuth } from './firebase-bundle.js';

// 🔧 Initializing Firebase configuration...

const firebaseConfig = {
  apiKey: "AIzaSyBHZOBj4TqhAW7x2uLAm2daDGJRJKW-DZ0",
  authDomain: "reel-saver-6d254.firebaseapp.com",
  projectId: "reel-saver-6d254",
  storageBucket: "reel-saver-6d254.appspot.com",
  messagingSenderId: "380830200030",
  appId: "1:380830200030:web:2758fd2392b0abd383d24f",
  measurementId: "G-D8Q3QWZ6W7",
};

// 📋 Firebase config loaded

const app = initializeApp(firebaseConfig);
// ✅ Firebase app initialized successfully

const auth = getAuth(app);
// ✅ Firebase auth initialized successfully

export { auth };