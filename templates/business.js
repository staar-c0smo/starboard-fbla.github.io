import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";

// === Firebase Auth Elements ===
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginStatus = document.getElementById("loginStatus");

// === Auth Logic ===
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

onAuthStateChanged(auth, user => {
  if (user) {
    loginStatus.textContent = `Welcome, ${user.email}`;
  } else {
    loginStatus.textContent = "Not logged in";
  }
});

// === Business Data ===
const businesses = [
  { name: "Blueberry Cafe", category: "food", deal: "10% off pastries", rating: 4.7, reviews: [] },
  { name: "TechWave Solutions", category: "tech", deal: "Free consultation", rating: 4.9, reviews: [] },
  { name: "Trendy Threads", category: "retail", deal: "Buy 1 Get 1 Half Off", rating: 4.3, reviews: [] },
  { name: "GreenLeaf Market", category: "food", deal: "5% off groceries", rating: 4.6, reviews: [] },
];

// === DOM Elements ===
const grid = document.getElementById("businessGrid");
const selectedStars = {};

// === Render Businesses ===
function renderBusinesses(list) {
  grid.innerHTML = "";

  list.forEach(b => {
    const safeName = b.name.replace(/\s+/g,''); // for IDs
    const avgRating = b.reviews.length
      ? (b.reviews.reduce((a,r) => a+r.stars,0)/b.reviews.length).toFixed(1)
      : b.rating.toFixed(1);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <button class="bookmark-btn">★</button>
      <h3>${b.name}</h3>
      <p>Category: ${b.category}</p>
      <p class="deal">${b.deal}</p>
      <p>⭐ ${avgRating}</p>

      <div class="review-form">
        <p>Leave a Review:</p>
        <div class="stars" id="stars-${safeName}">
          ${[1,2,3,4,5].map((_, i) => `<span class="star" data-value="${i+1}">★</span>`).join("")}
        </div>
        <textarea id="reviewText-${safeName}" rows="2" placeholder="Write your review..."></textarea>
        <button class="submit-review-btn" data-name="${safeName}">Submit</button>
      </div>

      <div class="reviews-section">
        <button class="toggle-reviews-btn" data-name="${b.name}">Show Reviews</button>
        <div class="reviews" id="reviews-${b.name}" style="display:none;">
          ${b.reviews.map(r => `<p>⭐${r.stars} — ${r.text}</p>`).join("")}
        </div>
      </div>

    `;

    grid.appendChild(card);
  });

  attachStarEvents();
  attachSubmitEvents();
  attachBookmarkEvents();
  attachToggleReviews(); 
}

// === Star Events ===
function attachStarEvents() {
  document.querySelectorAll(".stars").forEach(container => {
    const stars = container.querySelectorAll(".star");
    const name = container.id.replace("stars-", "");

    stars.forEach((star, index) => {
      star.onclick = () => {
        stars.forEach(s => s.classList.remove("selected"));
        for (let i = 0; i <= index; i++) stars[i].classList.add("selected");
        selectedStars[name] = index + 1;
      };
    });
  });
}

// === Submit Review Events ===
function attachSubmitEvents() {
  document.querySelectorAll(".submit-review-btn").forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const textArea = document.getElementById(`reviewText-${name}`);
      const text = textArea.value.trim();
      const stars = selectedStars[name];

      if (!text || !stars) {
        alert("Please add both a review and a star rating.");
        return;
      }

      const biz = businesses.find(b => b.name.replace(/\s+/g,'') === name);
      biz.reviews.push({ text, stars });

      // Update average rating
      biz.rating = parseFloat((biz.reviews.reduce((a,r)=>a+r.stars,0)/biz.reviews.length).toFixed(1));

      // Clear input
      textArea.value = "";
      selectedStars[name] = null;

      // Append the new review instead of replacing
      const reviewsDiv = document.getElementById(`reviews-${biz.name}`);
      const newReviewP = document.createElement("p");
      newReviewP.textContent = `⭐${stars} — ${text}`;
      reviewsDiv.appendChild(newReviewP);

      // Update displayed average rating
      const avgRatingP = btn.closest(".card").querySelector("p:nth-of-type(4)");
      avgRatingP.textContent = `⭐ ${biz.rating}`;
    };
  });
}



// === Bookmark Events ===
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach((btn, index) => {
    btn.onclick = () => {
      alert(`Bookmarked ${businesses[index].name}!`);
    };
  });
}

function attachToggleReviews() {
  document.querySelectorAll(".toggle-reviews-btn").forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const section = document.getElementById(`reviews-${name}`);
      if (section.style.display === "block") {
        section.style.display = "none";
        btn.textContent = "Show Reviews";
      } else {
        section.style.display = "block";
        btn.textContent = "Hide Reviews";
      }
    };
  });
}

// === Filters / Sorting ===
document.getElementById("sortSelect").addEventListener("change", e => {
  let sorted = [...businesses];
  if (e.target.value === "name") sorted.sort((a,b)=>a.name.localeCompare(b.name));
  if (e.target.value === "rating") sorted.sort((a,b)=>b.rating - a.rating);
  renderBusinesses(sorted);
});

document.getElementById("categorySelect").addEventListener("change", e => {
  const filtered = e.target.value
    ? businesses.filter(b => b.category === e.target.value)
    : businesses;
  renderBusinesses(filtered);
});

// === Initial Render ===
renderBusinesses(businesses);
