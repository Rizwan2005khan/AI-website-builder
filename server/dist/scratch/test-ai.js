import * as dotenv from 'dotenv';
dotenv.config();
import { OpenAI } from 'openai';
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.AI_API_KEY
});
async function testAI() {
    console.log('API Key length:', process.env.AI_API_KEY?.length);
    try {
        const response = await openai.chat.completions.create({
            model: 'mistralai/mistral-7b-instruct:free',
            messages: [{ role: 'user', content: 'Say hello' }]
        });
        console.log('Success:', response.choices[0].message.content);
    }
    catch (error) {
        console.error('AI Error:', error.status, error.message, error.response?.data);
    }
}
testAI();
