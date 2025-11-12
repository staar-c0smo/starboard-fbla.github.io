// Firebase Configuration and Initialization
// This file sets up Firebase services for authentication and data management

import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase project configuration
// Contains API keys and service endpoints for Starboard project
const firebaseConfig = {
  apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
  authDomain: "starboardfbla.firebaseapp.com",
  databaseURL: "https://starboardfbla-default-rtdb.firebaseio.com",
  projectId: "starboardfbla",
  storageBucket: "starboardfbla.firebasestorage.app",
  messagingSenderId: "208086177069",
  appId: "1:208086177069:web:660276fd96e897e17eefa4",
  measurementId: "G-KTL8VM78QY"
};

// Initialize Firebase application instance
const app = initializeApp(firebaseConfig);

// Initialize Analytics for tracking user interactions
const analytics = getAnalytics(app);

// Initialize Authentication for login/signup functionality
const auth = getAuth(app);

// Export auth instance for use in other files
export { auth };