const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // There is no direct listModels in the standard SDK, but we can try to fetch a model info
    console.log("Testing gemini-1.5-flash...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("test");
    console.log("✅ gemini-1.5-flash works!");
  } catch (e) {
    console.log("❌ gemini-1.5-flash failed:", e.message);
  }

  try {
    console.log("Testing gemini-pro...");
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent("test");
    console.log("✅ gemini-pro works!");
  } catch (e) {
    console.log("❌ gemini-pro failed:", e.message);
  }
}

listModels();
