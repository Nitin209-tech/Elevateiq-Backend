const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
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
    
    // Try gemini-1.5-flash first, fallback to gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `
      Act as a senior startup consultant. Take the following raw idea and transform it into a professional project post.
      
      Raw Idea: "${idea}"
      
      Return a JSON object with the following fields:
      - title: A catchy startup title.
      - description: A compelling narrative (2 paragraphs).
      - features: Array of 4 key features.
      - problems: Array of 3 challenges.
      
      Return ONLY the raw JSON object.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanText = text.replace(/```json|```/g, '').trim();
    const jsonResponse = JSON.parse(cleanText);
    
    console.log('[ai] Successfully enhanced idea');
    res.json(jsonResponse);
  } catch (error) {
    console.error('Gemini API Error:', error);
    
    // Fallback or detailed error response
    res.status(500).json({ 
      error: 'Failed to enhance idea', 
      details: error.message,
      code: error.status
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
