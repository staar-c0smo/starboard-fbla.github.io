// import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
// import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

// const firebaseConfig = {
//   apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
//   authDomain: "starboardfbla.firebaseapp.com",
//   projectId: "starboardfbla",
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// function fileToBase64(file) {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(file);
//   });
// }

// const form = document.getElementById("addBusinessForm");

// form.addEventListener("submit", async (e) => {
//   e.preventDefault();

//   try {
//     // Convert images to base64
//     const imageFiles = document.getElementById("businessImages").files;
//     const imageURLs = [];
//     for (const file of imageFiles) {
//       const base64 = await fileToBase64(file);
//       imageURLs.push(base64);
//     }

//     await addDoc(collection(db, "businesses"), {
//       name: document.getElementById("businessName").value,
//       category: document.getElementById("businessCategory").value,
//       blurb: document.getElementById("businessBlurb").value,
//       address: document.getElementById("businessAddress").value,
//       deal: document.getElementById("businessDeal").value,
//       rating: parseFloat(document.getElementById("businessRating").value) || 0,
//       lat: parseFloat(document.getElementById("businessLat").value) || 0,
//       lng: parseFloat(document.getElementById("businessLng").value) || 0,
//       images: imageURLs,
//       createdAt: new Date()
//     });

//     console.log("Business saved!");
//     alert("Business added!");
//     form.reset();

//   } catch (err) {
//     console.error("Error:", err);
//     alert("Error: " + err.message);
//   }
// });


import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js";

/* ===============================
   FIREBASE SETUP
================================ */

const firebaseConfig = {
  apiKey: "AIzaSyDDlpTxDMa83H32RwA_mE3E5zSMQClW_j0",
  authDomain: "starboardfbla.firebaseapp.com",
  projectId: "starboardfbla"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ===============================
   SETTINGS
================================ */

const MAX_IMAGES = 3;
const MAX_WIDTH = 800;
const MAX_HEIGHT = 800;
const IMAGE_QUALITY = 0.7;

/* ===============================
   IMAGE COMPRESSION
================================ */

function compressImage(file) {
  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.onload = (event) => {

      const img = new Image();

      img.onload = () => {

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;

        // Resize image while keeping aspect ratio
        if (width > height && width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        } 
        else if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }

        canvas.width = width;
        canvas.height = height;

        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", IMAGE_QUALITY);

        resolve(compressedBase64);
      };

      img.onerror = reject;
      img.src = event.target.result;
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===============================
   FORM HANDLING
================================ */

const form = document.getElementById("addBusinessForm");

form.addEventListener("submit", async (event) => {

  event.preventDefault();

  try {

    const imageInput = document.getElementById("businessImages");
    const files = imageInput.files;

    if (files.length > MAX_IMAGES) {
      alert(`Please upload a maximum of ${MAX_IMAGES} images.`);
      return;
    }

    const compressedImages = [];

    for (const file of files) {

      const compressed = await compressImage(file);

      compressedImages.push(compressed);
    }

    /* ===============================
       CREATE BUSINESS OBJECT
    ================================ */

    const businessData = {
      name: document.getElementById("businessName").value,
      category: document.getElementById("businessCategory").value,
      blurb: document.getElementById("businessBlurb").value,
      address: document.getElementById("businessAddress").value,
      deal: document.getElementById("businessDeal").value,
      rating: parseFloat(document.getElementById("businessRating").value) || 0,
      lat: parseFloat(document.getElementById("businessLat").value) || 0,
      lng: parseFloat(document.getElementById("businessLng").value) || 0,
      images: compressedImages,
      createdAt: new Date()
    };

    /* ===============================
       SAVE TO FIRESTORE
    ================================ */

    await addDoc(collection(db, "businesses"), businessData);

    alert("Business added successfully!");
    form.reset();

  } catch (error) {

    console.error("Upload Error:", error);
    alert("Something went wrong while saving the business.");

  }

});