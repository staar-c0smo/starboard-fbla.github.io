import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
  authDomain: "starboardfbla.firebaseapp.com",
  projectId: "starboardfbla",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "dashboard.html";
  }
});

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");

// Null check BEFORE using loginForm
if (!loginForm) {
  console.error("loginForm not found! Check your HTML IDs.");
} else {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    loginMessage.textContent = "Signing in...";

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      switch (error.code) {
        case "auth/user-not-found":
          loginMessage.textContent = "No account found with this email.";
          break;
        case "auth/wrong-password":
          loginMessage.textContent = "Incorrect password.";
          break;
        case "auth/invalid-email":
          loginMessage.textContent = "Invalid email address.";
          break;
        case "auth/too-many-requests":
          loginMessage.textContent = "Too many failed attempts. Try again later.";
          break;
        default:
          loginMessage.textContent = error.message;
      }
    }
  });
}

console.log("loginForm element:", document.getElementById("loginForm"));
const adminBtn = document.getElementById("adminRedirectBtn");

if (adminBtn) {
  adminBtn.addEventListener("click", () => {
    window.location.href = "adminlogin.html";
  });
}