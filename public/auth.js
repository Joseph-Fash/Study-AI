import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAOgRapTpaWmuT0PQsRJxvTfYLYvXIFywA",
  authDomain: "documind-5ab4d.firebaseapp.com",
  projectId: "documind-5ab4d",
  storageBucket: "documind-5ab4d.firebasestorage.app",
  messagingSenderId: "461410007160",
  appId: "1:461410007160:web:2e8b4129d3a8dca9b2d58d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const authError = document.getElementById("authError");

document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authError.textContent = err.message;
  }
});

document.getElementById("signupBtn").addEventListener("click", async () => {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();
  try {
    await createUserWithEmailAndPassword(auth, email, password);
  } catch (err) {
    authError.textContent = err.message;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  console.log("Auth state changed, user:", user);
  if (user) {
    console.log("Showing app section");
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    document.getElementById("userEmail").textContent = user.email;
  } else {
    console.log("Showing login section");
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});
