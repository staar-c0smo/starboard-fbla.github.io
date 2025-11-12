// firebase-login.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// Firebase configuration
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
const auth = getAuth(app);

// DOM elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const token = grecaptcha.getResponse();

  if (!token) {
    loginMessage.textContent = "Please complete the reCAPTCHA.";
    return;
  }

  try {
    // Try signing in first
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = `Welcome back, ${userCredential.user.email}!`;
    window.location.href = "business.html";
  } catch (loginError) {
    // If login fails, try creating a new account
    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      loginMessage.textContent = `Account created! Welcome, ${newUser.user.email}`;
      window.location.href = "business.html";
    } catch (signupError) {
      loginMessage.textContent = `Error: ${signupError.message}`;
    }
  }

  grecaptcha.reset();
});

// Track login state
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginMessage.textContent = `Logged in as ${user.email}`;
  }
});
