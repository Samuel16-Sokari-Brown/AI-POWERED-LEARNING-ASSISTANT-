import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

console.log('Testing with @google/genai SDK...');

async function test() {
    try {
        const response = await client.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: 'hi'
        });
        console.log('SUCCESS!');
        console.log('Response:', response.text);
    } catch (e) {
        console.error('FAILED!');
        console.error('Error:', e.message);
    }
}

test();
