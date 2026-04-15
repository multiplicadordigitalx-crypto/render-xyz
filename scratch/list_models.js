import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });


async function listModels() {
  const apiKey = process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No API key found in VITE_GEMINI_API_KEY");
    process.exit(1);
  }

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
      headers: {
        'Referer': 'https://render-xyz.vercel.app'
      }
    });

    const data = await response.json();
    
    if (data.models) {
      console.log("Available models:");
      data.models.forEach(m => console.log(`- ${m.name}`));
    } else {
      console.log("Response:", JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

listModels();
