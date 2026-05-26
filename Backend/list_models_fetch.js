import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
    console.log('Fetching models with key:', apiKey.substring(0, 7) + '...');
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
            console.log('Available models:');
            data.models.forEach(m => console.log(`- ${m.name}`));
        } else {
            console.log('Error Listing Models:');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error('Fetch error:', e);
    }
}

listModels();
