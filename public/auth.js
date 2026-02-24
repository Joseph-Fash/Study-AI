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
const authTitle = document.getElementById("authTitle");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const toggleAuthBtn = document.getElementById("toggleAuthBtn");
const toggleText = document.getElementById("toggleText");

let isLoginMode = true;

toggleAuthBtn.addEventListener("click", () => {
  isLoginMode = !isLoginMode;
  if (isLoginMode) {
    authTitle.textContent = "Welcome back";
    submitAuthBtn.textContent = "Log In";
    toggleText.textContent = "Don't have an account?";
    toggleAuthBtn.textContent = "Sign Up";
  } else {
    authTitle.textContent = "Create an account";
    submitAuthBtn.textContent = "Sign Up";
    toggleText.textContent = "Already have an account?";
    toggleAuthBtn.textContent = "Log In";
  }
  authError.textContent = "";
});

submitAuthBtn.addEventListener("click", async () => {
  const email = document.getElementById("authEmail").value.trim();
  const password = document.getElementById("authPassword").value.trim();

  if (!email || !password) {
    authError.textContent = "Please enter your email and password.";
    return;
  }

  try {
    if (isLoginMode) {
      await signInWithEmailAndPassword(auth, email, password);
    } else {
      await createUserWithEmailAndPassword(auth, email, password);
    }
  } catch (err) {
    if (
      err.code === "auth/user-not-found" ||
      err.code === "auth/wrong-password" ||
      err.code === "auth/invalid-credential"
    ) {
      authError.textContent = "Incorrect email or password.";
    } else if (err.code === "auth/email-already-in-use") {
      authError.textContent =
        "This email is already registered. Try logging in.";
    } else if (err.code === "auth/weak-password") {
      authError.textContent = "Password must be at least 6 characters.";
    } else {
      authError.textContent = err.message;
    }
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  await signOut(auth);
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    document.getElementById("userEmail").textContent = user.email;
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});
