const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GEMINI_API_KEY;

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.models) {
        console.log("Available Models:");
        json.models.forEach(m => console.log(`- ${m.name}`));
      } else {
        console.log("No models found:", json);
      }
    } catch (e) {
      console.log("Error parsing response:", e.message);
      console.log("Raw response:", data);
    }
  });
}).on('error', (err) => {
  console.log("Error:", err.message);
});
