
import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const key = process.env.VITE_GEMINI_API_KEY;

async function listModels() {
    if (!key) {
        console.error("VITE_GEMINI_API_KEY NOT FOUND");
        return;
    }

    try {
        const genAI = new GoogleGenAI({ apiKey: key });
        // The GoogleGenAI package usually provides access to generative models.
        // To list models, we might need to use the REST API or a specific method.
        // Let's try the models property.
        console.log("Checking available models for Gemini API...");
        
        // Note: The @google/genai SDK might not have a direct listModels method in all versions.
        // We can try a standard fetch to the models list endpoint.
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
        const data = await response.json();
        
        if (data.models) {
            console.log("AVAILABLE MODELS:");
            data.models.forEach((m: any) => {
                console.log(`- ${m.name} (${m.supportedGenerationMethods.join(', ')})`);
            });
        } else {
            console.log("No models returned or error:", data);
        }
    } catch (error) {
        console.error("Failed to list models:", error);
    }
}

listModels();
