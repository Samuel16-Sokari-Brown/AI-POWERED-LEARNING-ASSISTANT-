import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

console.log('Testing generateContent...');
model.generateContent('Hello')
    .then(r => console.log('success:', r.response.text()))
    .catch(e => console.error('error:', e));
