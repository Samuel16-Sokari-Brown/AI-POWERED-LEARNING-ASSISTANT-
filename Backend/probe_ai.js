import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import dns from 'dns';
dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const testModel = async (modelName) => {
    try {
        console.log(`Testing model: ${modelName}...`);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say hello");
        console.log(`Success with ${modelName}:`, result.response.text());
        return true;
    } catch (error) {
        console.error(`Failed with ${modelName}:`, error.message, error.status);
        return false;
    }
};

const runTests = async () => {
    await testModel("gemini-flash-latest");
    await testModel("gemini-3-flash-preview");
};

runTests();
