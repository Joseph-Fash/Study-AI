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
