import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginStatus = document.getElementById("loginStatus");

// Sign up
signupBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      loginStatus.textContent = `Signed up as ${userCredential.user.email}`;
    })
    .catch(error => {
      loginStatus.textContent = `Error: ${error.message}`;
    });
});

// Login
loginBtn.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;

  signInWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      loginStatus.textContent = `Logged in as ${userCredential.user.email}`;
    })
    .catch(error => {
      loginStatus.textContent = `Error: ${error.message}`;
    });
});

// Track auth state (logged in/out)
onAuthStateChanged(auth, user => {
  if (user) {
    loginStatus.textContent = `Welcome, ${user.email}`;
  } else {
    loginStatus.textContent = "Not logged in";
  }
});




const businesses = [
  { name: "Java Jolt Café", category: "food", rating: 4.5, reviews: 42, deals: "10% off coffee" },
  { name: "GreenLeaf Groceries", category: "retail", rating: 4.2, reviews: 33, deals: "Buy 1 Get 1 on produce" },
  { name: "Sparkle Cleaners", category: "services", rating: 4.8, reviews: 58, deals: "20% off first wash" },
  { name: "Tech Haven", category: "retail", rating: 4.7, reviews: 80, deals: "Student discount: 15% off" },
  { name: "Sunny Side Diner", category: "food", rating: 4.6, reviews: 51, deals: "Free dessert with entrée" },
];

// Elements
const list = document.getElementById("business-list");
const categoryFilter = document.getElementById("categoryFilter");
const sortBy = document.getElementById("sortBy");

// Render all businesses
function renderBusinesses(data) {
  list.innerHTML = "";
  data.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";
    card.innerHTML = `
      <h3>${b.name}</h3>
      <p><strong>Category:</strong> ${b.category}</p>
      <p class="rating"><strong>Rating:</strong> ${b.rating} ⭐ (${b.reviews} reviews)</p>
      <p><strong>Deal:</strong> ${b.deals}</p>
      <div class="button-group">
        <button class="bookmark">⭐ Bookmark</button>
        <button class="review-btn">💬 Leave Review</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Filter
categoryFilter.addEventListener("change", () => {
  let filtered = businesses;
  if (categoryFilter.value !== "all") {
    filtered = businesses.filter(b => b.category === categoryFilter.value);
  }
  renderBusinesses(filtered);
});

// Sort
sortBy.addEventListener("change", () => {
  let sorted = [...businesses];
  if (sortBy.value === "rating") {
    sorted.sort((a, b) => b.rating - a.rating);
  } else if (sortBy.value === "reviews") {
    sorted.sort((a, b) => b.reviews - a.reviews);
  }
  renderBusinesses(sorted);
});

// Initial Load
renderBusinesses(businesses);
