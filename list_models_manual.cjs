const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function listModelsManual() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await axios.get(url);
    console.log("Available Models:");
    response.data.models.forEach(m => console.log(`- ${m.name}`));
  } catch (e) {
    console.error("❌ Failed to list models:", e.response ? e.response.data : e.message);
  }
}

listModelsManual();
