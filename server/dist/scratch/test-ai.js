import OpenAI from 'openai';
import 'dotenv/config';
const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.AI_API_KEY
});
async function testAI() {
    try {
        const response = await openai.chat.completions.create({
            model: 'google/gemini-2.0-flash-exp:free',
            messages: [{ role: 'user', content: 'Say hello' }]
        });
        console.log('Success:', response.choices[0].message.content);
    }
    catch (error) {
        console.error('AI Error:', error.status, error.message, error.response?.data);
    }
}
testAI();
