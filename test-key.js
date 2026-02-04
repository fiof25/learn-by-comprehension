import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function test() {
    try {
        console.log("Testing API key...");
        const result = await model.generateContent("Say hello");
        console.log("Success:", result.response.text());
    } catch (error) {
        console.error("API Key Test Failed:", error.message);
    }
}

test();
