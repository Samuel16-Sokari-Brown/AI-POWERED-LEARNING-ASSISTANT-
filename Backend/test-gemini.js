import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
console.log('Testing generateFlashcards content/contents...');
ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: 'Hello'
}).then(r => console.log('success:', r.text)).catch(e => console.error('error:', e.message));
