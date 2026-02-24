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
