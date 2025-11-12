// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { auth };

