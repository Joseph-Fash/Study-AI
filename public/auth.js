import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const db = getFirestore(app);

const loginSection = document.getElementById("loginSection");
const appSection = document.getElementById("appSection");
const authError = document.getElementById("authError");
const authTitle = document.getElementById("authTitle");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const toggleAuthBtn = document.getElementById("toggleAuthBtn");
const toggleText = document.getElementById("toggleText");

let isLoginMode = true;
let currentUser = null;

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
  currentUser = user;
  if (user) {
    loginSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    document.getElementById("userEmail").textContent = user.email;
    loadStudyHistory();
  } else {
    loginSection.classList.remove("hidden");
    appSection.classList.add("hidden");
  }
});

async function saveStudySession(fileName, summary, bullets, questions) {
  if (!currentUser) return;
  try {
    await addDoc(collection(db, "sessions"), {
      userId: currentUser.uid,
      fileName,
      summary,
      bullets,
      questions,
      createdAt: serverTimestamp(),
    });
    loadStudyHistory();
  } catch (err) {
    console.error("Error saving session:", err);
  }
}

async function loadStudyHistory() {
  if (!currentUser) return;
  try {
    const q = query(
      collection(db, "sessions"),
      where("userId", "==", currentUser.uid),
      orderBy("createdAt", "desc"),
    );
    const snapshot = await getDocs(q);
    const historyList = document.getElementById("historyList");
    if (!historyList) return;

    if (snapshot.empty) {
      historyList.innerHTML =
        "<p class='no-history'>No study sessions yet.</p>";
      return;
    }

    historyList.innerHTML = snapshot.docs
      .map((doc) => {
        const data = doc.data();
        return `
        <div class="history-item" 
          data-summary="${encodeURIComponent(data.summary)}"
          data-bullets="${encodeURIComponent(JSON.stringify(data.bullets))}"
          data-questions="${encodeURIComponent(JSON.stringify(data.questions))}"
          data-filename="${encodeURIComponent(data.fileName)}">
          <span class="history-filename">${data.fileName}</span>
          <span class="history-date">${data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString() : "Just now"}</span>
        </div>
      `;
      })
      .join("");

    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", () => {
        const summary = decodeURIComponent(item.dataset.summary);
        const bullets = JSON.parse(decodeURIComponent(item.dataset.bullets));
        const questions = JSON.parse(
          decodeURIComponent(item.dataset.questions),
        );
        window.loadSession(summary, bullets, questions);
      });
    });

    document.querySelectorAll(".history-item").forEach((item) => {
      item.addEventListener("click", () => {
        const summary = decodeURIComponent(item.dataset.summary);
        const bullets = JSON.parse(decodeURIComponent(item.dataset.bullets));
        const questions = JSON.parse(
          decodeURIComponent(item.dataset.questions),
        );
        window.loadSession(summary, bullets, questions);

        // Close sidebar on mobile
        const sidebar = document.querySelector(".sidebar");
        const overlay = document.getElementById("sidebarOverlay");
        if (sidebar) sidebar.classList.remove("open");
        if (overlay) overlay.classList.remove("active");
      });
    });
  } catch (err) {
    console.error("Error loading history:", err);
  }
}

window.saveStudySession = saveStudySession;
