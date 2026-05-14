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

const { Groq } = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.VITE_GROQ_API_KEY });

app.post('/api/enhance-idea', async (req, res) => {
  const { idea } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Idea is required' });
  }

  try {
    console.log(`[ai] Initializing Groq for idea: "${idea.substring(0, 20)}..."`);
    
    const prompt = `
      Deeply architect this startup project idea: "${idea}"
      
      Generate a comprehensive, high-fidelity JSON object with:
      1. title: A punchy, professional startup name.
      2. description: 3-4 expansive, insightful paragraphs explaining the vision, the 'why', and the long-term impact.
      3. features: 6-8 specific, high-value technical features.
      4. problems: 4-5 deep market friction points this solves.
      5. sections: An array of 3-4 extra sections. Each section has a 'title' and 'content' (can be a string or an array of strings). 
         Choose from: "Target Audience", "Revenue Model", "Technical Stack", "Go-to-Market Strategy", "Future Roadmap".
         Vary which sections you choose to keep it fresh.
      
      Return raw JSON only. Do not include markdown code blocks.
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a startup architect. Respond only with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content;
    if (content) {
      const jsonResponse = JSON.parse(content);
      console.log(`[ai] ✅ Success with Groq!`);
      // We return the full object, the frontend will decide how to save it
      return res.json(jsonResponse);
    }

    throw new Error('No content returned from Groq');
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
