// Import Firebase modules for app initialization, authentication, and database operations
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js";
import {
  getFirestore, doc, setDoc, getDoc, arrayUnion
} from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// Firebase Configuration
// Contains credentials needed to initialize Firebase app for this project
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
// Get authentication instance for user login/logout operations
const auth = getAuth(app);
// Get Firestore database instance for storing and retrieving business data
const db = getFirestore(app);


let map;
let markers = [];
// DOM Elements
// Reference to the main grid container where business cards will be rendered
const grid = document.getElementById("businessGrid");
// Reference to sort dropdown (Sort By Name or Rating)
const sortSelect = document.getElementById("sortSelect");
// Reference to category filter dropdown (All, Food, Retail, Tech, Favorites)
const categorySelect = document.getElementById("categorySelect");

// Global State Management
// Stores the currently logged-in user object; null if not authenticated
let currentUser = null;
// Tracks which star rating the user selected for each business (before submitting review)
const selectedStars = {};
// Array of business objects with basic info (name, category, deal, default rating)
let businesses = [

{
name:"Blueberry Cafe",
category:"food",
deal:"10% off pastries",
rating:4.7,
lat:39.2680,
lng:-76.7980
},

{
name:"GreenLeaf Market",
category:"food",
deal:"5% off groceries",
rating:4.6,
lat:39.2702,
lng:-76.8045
},

{
name:"TechHub Repair",
category:"tech",
deal:"Free diagnostics",
rating:4.5,
lat:39.2651,
lng:-76.7921
},

{
name:"Trendy Threads",
category:"retail",
deal:"Buy 1 Get 1 Half Off",
rating:4.3,
lat:39.2665,
lng:-76.8002
}

];

// Authentication State Listener
// Watches for login/logout changes and updates the UI accordingly
onAuthStateChanged(auth, async user => {
  // Update global currentUser whenever auth state changes
  currentUser = user;
  // Re-render businesses with updated user context (favorites, etc.)
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});

// Helper Functions
// Fetch the list of businesses favorited by a specific user from Firestore
async function getUserFavorites(uid) {
  // Return empty array if user not logged in
  if (!uid) return [];
  // Query Firestore for this user's favorite businesses list
  const favDoc = await getDoc(doc(db, "userFavorites", uid));
  // Return the list if it exists, otherwise empty array
  return favDoc.exists() ? favDoc.data().list || [] : [];
}

// Fetch all reviews submitted for a specific business from Firestore
async function getBusinessReviews(name) {
  // Query Firestore for reviews collection document matching business name
  const reviewDoc = await getDoc(doc(db, "reviews", name));
  // Return list of reviews if document exists, otherwise empty array
  return reviewDoc.exists() ? reviewDoc.data().list || [] : [];
}

// Build the list of businesses that should be displayed based on filters and sorting
async function getCurrentlyDisplayedBusinesses() {
  // Start with a copy of all businesses
  let list = [...businesses];

  // Attach user favorites to each business if user is logged in
  // This marks which businesses the current user has favorited
  if (currentUser) {
    const favs = await getUserFavorites(currentUser.uid);
    list.forEach(b => b.favorite = favs.includes(b.name));
  }

  // Fetch and attach reviews for each business
  // Also recalculate the average rating based on all reviews
  for (let b of list) {
    b.reviews = await getBusinessReviews(b.name);
    // If reviews exist, average the star ratings; otherwise use default rating
    b.rating = b.reviews.length
      ? b.reviews.reduce((sum, r) => sum + r.stars, 0) / b.reviews.length
      : b.rating;
  }

  // Apply category filter
  // "favorites" shows only favorited businesses; other categories filter by type
  const category = categorySelect.value;
  if (category === "favorites") list = list.filter(b => b.favorite);
  else if (category) list = list.filter(b => b.category === category);

  // Apply sorting
  // Sort alphabetically by name if "name" selected, or by rating (highest first) if "rating" selected
  if (sortSelect.value === "name") list.sort((a,b) => a.name.localeCompare(b.name));
  if (sortSelect.value === "rating") list.sort((a,b) => b.rating - a.rating);

  // Return the filtered and sorted list of businesses
  return list;
}

// Render Businesses to DOM
// Takes a list of businesses and creates visual cards for each one
async function renderBusinesses(list) {

  // Clear the grid to remove any existing business cards
  grid.innerHTML = "";

  updateMapMarkers(list);

  // Loop through each business in the provided list
  list.forEach(b => {
    // Create a "safe" version of the business name for HTML IDs (removes spaces)
    // This is needed because spaces can cause issues in HTML attributes
    const safeName = b.name.replace(/\s+/g, '');

    // Format the rating to display 1 decimal place (e.g., 4.7)
    // Default to "0.0" if no rating exists yet
    const avgRating = b.rating ? b.rating.toFixed(1) : "0.0";

    // Create a new card element that will display this business
    const card = document.createElement("div");
    // Add CSS class "card" for styling
    card.className = "card";

    // Build the HTML for this business card
    card.innerHTML = `
      <!-- Favorite/bookmark button in top-right; shows as star, gold if favorited -->
      <button class="bookmark-btn" data-name="${b.name}" style="color:${b.favorite ? "#FFD700" : "#bebebe"};">★</button>

      <!-- Business name and basic information -->
      <h3>${b.name}</h3>
      <p class="deal">${b.deal}</p>
      <p>⭐ ${avgRating}</p>

      <!-- Form for users to submit a new review -->
      <div class="review-form">
        <!-- 5-star rating selector (user clicks stars to select rating) -->
        <div class="stars" id="stars-${safeName}">
          ${[1,2,3,4,5].map(i => `<span class="star" data-value="${i}">★</span>`).join("")}
        </div>
        <!-- Text area for review content -->
        <textarea id="reviewText-${safeName}" placeholder="Write your review..."></textarea>
        <!-- Button to submit the review -->
        <button class="submit-review-btn" data-name="${b.name}">Submit</button>
      </div>

      <!-- Section containing existing reviews for this business -->
      <div class="reviews-section">
        <!-- Expandable/collapsible button showing number of reviews -->
        <button class="toggle-reviews-btn" data-name="${b.name}">Show Reviews (${b.reviews.length})</button>

        <!-- Container for all reviews; hidden by default, shown when button is clicked -->
        <div class="reviews" id="reviews-${b.name}" style="display:none;">
          ${b.reviews.map(r => `<p>⭐${r.stars} — <b>${r.userName}</b>: ${r.text}</p>`).join("")}
        </div>
      </div>
    `;

    // Add the finished card to the grid
    grid.appendChild(card);
  });

  // Attach event listeners for all interactive elements
  attachStarEvents();        // Star rating selection
  attachSubmitEvents();      // Review submission
  attachBookmarkEvents();    // Favorite button
  attachToggleReviews();     // Show/hide reviews
}

// Event Attachment Functions
// These functions bind event listeners to interactive elements on the cards

// Attach star rating selection handlers

// Attach star rating selection handlers
function attachStarEvents() {
  // Find all star rating containers and add selection handlers
  document.querySelectorAll(".stars").forEach(container => {
    const stars = container.querySelectorAll(".star");
    // Extract business name from container ID (remove "stars-" prefix)
    const name = container.id.replace("stars-", "");

    // Add click handler to each star
    stars.forEach((star, index) => {
      star.onclick = () => {
        // Clear "selected" class from all stars first
        stars.forEach(s => s.classList.remove("selected"));
        // Add "selected" class to all stars up to and including clicked star
        for (let i = 0; i <= index; i++) stars[i].classList.add("selected");
        // Store the selected rating (index + 1 gives 1-5 scale)
        selectedStars[name] = index + 1;
      };
    });
  });
}

// Attach review submission handlers
function attachSubmitEvents() {
  // Find all review submit buttons and add click handlers
  document.querySelectorAll(".submit-review-btn").forEach(btn => {
    btn.onclick = async () => {
      // Require user to be logged in before submitting review
      if (!currentUser) return alert("Log in to leave a review");
      // Get business name from button data attribute
      const name = btn.dataset.name;
      // Create safe name (no spaces) for element IDs
      const safeName = name.replace(/\s+/g, '');
      // Get the star rating the user selected (1-5)
      const stars = selectedStars[safeName];
      // Get the review text from textarea and trim whitespace
      const text = document.getElementById(`reviewText-${safeName}`).value.trim();

      // Validate that both rating and text are provided
      if (!stars || !text) return alert("Select stars and write a review!");

      // Reference to the reviews document for this business in Firestore
      const reviewDocRef = doc(db, "reviews", name);
      // Add the new review to the list in Firestore (arrayUnion adds to array)
      await setDoc(
        reviewDocRef,
        { list: arrayUnion({
            userId: currentUser.uid,
            userName: currentUser.email.split("@")[0],  // Use email username for display
            stars,
            text,
            timestamp: Date.now()
        }) },
        { merge: true }  // Merge with existing reviews, don't overwrite
      );

      // Clear the review form inputs
      document.getElementById(`reviewText-${safeName}`).value = "";
      selectedStars[safeName] = null;

      // Re-render the businesses to show the new review
      renderBusinesses(await getCurrentlyDisplayedBusinesses());
    };
  });
}

// Attach favorite/bookmark button handlers
function attachBookmarkEvents() {
  // Find all bookmark buttons and add click handlers
  document.querySelectorAll(".bookmark-btn").forEach(btn => {
    btn.onclick = async () => {
      // Require user to be logged in before bookmarking
      if (!currentUser) return alert("Log in to save favorites");
      // Get the business name from button data attribute
      const name = btn.dataset.name;
      // Reference to this user's favorites list in Firestore
      const favDocRef = doc(db, "userFavorites", currentUser.uid);
      // Fetch the current list of favorites for this user
      let favs = await getUserFavorites(currentUser.uid);

      // Toggle: remove from favorites if already there, add if not
      if (favs.includes(name)) favs = favs.filter(f => f !== name);
      else favs.push(name);

      // Update the favorites list in Firestore
      await setDoc(favDocRef, { list: favs });
      // Re-render to update visual feedback (star color, favorites filter)
      renderBusinesses(await getCurrentlyDisplayedBusinesses());
    };
  });
}

// -------------------- EVENTS --------------------

// Attach show/hide reviews button handlers
function attachToggleReviews() {
  // Find all buttons for toggling review visibility
  document.querySelectorAll(".toggle-reviews-btn").forEach(btn => {
    // Add click handler to toggle review section visibility
    btn.onclick = () => {
      // Get the business name from button data attribute
      const name = btn.dataset.name;
      // Find the reviews container for this business
      const section = document.getElementById(`reviews-${name}`);

      // Toggle visibility: hide if showing, show if hidden
      if (section.style.display === "block") {
        section.style.display = "none";
        // Update button text to show "Show Reviews"
        btn.textContent = `Show Reviews (${section.children.length})`;
      }
      else {
        section.style.display = "block";
        // Update button text to show "Hide Reviews"
        btn.textContent = `Hide Reviews (${section.children.length})`;
      }
    };
  });
}

// Filter and Sort Event Listeners
// Re-render businesses whenever category filter changes
categorySelect.addEventListener("change", async () => {
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});

// Re-render businesses whenever sort order changes
sortSelect.addEventListener("change", async () => {
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
});


function initMap(){

  map = L.map('map').setView([39.2673, -76.7983], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

}

function updateMapMarkers(list){

  if(!map) return;

  markers.forEach(m => map.removeLayer(m));
  markers = [];

  list.forEach(b => {

    if(!b.lat || !b.lng) return;

    const marker = L.marker([b.lat, b.lng])
      .addTo(map)
      .bindPopup(`<b>${b.name}</b><br>${b.deal}`);

    markers.push(marker);

  });

}

async function refreshBusinesses(){
  renderBusinesses(await getCurrentlyDisplayedBusinesses());
}
// -------------------- INITIAL RENDER --------------------
initMap();
renderBusinesses(await getCurrentlyDisplayedBusinesses());
