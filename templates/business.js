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
  { name: "Blueberry Cafe", category: "food", deal: "10% off pastries", rating: 4.7, reviews: [], favorite: false },
  { name: "TechWave Solutions", category: "tech", deal: "Free consultation", rating: 4.9, reviews: [], favorite: false },
  { name: "Trendy Threads", category: "retail", deal: "Buy 1 Get 1 Half Off", rating: 4.3, reviews: [], favorite: false },
  { name: "GreenLeaf Market", category: "food", deal: "5% off groceries", rating: 4.6, reviews: [], favorite: false },
];


// === DOM Elements ===
const grid = document.getElementById("businessGrid");
const selectedStars = {};

// === Render Businesses ===
function renderBusinesses(list) {
  grid.innerHTML = "";

  const bookmarkBtn = card.querySelector(".bookmark-btn");
  bookmarkBtn.style.color = b.favorite ? "#FFD700" : "#ff9800";


  list.forEach(b => {
    const safeName = b.name.replace(/\s+/g,''); // for IDs
    const avgRating = b.reviews.length
      ? (b.reviews.reduce((a,r) => a+r.stars,0)/b.reviews.length).toFixed(1)
      : b.rating.toFixed(1);

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <button class="bookmark-btn" data-name="${b.name}">★</button>
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
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.onclick = () => {
      const name = btn.dataset.name;
      const biz = businesses.find(b => b.name === name);
      biz.favorite = !biz.favorite;

      // Change button color
      btn.style.color = biz.favorite ? "#FFD700" : "#ff9800";

      // Re-render based on category filter
      const selectedCategory = document.getElementById("categorySelect").value;
      let listToRender;
      if (selectedCategory === "favorites") {
        listToRender = businesses.filter(b => b.favorite);
      } else if (selectedCategory) {
        listToRender = businesses.filter(b => b.category === selectedCategory);
      } else {
        listToRender = businesses;
      }
      renderBusinesses(listToRender);
    };
  });
}




// === Bookmark Events ===
function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach((btn, index) => {
    btn.onclick = () => {
      const biz = businesses[index];
      biz.favorite = !biz.favorite;

      // Change the button color
      btn.style.color = biz.favorite ? "#FFD700" : "#ff9800";

      // Re-render businesses (apply filters if filtering by favorites)
      const categorySelect = document.getElementById("categorySelect");
      const selectedCategory = categorySelect.value;
      let listToRender;

      if (selectedCategory === "favorites") {
        listToRender = businesses.filter(b => b.favorite);
      } else if (selectedCategory) {
        listToRender = businesses.filter(b => b.category === selectedCategory);
      } else {
        listToRender = businesses;
      }

      renderBusinesses(listToRender);
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
  let filtered;
  if (e.target.value === "favorites") {
    filtered = businesses.filter(b => b.favorite); // only bookmarked
  } else if (e.target.value) {
    filtered = businesses.filter(b => b.category === e.target.value); // normal category
  } else {
    filtered = businesses; // all
  }
  renderBusinesses(filtered);
});



// === Initial Render ===
renderBusinesses(businesses);
