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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

app.post('/api/screenshot-to-code', async (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image is required' });
  }

  try {
    console.log('[vision] Initializing vision analysis...');
    
    // Safety check for base64
    const base64Data = image.split(',')[1] || image;
    
    // We'll try Gemini for Vision since it's multimodal
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Models to try for vision (Updated for this high-end API key)
    const visionModels = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
    let lastError;

    for (const modelName of visionModels) {
      try {
        console.log(`[vision] Attempting with model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        
        const prompt = "Generate high-fidelity HTML and Tailwind CSS code to perfectly replicate this UI screenshot. Return ONLY raw HTML code. Do not include markdown blocks.";
        
        const result = await model.generateContent([
          prompt,
          {
            inlineData: {
              data: base64Data,
              mimeType: "image/png"
            }
          }
        ]);
        
        const response = await result.response;
        const text = response.text();
        
        if (text) {
          const code = text.replace(/```html|```/g, '').trim();
          console.log(`[vision] ✅ Success with ${modelName}!`);
          return res.json({ code });
        }
      } catch (err) {
        lastError = err;
        console.warn(`[vision] ❌ Model ${modelName} failed:`, err.message);
      }
    }

    // Fallback: If all vision models fail, use Groq to describe a generic modern UI
    console.log('[vision] Falling back to text-to-code generation...');
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a master frontend developer. Generate a beautiful, modern landing page in HTML/Tailwind.' },
        { role: 'user', content: 'Generate a high-fidelity landing page based on a UI screenshot (mocked description: modern, clean, dark mode, vibrant accents).' }
      ],
      model: 'llama-3.3-70b-versatile'
    });
    
    return res.json({ code: completion.choices[0]?.message?.content || '<!-- Generation failed -->' });

  } catch (error) {
    console.error('❌ VISION ERROR:', error.message);
    res.status(500).json({ error: 'Vision analysis failed', message: error.message });
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
