const fs = require('fs')
require("dotenv").config();
const Groq = require("groq-sdk");


const client = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function analyzeDocument(text) {
  let messages;

  if (text.startsWith("IMAGE:")) {
    const filePath = text.replace("IMAGE:", "");
    const imageData = fs.readFileSync(filePath);
    const base64Image = imageData.toString("base64");

    messages = [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
          {
            type: "text",
            text: `You are a friendly study assistant. Read all the text in this image and return a JSON object with exactly three fields:
            - summary: a clear simple paragraph of at least 150 words explaining the main ideas in plain language
            - bullets: an array of at least 10 key points in simple short sentences
            - questions: an array of at least 15 study questions covering every concept
            Return only valid JSON, nothing else.`,
          },
        ],
      },
    ];
  } else {
    messages = [
      {
        role: "system",
        content: `You are a friendly study assistant helping students understand their documents. When given a document, return a JSON object with exactly three fields:
        - summary: a clear, simple paragraph of at least 150 words explaining the main ideas in plain language a student can easily understand. Avoid complex grammar and jargon.
        - bullets: an array of at least 10 key points written in simple, short sentences covering every important concept in the document
        - questions: an array of at least 15 study questions that cover every section and concept in the document, ranging from basic recall to deeper understanding, written in simple language
        Return only valid JSON, nothing else.`,
      },
      {
        role: "user",
        content: `Analyze this document thoroughly:\n\n${text.slice(0, 12000)}`,
      },
    ];
  }

  const model = text.startsWith("IMAGE:")
    ? "meta-llama/llama-4-scout-17b-16e-instruct"
    : "llama-3.3-70b-versatile";

  const response = await client.chat.completions.create({
    model,
    messages,
  });
  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

async function scoreFeynman(explanation, summary) {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly and encouraging study coach talking directly to a student. A student has explained a document in their own words. Compare their explanation to the document summary and give feedback in simple, clear language a student can easily understand. Structure your feedback like this: Score (out of 10), What You Got Right, What You Missed, What Was Wrong, and a short encouraging closing message. Avoid complex grammar and academic language — keep it simple, warm and direct.",
      },
      {
        role: "user",
        content: `Document summary: ${summary}\n\nStudent explanation: ${explanation}`,
      },
    ],
  });
  return response.choices[0].message.content;
}

async function scoreAnswer(question, answer, summary) {
  const response = await client.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a friendly study coach grading a student answer. Given a question, the student answer, and the document summary, give: a score out of 10, a simple one-sentence verdict (correct, partially correct, or incorrect), and a brief simple explanation of the correct answer. Keep language simple and encouraging. Return as JSON with fields: score, verdict, explanation.",
      },
      {
        role: "user",
        content: `Question: ${question}\nStudent answer: ${answer}\nDocument summary: ${summary}`,
      },
    ],
  });
  const content = response.choices[0].message.content;
  const cleaned = content.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

module.exports = { analyzeDocument, scoreFeynman, scoreAnswer };
