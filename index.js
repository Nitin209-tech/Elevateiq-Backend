const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const app = express();
const apiKey = (process.env.GEMINI_API_KEY || '').trim();
console.log('--- BACKEND STARTUP ---');
console.log('CWD:', process.cwd());
console.log('Resolved .env Path:', envPath);
console.log('GEMINI_API_KEY Status:', apiKey ? 'FOUND (Starts with ' + apiKey.substring(0, 4) + ')' : 'NOT FOUND');
console.log('-----------------------');
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/enhance-idea', async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    console.log(`[ai] Initializing model for idea: "${idea.substring(0, 20)}..."`);
    
    // Safety settings
    const safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    const modelNames = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    let lastError;
    
    const prompt = `
      Transform this startup idea into a JSON object:
      Idea: "${idea}"
      Fields: title, description (2 paras), features (4 items), problems (3 items).
      Return raw JSON only.
    `;

    for (const modelName of modelNames) {
      try {
        console.log(`[ai] Attempting with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName, safetySettings });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        if (text) {
          const cleanText = text.replace(/```json|```/g, '').trim();
          const jsonResponse = JSON.parse(cleanText);
          console.log(`[ai] Success with ${modelName}!`);
          return res.json(jsonResponse);
        }
      } catch (err) {
        lastError = err;
        console.warn(`[ai] Model ${modelName} failed:`, err.message);
        if (err.status !== 404) break; // If it's not a 404, stop trying
      }
    }

    throw lastError || new Error('All models failed');
  } catch (error) {
    console.error('❌ SERVER ERROR:', error.message);
    res.status(500).json({ error: 'AI Enhancement failed', message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend Server is LIVE on port ${PORT}`);
  console.log('--- Configuration ---');
  console.log('PORT:', PORT);
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'Set' : 'MISSING');
  console.log('SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? 'Set' : 'MISSING');
  console.log('---------------------');
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Error: Port ${PORT} is already in use.`);
  } else {
    console.error('❌ Server Error:', err);
  }
  process.exit(1);
});

// Keep process alive
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server terminated');
  });
});
