import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const test = async () => {
    try {
        console.log('Fetching available models for key:', process.env.GEMINI_API_KEY.substring(0, 10));
        
        // This is the correct way to list models in the newer SDK versions, 
        // but it might need a specific call.
        // Let's try to probe with a simple model that should be there.
        const modelNames = ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.0-pro'];
        
        for (const modelName of modelNames) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('hi');
                console.log(`Model ${modelName}: SUCCESS!`);
                return; // Stop if we find one working
            } catch (err) {
                console.log(`Model ${modelName}: FAILED - ${err.message}`);
            }
        }
    } catch (error) {
        console.error('Error during probe:', error);
    }
};

test();
