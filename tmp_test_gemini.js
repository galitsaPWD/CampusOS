import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  try {
    console.log("Testing Gemini API Key...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent("Say hello");
    console.log("Response:", result.response.text());
  } catch (error) {
    console.error("Error:", error.message);
    if (error.status) console.error("Status:", error.status);
    
    try {
        console.log("Attempting to list models...");
        // Note: listModels is on the genAI instance or requires a different approach
        // Actually the SDK might not have listModels easily exposed like this
    } catch (e) {}
  }
}

test();
