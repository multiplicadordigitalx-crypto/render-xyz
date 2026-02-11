
import { GoogleGenAI } from "@google/genai";
import fs from "fs";

async function listModels() {
    const apiKey = "AIzaSyCYRlm0OmmZX6ZhG3HHezkbOz7F7rHDEZU";

    const genAI = new GoogleGenAI({ apiKey });
    try {
        const response = await genAI.models.list();
        console.log("AVAILABLE MODELS EXCERPT:");
        // The response might be paginated or an array
        const models = response.models || response;
        models.slice(0, 15).forEach(model => {
            console.log(`- ${model.name}`);
            console.log(`  Capabilities: ${model.supported_methods?.join(", ")}`);
            console.log('---');
        });
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
