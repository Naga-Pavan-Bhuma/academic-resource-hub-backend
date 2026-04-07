import axios from "axios";
import { createRequire } from "module";
import PdfSummary from "../models/PdfSummary.js";


import Quiz from "../models/Quiz.js";

/* =========================
   pdf-parse (CommonJS)
========================= */
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/* =========================
   Helper: Generate Summary
========================= */
const generateSummary = async (text) => {
  const cleanedText = text.replace(/\s+/g, " ").substring(0, 12000);

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
    {
      contents: [
        {
          parts: [
            {
              text: `
You are an academic assistant.

Summarize the following academic PDF content in clear bullet points.
Focus on:
- Key concepts
- Important definitions
- Main conclusions

Content:
${cleanedText}
              `,
            },
          ],
        },
      ],
    },
    {
      params: {
        key: process.env.GEMINI_API_KEY,
      },
    }
  );

  return response.data.candidates[0].content.parts[0].text;
};

/* =========================
   Controller
========================= */
export const summarizePdf = async (req, res) => {
  try {
    const { pdfUrl } = req.body;
    if (!pdfUrl) {
      return res.status(400).json({ message: "PDF URL is required" });
    }

    // 1️⃣ Check if already summarized
    const existing = await PdfSummary.findOne({ pdfUrl });
    if (existing) {
      return res.status(200).json({ summary: existing.summary });
    }

    // 2️⃣ Download PDF
    const pdfResponse = await axios.get(pdfUrl, {
      responseType: "arraybuffer",
    });

    // 3️⃣ Extract text
    const pdfData = await pdfParse(pdfResponse.data);
    if (!pdfData.text) {
      return res.status(400).json({ message: "No readable text in PDF" });
    }

    // 4️⃣ Generate summary
    const summary = await generateSummary(pdfData.text);

    // 5️⃣ Store in DB
    await PdfSummary.create({
      pdfUrl,
      text: pdfData.text,
      summary,
    });

    return res.status(200).json({ summary });
  } catch (error) {
    console.error("PDF Summary Error:", error.message);
    return res.status(500).json({ message: "Failed to summarize PDF" });
  }
};


export const chatWithPdf = async (req, res) => {
  try {
    const { pdfUrl, question } = req.body;

    if (!pdfUrl || !question) {
      return res.status(400).json({
        message: "pdfUrl and question are required",
      });
    }

    // 1️⃣ Get PDF data
    const pdfData = await PdfSummary.findOne({ pdfUrl });
    if (!pdfData) {
      return res.status(404).json({
        message: "PDF not summarized yet",
      });
    }

    // 2️⃣ Build strict prompt
    const prompt = `
You are an academic assistant.

Answer ONLY using the provided PDF content.
If the answer is not present in the PDF, reply:
"The information is not available in the provided PDF."

PDF Summary:
${pdfData.summary}

PDF Content:
${pdfData.text.substring(0, 8000)}

User Question:
${question}
`;

    // 3️⃣ Call Gemini
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    const answer =
      response.data.candidates[0].content.parts[0].text;

    return res.status(200).json({ answer });
  } catch (error) {
    console.error("Chat PDF Error:", error.message);
    return res.status(500).json({
      message: "Failed to answer question",
    });
  }
};


export const submitQuiz = async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    let score = 0;

    const results = quiz.questions.map((q, index) => {
      const isCorrect = answers[index] === q.correctAnswer;
      if (isCorrect) score++;

      return {
        question: q.question,
        selected: answers[index],
        correct: q.correctAnswer,
        isCorrect,
      };
    });

    return res.json({
      score,
      total: quiz.questions.length,
      results, // ✅ IMPORTANT
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Submit failed" });
  }
};

export const generateQuiz = async (req, res) => {
  try {
    const { pdfUrl } = req.body;

    const pdfData = await PdfSummary.findOne({ pdfUrl });

    if (!pdfData) {
      return res.status(404).json({ message: "PDF not summarized yet" });
    }

    const prompt = `
You are an academic assistant.

Generate a quiz from the given content.

Rules:
- 5 MCQ questions
- 2 short answer questions
- Each MCQ should have 4 options
- Provide correct answer clearly

Return in JSON format like:
[
  {
    "question": "...",
    "options": ["A", "B", "C", "D"],
    "correctAnswer": "A",
    "type": "mcq"
  },
  {
    "question": "...",
    "correctAnswer": "...",
    "type": "short"
  }
]

Content:
${pdfData.text.substring(0, 8000)}
`;

    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent",
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        params: { key: process.env.GEMINI_API_KEY },
      }
    );

    let quizText = response.data.candidates[0].content.parts[0].text;

    // Clean JSON (important)
    quizText = quizText.replace(/```json|```/g, "");

    const questions = JSON.parse(quizText);

    const quiz = await Quiz.create({
      userId: req.userId,
      pdfUrl,
      questions,
    });

    res.json(quiz);

  } catch (err) {
    console.error("Quiz generation error:", err);
    res.status(500).json({ message: "Failed to generate quiz" });
  }
};