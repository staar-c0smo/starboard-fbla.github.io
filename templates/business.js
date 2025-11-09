import { auth } from "./firebase-config.js";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";

// Elements
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");
const loginStatus = document.getElementById("loginStatus");
const selectedStars = {}; 

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
  { name: "Java Jolt Cafe", category: "food", rating: 4.5, reviews: 42, deals: "10% off coffee" },
  { name: "GreenLeaf Groceries", category: "retail", rating: 4.2, reviews: 33, deals: "Buy 1 Get 1 on produce" },
  { name: "Sparkle Cleaners", category: "services", rating: 4.8, reviews: 58, deals: "20% off first wash" },
  { name: "Tech Haven", category: "retail", rating: 4.7, reviews: 80, deals: "Student discount: 15% off" },
  { name: "Sunny Side Diner", category: "food", rating: 4.6, reviews: 51, deals: "Free dessert with entrée" },
];

// Elements
const list = document.getElementById("business-list");
const categoryFilter = document.getElementById("categoryFilter");
const sortBy = document.getElementById("sortBy");

function renderBusinesses(data) {
  list.innerHTML = "";
  data.forEach(b => {
    const card = document.createElement("div");
    card.className = "business-card";

    const avgRating = b.reviews.length
      ? (b.reviews.reduce((a, r) => a + r.stars, 0) / b.reviews.length).toFixed(1)
      : b.rating.toFixed(1);

    card.innerHTML = `
      <h3>${b.name}</h3>
      <p><strong>Category:</strong> ${b.category}</p>
      <p class="rating"><strong>Rating:</strong> ${avgRating} ⭐ (${b.reviews.length} reviews)</p>
      <p><strong>Deal:</strong> ${b.deals}</p>
      <div class="review-form">
        <p>Leave a Review:</p>
          <div class="stars" id="stars-${b.name}">
            ${[1,2,3,4,5].map((_, i) => `<span class="star" data-value="${i+1}">★</span>`).join("")}
          </div>
        <textarea id="reviewText-${b.name}" rows="2" placeholder="Write your review..."></textarea>
        <button class="submit-review-btn" data-name="${b.name}">Submit</button>
      </div>
    `;
    list.appendChild(card);
  });

  attachStarEvents();
  attachReviewSubmitEvents(); // attach submit handlers after rendering
}

function attachReviewSubmitEvents() {
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

      const biz = businesses.find(b => b.name === name);
      biz.reviews.push({ text, stars });

      // Update average rating
      const avg = biz.reviews.reduce((a, r) => a + r.stars, 0) / biz.reviews.length;
      biz.rating = parseFloat(avg.toFixed(1));

      textArea.value = "";
      selectedStars[name] = null;

      renderBusinesses(businesses);
    };
  });
}


function attachStarEvents() {
  document.querySelectorAll(".stars").forEach(container => {
    const stars = container.querySelectorAll(".star");
    const name = container.id.replace("stars-", "");

    stars.forEach((star, index) => {
      star.onclick = () => {
        // Deselect all
        stars.forEach(s => s.classList.remove("selected"));
        // Highlight clicked stars
        for (let i = 0; i <= index; i++) {
          stars[i].classList.add("selected");
        }
        // Save selected value
        selectedStars[name] = index + 1;
      };
    });
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
