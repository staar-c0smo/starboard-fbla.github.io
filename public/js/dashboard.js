import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
  authDomain: "starboardfbla.firebaseapp.com",
  projectId: "starboardfbla",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const form = document.getElementById("addBusinessForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    // Convert images to base64
    const imageFiles = document.getElementById("businessImages").files;
    const imageURLs = [];
    for (const file of imageFiles) {
      const base64 = await fileToBase64(file);
      imageURLs.push(base64);
    }

    await addDoc(collection(db, "businesses"), {
      name: document.getElementById("businessName").value,
      category: document.getElementById("businessCategory").value,
      blurb: document.getElementById("businessBlurb").value,
      address: document.getElementById("businessAddress").value,
      deal: document.getElementById("businessDeal").value,
      rating: parseFloat(document.getElementById("businessRating").value) || 0,
      lat: parseFloat(document.getElementById("businessLat").value) || 0,
      lng: parseFloat(document.getElementById("businessLng").value) || 0,
      images: imageURLs,
      createdAt: new Date()
    });

    console.log("Business saved!");
    alert("Business added!");
    form.reset();

  } catch (err) {
    console.error("Error:", err);
    alert("Error: " + err.message);
  }
});