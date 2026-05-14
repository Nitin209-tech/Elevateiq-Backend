const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const app = express();
const apiKey = process.env.GEMINI_API_KEY;
console.log('--- BACKEND STARTUP ---');
console.log('Looking for .env at:', path.resolve(process.cwd(), '.env'));
console.log('GEMINI_API_KEY found:', apiKey ? 'YES (Starts with ' + apiKey.substring(0, 4) + '...)' : 'NO');
console.log('-----------------------');
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/enhance-idea', async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    console.log(`[ai] Processing idea: "${idea}"`);
    
    // Safety settings to prevent unnecessary blocks
    const safetySettings = [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ];

    let model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', safetySettings });
    
    const prompt = `
      Transform this startup idea into a JSON object:
      Idea: "${idea}"
      Fields: title, description (2 paras), features (4 items), problems (3 items).
      Return raw JSON only.
    `;

    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (modelErr) {
      console.warn('Flash model failed, trying Pro model...');
      model = genAI.getGenerativeModel({ model: 'gemini-pro', safetySettings });
      result = await model.generateContent(prompt);
    }

    const response = await result.response;
    const text = response.text();
    
    if (!text) {
      throw new Error('AI returned empty response');
    }

    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonResponse = JSON.parse(cleanText);
    
    console.log('[ai] Successfully enhanced idea');
    res.json(jsonResponse);
  } catch (error) {
    console.error('❌ GEMINI ERROR:', error);
    console.error('Error Stack:', error.stack);
    
    res.status(500).json({ 
      error: 'Failed to enhance idea', 
      message: error.message,
      details: error.response?.promptFeedback || 'No feedback'
    });
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
