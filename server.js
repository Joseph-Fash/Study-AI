require("dotenv").config();
const express = require("express");
const { analyzeDocument, scoreFeynman } = require("./controllers/aiController");
const multer = require("multer");
const { extractText } = require("./utils/parseDoc");
const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

app.use(express.static("public"));

app.post("/upload", upload.single("document"), async (req, res) => {
  try {
    if (!req.file) {
      return res.json({ message: "No file received." });
    }

    const text = await extractText(req.file.path, req.file.mimetype);

    if (!text) {
      return res.json({ message: "Could not extract text from this file." });
    }

    const result = await analyzeDocument(text);
    res.json(result);
  } catch (err) {
    console.error("Error:", err.message);
    res.json({ message: "Something went wrong: " + err.message });
  }
});

app.use(express.json())

app.post('/feynman', async (req, res) => {
  try {
      const { explanation, summary } = req.body
      const feedback = await scoreFeynman(explanation, summary)
      res.json({feedback})
    } catch (err) {
      res.json({ feedback: 'Could not score explanation😪: ' + err.message })
    }
})

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
