const uploadBtn = document.getElementById("uploadBtn");
const fileInput = document.getElementById("fileInput");
const loader = document.getElementById("loader");
const resultSection = document.getElementById("resultSection");
const feynmanBtn = document.getElementById("feynmanBtn");

let documentText = "";

uploadBtn.addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a file first.");
    return;
  }

  const formData = new FormData();
  formData.append("document", file);

  loader.classList.remove("hidden");
  resultSection.classList.add("hidden");

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      loader.classList.add("hidden");

      if (data.message) {
        alert(data.message);
        return;
      }

      document.getElementById("summaryText").textContent = data.summary;
      window.saveStudySession(
        fileInput.files[0].name,
        data.summary,
        data.bullets,
        data.questions,
      );

      const bulletsList = document.getElementById("bulletsList");
      bulletsList.innerHTML = data.bullets.map((b) => `<li>${b}</li>`).join("");

      const questionsList = document.getElementById("questionsList");
      questionsList.innerHTML = data.questions
        .map((q) => `<li>${q}</li>`)
        .join("");

      documentText = data.summary;
      resultSection.classList.remove("hidden");
    })
    .catch((err) => {
      loader.classList.add("hidden");
      alert("Something went wrong. Check the console.");
      console.error(err);
    });
});

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".tab-btn")
      .forEach((b) => b.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.add("hidden"));
    btn.classList.add("active");
    document.getElementById(btn.dataset.tab).classList.remove("hidden");
  });
});

feynmanBtn.addEventListener("click", () => {
  const userExplanation = document.getElementById("feynmanInput").value.trim();
  if (!userExplanation) {
    alert("Please write your explanation first.");
    return;
  }

  const feynmanResult = document.getElementById("feynmanResult");
  feynmanResult.textContent = "Scoring your explanation...";

  fetch("/feynman", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      explanation: userExplanation,
      summary: documentText,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      feynmanResult.innerHTML = data.feedback;
    })
    .catch((err) => {
      feynmanResult.textContent = "Something went wrong.";
      console.error(err);
    });
});

let quizQuestions = [];
let currentQuestion = 0;
let quizScores = [];
let quizSummary = "";

document.getElementById("startQuizBtn").addEventListener("click", () => {
  quizQuestions = Array.from(
    document.getElementById("questionsList").querySelectorAll("li"),
  ).map((li) => li.textContent);
  quizSummary = documentText;
  currentQuestion = 0;
  quizScores = [];
  document.getElementById("quizStart").classList.add("hidden");
  document.getElementById("quizResults").classList.add("hidden");
  document.getElementById("quizQuestion").classList.remove("hidden");
  loadQuestion();
});

function loadQuestion() {
  document.getElementById("quizProgress").textContent =
    `Question ${currentQuestion + 1} of ${quizQuestions.length}`;
  document.getElementById("questionText").textContent =
    quizQuestions[currentQuestion];
  document.getElementById("quizAnswer").value = "";
  document.getElementById("answerFeedback").classList.add("hidden");
  document.getElementById("nextQuestionBtn").classList.add("hidden");
  document.getElementById("submitAnswerBtn").classList.remove("hidden");
}

document.getElementById("submitAnswerBtn").addEventListener("click", () => {
  const answer = document.getElementById("quizAnswer").value.trim();
  if (!answer) {
    alert("Please write an answer first.");
    return;
  }

  document.getElementById("submitAnswerBtn").classList.add("hidden");
  const feedback = document.getElementById("answerFeedback");
  feedback.textContent = "Scoring your answer...";
  feedback.classList.remove("hidden");

  fetch("/quiz-answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: quizQuestions[currentQuestion],
      answer: answer,
      summary: quizSummary,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      quizScores.push({
        question: quizQuestions[currentQuestion],
        score: data.score,
        verdict: data.verdict,
      });
      feedback.innerHTML = `
        <strong>Score: ${data.score}/10</strong><br>
        <em>${data.verdict}</em><br><br>
        ${data.explanation}
      `;
      document.getElementById("nextQuestionBtn").classList.remove("hidden");
    })
    .catch((err) => {
      feedback.textContent = "Error scoring answer.";
      console.error(err);
    });
});

document.getElementById("nextQuestionBtn").addEventListener("click", () => {
  currentQuestion++;
  if (currentQuestion < quizQuestions.length) {
    loadQuestion();
  } else {
    showQuizResults();
  }
});

function showQuizResults() {
  document.getElementById("quizQuestion").classList.add("hidden");
  const results = document.getElementById("quizResults");
  results.classList.remove("hidden");

  const total = quizScores.reduce((sum, s) => sum + s.score, 0);
  const max = quizScores.length * 10;
  const percentage = Math.round((total / max) * 100);

  document.getElementById("finalScore").textContent =
    `You scored ${total}/${max} (${percentage}%)`;

  const weak = quizScores.filter((s) => s.score < 6);
  const weakAreas = document.getElementById("weakAreas");
  if (weak.length > 0) {
    weakAreas.innerHTML = `<strong>Questions to review:</strong><ul>${weak.map((w) => `<li>${w.question}</li>`).join("")}</ul>`;
  } else {
    weakAreas.innerHTML = "<strong>Excellent! No weak areas detected.</strong>";
  }
}

window.loadSession = function (summary, bullets, questions) {
  document.getElementById("summaryText").textContent = summary;
  document.getElementById("bulletsList").innerHTML = bullets
    .map((b) => `<li>${b}</li>`)
    .join("");
  document.getElementById("questionsList").innerHTML = questions
    .map((q) => `<li>${q}</li>`)
    .join("");

  documentText = summary;
  quizQuestions = questions;

  document.getElementById("resultSection").classList.remove("hidden");

  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.add("hidden"));
  document.querySelector('[data-tab="summary"]').classList.add("active");
  document.getElementById("summary").classList.remove("hidden");

  window.scrollTo(0, 0);
};

const menuBtn = document.getElementById("menuBtn");
const sidebar = document.querySelector(".sidebar");
const overlay = document.getElementById("sidebarOverlay");

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay.classList.toggle("active");
  });

  overlay.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });
}


document.getElementById("retakeQuizBtn").addEventListener("click", () => {
  document.getElementById("quizResults").classList.add("hidden");
  document.getElementById("quizStart").classList.remove("hidden");
});
