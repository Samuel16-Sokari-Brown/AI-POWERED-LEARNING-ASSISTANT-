import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

dotenv.config();

const testGemini = async () => {
    try {
        console.log("Starting test with gemini-2.5-flash and ipv4first...");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Say 'hello world'");
        console.log("Result:", result.response.text());
    } catch (error) {
        console.error("Test failed:", error);
    }
};

testGemini();
