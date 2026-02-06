import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { answer } = req.body;

    if (!answer) {
        return res.status(400).json({ error: 'Answer is required' });
    }

    try {
        const prompt = `Feedback on a student reflection. Source: "[TRANSCRIPT OMITTED FOR SPEED]"
Question: "How did the drought affect forests and non-farming communities across Canada?"
Model themes: wildfires (tinder-dry, scale), impact on towns/rural/First Nations; air quality + health risks; Eastern Newfoundland, bans/evacuations.
Important: The correct figure for hectares burned is 6.5 million (not 6.8 million). When evaluating "scale", accept answers that mention the scale of wildfires; if the student gives a number, 6.5 million hectares is correct—if they say 6.8 million or another wrong number, still count scale as present but in feedbackDesc you may gently correct to 6.5 million.
Student answer: "${answer}"
If they address 5+ of these themes (forests e.g. wildfires, scale, impact on communities, air quality, health, Newfoundland, evacuations/bans), isCorrect: true. Below 5 themes = isCorrect: false. Be lenient on wording but count themes clearly present.
Respond ONLY with valid JSON: {"isCorrect": true or false, "feedbackTitle": "string", "feedbackDesc": "string (if wrong give hint not answer; if they used wrong hectare number, correct to 6.5 million)"}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const feedback = JSON.parse(cleanedJson);

        res.json(feedback);
    } catch (error) {
        console.error('Error checking answer with Gemini:', error);
        const keywords = ['wildfire', 'forest', 'air quality', 'evacuat', 'health', '6.5 million', 'newfoundland', 'non-farming', 'communities'];
        const isCorrect = keywords.some(k => answer.toLowerCase().includes(k));
        res.json({
            isCorrect: isCorrect,
            feedbackTitle: isCorrect ? "Analysis Complete" : "Incomplete Reflection",
            feedbackDesc: isCorrect ? "The reflection identifies key effects from the reading on forests and non-farming communities." : "The current response does not fully address how the drought affected forests and non-farming communities as described in the reading. Review the passage for evidence on wildfires, air quality, health risks, and impacts on communities (e.g. evacuations)."
        });
    }
}
