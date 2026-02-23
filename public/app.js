const uploadBtn = document.getElementById('uploadBtn')
const fileInput = document.getElementById('fileInput')
const result =document.getElementById('result')

uploadBtn.addEventListener('click', () => {
  const file = fileInput.files[0]

  if (!file) {
    result.textContent = 'Please select a file first.'
    return;
  }

  const formData = new FormData()
  formData.append('document', file)

  result.textContent = 'Uploading...'

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.message) {
        result.textContent = data.message;
        return;
      }
      result.innerHTML = `
      <h2>Summary</h2>
      <p>${data.summary}</p>
      <h2>Key Points</h2>
      <ul>${data.bullets.map((b) => `<li>${b}</li>`).join("")}</ul>
      <h2>Study Questions</h2>
      <ol>${data.questions.map((q) => `<li>${q}</li>`).join("")}</ol>
    `;
    })
    .catch((err) => {
      result.textContent = "Upload failed.";
      console.error(err);
    });
})