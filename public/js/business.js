import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, arrayUnion
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// -------------------- FIREBASE CONFIG --------------------
const firebaseConfig = {
  apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
  authDomain: "starboardfbla.firebaseapp.com",
  databaseURL: "https://starboardfbla-default-rtdb.firebaseio.com",
  projectId: "starboardfbla",
  storageBucket: "starboardfbla.appspot.com",
  messagingSenderId: "208086177069",
  appId: "1:208086177069:web:660276fd96e897e17eefa4",
  measurementId: "G-KTL8VM78QY"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// -------------------- DOM ELEMENTS --------------------
const grid = document.getElementById("businessGrid");
const sortSelect = document.getElementById("sortSelect");
const categorySelect = document.getElementById("categorySelect");

// -------------------- GLOBAL STATE --------------------
let currentUser = null;
const selectedStars = {};
let businesses = [
  { name: "Blueberry Cafe", category: "food", deal: "10% off pastries", rating: 4.7 },
  { name: "TechWave Solutions", category: "tech", deal: "Free consultation", rating: 4.9 },
  { name: "Trendy Threads", category: "retail", deal: "Buy 1 Get 1 Half Off", rating: 4.3 },
  { name: "GreenLeaf Market", category: "food", deal: "5% off groceries", rating: 4.6 }
];

// -------------------- AUTH STATE --------------------
onAuthStateChanged(auth, async user => {
  currentUser = user;
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});

// -------------------- HELPERS --------------------
async function getUserFavorites(uid) {
  if (!uid) return [];
  const favDoc = await getDoc(doc(db, "userFavorites", uid));
  return favDoc.exists() ? favDoc.data().list || [] : [];
}

async function getBusinessReviews(name) {
  const reviewDoc = await getDoc(doc(db, "reviews", name));
  return reviewDoc.exists() ? reviewDoc.data().list || [] : [];
}

async function getCurrentlyDisplayedBusinesses() {
  let list = [...businesses];

  // Attach favorites for current user
  if (currentUser) {
    const favs = await getUserFavorites(currentUser.uid);
    list.forEach(b => b.favorite = favs.includes(b.name));
  }

  // Attach reviews and calculate dynamic average
  for (let b of list) {
    b.reviews = await getBusinessReviews(b.name);
    b.rating = b.reviews.length
      ? b.reviews.reduce((sum, r) => sum + r.stars, 0) / b.reviews.length
      : b.rating;
  }

  // Filter by category
  const category = categorySelect.value;
  if (category === "favorites") list = list.filter(b => b.favorite);
  else if (category) list = list.filter(b => b.category === category);

  // Sort
  if (sortSelect.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  if (sortSelect.value === "rating") list.sort((a,b) => b.rating - a.rating);

  return list;
}

// -------------------- RENDER --------------------
async function renderBusinesses(list) {
  grid.innerHTML = "";
  list.forEach(b => {
    const safeName = b.name.replace(/\s+/g, '');
    const avgRating = b.rating ? b.rating.toFixed(1) : "0.0";

    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <button class="bookmark-btn" data-name="${b.name}" style="color:${b.favorite ? "#FFD700" : "#bebebe"};">★</button>
      <h3>${b.name}</h3>
      <p>Category: ${b.category}</p>
      <p class="deal">${b.deal}</p>
      <p>⭐ ${avgRating}</p>

      <div class="review-form">
        <div class="stars" id="stars-${safeName}">
          ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join("")}
        </div>
        <textarea id="reviewText-${safeName}" placeholder="Write your review..."></textarea>
        <button class="submit-review-btn" data-name="${b.name}">Submit</button>
      </div>

      <div class="reviews-section">
        <button class="toggle-reviews-btn" data-name="${b.name}">Show Reviews (${b.reviews.length})</button>
        <div class="reviews" id="reviews-${b.name}" style="display:none;">
          ${b.reviews.map(r => `<p>⭐${r.stars} — <b>${r.userName}</b>: ${r.text}</p>`).join("")}
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

// -------------------- EVENTS --------------------
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

function attachSubmitEvents() {
  document.querySelectorAll(".submit-review-btn").forEach(btn => {
    btn.onclick = async () => {
      if (!currentUser) return alert("Log in to leave a review");
      const name = btn.dataset.name;
      const safeName = name.replace(/\s+/g, '');
      const stars = selectedStars[safeName];
      const text = document.getElementById(`reviewText-${safeName}`).value.trim();

      if (!stars || !text) return alert("Select stars and write a review!");

      const reviewDocRef = doc(db, "reviews", name);
      await setDoc(
        reviewDocRef,
        { list: arrayUnion({
            userId: currentUser.uid,
            userName: currentUser.email.split("@")[0],
            stars,
            text,
            timestamp: Date.now()
        }) },
        { merge: true }
      );

      // Clear inputs
      document.getElementById(`reviewText-${safeName}`).value = "";
      selectedStars[safeName] = null;

      // Refresh businesses
      renderBusinesses(await getCurrentlyDisplayedBusinesses());
    };
  });
}

function attachBookmarkEvents() {
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.onclick = async () => {
      if (!currentUser) return alert("Log in to save favorites");
      const name = btn.dataset.name;
      const favDocRef = doc(db, "userFavorites", currentUser.uid);
      let favs = await getUserFavorites(currentUser.uid);

      if (favs.includes(name)) favs = favs.filter(f => f !== name);
      else favs.push(name);

      await setDoc(favDocRef, { list: favs });
      renderBusinesses(await getCurrentlyDisplayedBusinesses());
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
        btn.textContent = `Show Reviews (${section.children.length})`;
      } else {
        section.style.display = "block";
        btn.textContent = `Hide Reviews (${section.children.length})`;
      }
    };
  });
}

// -------------------- FILTERS --------------------
categorySelect.addEventListener("change", async () => {
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});

sortSelect.addEventListener("change", async () => {
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});

// -------------------- INITIAL RENDER --------------------
renderBusinesses(await getCurrentlyDisplayedBusinesses());
