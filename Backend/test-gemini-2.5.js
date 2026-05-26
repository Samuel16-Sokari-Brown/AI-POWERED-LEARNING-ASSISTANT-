import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

console.log('Testing generateContent with gemini-2.5-flash...');
model.generateContent('Hi, tell me a joke.')
    .then(r => {
        console.log('SUCCESS!');
        console.log('Response:', r.response.text());
    })
    .catch(e => {
        console.error('FAILED!');
        console.error('Error:', e.message);
    });
