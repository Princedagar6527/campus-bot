import dotenv from "dotenv";
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.error) {
      console.error("API Response Error:", JSON.stringify(data.error, null, 2));
    } else {
      console.log("Available Models for your key:");
      const generateModels = (data.models || [])
        .filter(m => m.supportedGenerationMethods?.includes("generateContent"))
        .map(m => m.name.replace("models/", ""));
      console.log(generateModels);
    }
  } catch (err) {
    console.error("Fetch failed:", err.message);
  }
}

checkModels();