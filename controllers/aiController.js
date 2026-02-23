require("dotenv").config();
const Groq = require("groq-sdk");

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeDocument(text) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: "system",
        content:
          "You are a study assistant. When given a document, return a JSON object with three fields: summary (a short paragraph), bullets (an array of 5 key points), and questions (an array of 5 study questions). Return only valid JSON, nothing else.",
      },
      {
        role: "user",
        content: `Analyze this document:\n\n${text.slice(0, 3000)}`,
      },
    ],
  });

  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { analyzeDocument };
