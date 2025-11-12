// // Import Firebase functions
// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
// import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// // Your Firebase project configuration
// const firebaseConfig = {
//     apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
//     authDomain: "starboardfbla.firebaseapp.com",
//     databaseURL: "https://starboardfbla-default-rtdb.firebaseio.com",
//     projectId: "starboardfbla",
//     storageBucket: "starboardfbla.firebasestorage.app",
//     messagingSenderId: "208086177069",
//     appId: "1:208086177069:web:660276fd96e897e17eefa4",
//     measurementId: "G-KTL8VM78QY"
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);

// // Handle login form submission
// document.getElementById("loginForm").addEventListener("submit", (e) => {
//   e.preventDefault();

//   // Get reCAPTCHA response
//   const recaptchaResponse = grecaptcha.getResponse();
//   if (!recaptchaResponse) {
//     document.getElementById("loginMessage").textContent = "Please complete the reCAPTCHA.";
//     return;
//   }

//   const email = document.getElementById("email").value;
//   const password = document.getElementById("password").value;

//   signInWithEmailAndPassword(auth, email, password)
//     .then(() => {
//       document.getElementById("loginMessage").textContent = "Login successful! Redirecting...";
//       window.location.href = "businesses.html"; // Redirect on success
//     })
//     .catch((error) => {
//       document.getElementById("loginMessage").textContent = "Error: " + error.message;
//     });
// });



// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

// 🔹 Your Firebase config (replace with your project values)
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

// DOM Elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

// Helper to check reCAPTCHA
function getRecaptchaToken() {
  return grecaptcha.getResponse();
}

// 🔹 Handle Form Submission
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const token = getRecaptchaToken();

  if (!token) {
    loginMessage.textContent = "Please complete the reCAPTCHA.";
    return;
  }

  // Try login first
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    loginMessage.textContent = `Welcome back, ${userCredential.user.email}!`;
    window.location.href = "businesses.html"; // Redirect to businesses
  } catch (loginError) {
    // If login fails, try sign-up
    try {
      const newUser = await createUserWithEmailAndPassword(auth, email, password);
      loginMessage.textContent = `Account created! Welcome, ${newUser.user.email}`;
      window.location.href = "business.html"; // Redirect to business
    } catch (signupError) {
      loginMessage.textContent = `Error: ${signupError.message}`;
    }
  }

  // Reset reCAPTCHA
  grecaptcha.reset();
});

// 🔹 Keep track of logged-in user
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginMessage.textContent = `Logged in as ${user.email}`;
  }
});
