import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { JAMIE_PROMPT, THOMAS_PROMPT, COLLABORATIVE_SYSTEM_PROMPT, INITIAL_POSITIONS } from './characters.js';
import { DISCUSSION_ORCHESTRATOR_PROMPT } from './agents/discussionOrchestrator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Reading content (source of truth for evaluation)
const TRANSCRIPT = fs.readFileSync(path.join(__dirname, '..', 'content', 'DROUGHT_READING.md'), 'utf8');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-3-flash-preview", 
});

app.post('/api/chat', async (req, res) => {
    const { messages, agentState } = req.body;
    console.log(`Chat request received. History length: ${messages?.length}`);

    if (!messages) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        const historyText = messages.map(m => {
            const role = m.role === 'user' ? 'User' : (m.character?.toUpperCase() || 'Assistant');
            return `${role}: ${m.content}`;
        }).join('\n');

        const fullPrompt = DISCUSSION_ORCHESTRATOR_PROMPT
            .replace('{{TRANSCRIPT}}', TRANSCRIPT)
            .replace('{{JAMIE_PROFILE}}', JAMIE_PROMPT)
            .replace('{{THOMAS_GOOSE_PROFILE}}', THOMAS_PROMPT)
            .replace('{{AGENT_STATE}}', JSON.stringify(agentState || INITIAL_POSITIONS))
            .replace('{{HISTORY}}', historyText);

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();
        
        try {
            const cleaned = responseText.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleaned);
            
            console.log("Orchestrator Thought (Jamie):", data.jamie?.thoughtProcess);
            console.log("Orchestrator Thought (Thomas):", data.thomas?.thoughtProcess);

            res.json({
                responses: [
                    { character: 'jamie', message: data.jamie.message },
                    { character: 'thomas', message: data.thomas.message }
                ],
                updatedState: {
                    jamie: {
                        opinion: data.jamie.updatedOpinion,
                        status: data.jamie.status,
                        thought: data.jamie.thoughtProcess
                    },
                    thomas: {
                        opinion: data.thomas.updatedOpinion,
                        status: data.thomas.status,
                        thought: data.thomas.thoughtProcess
                    }
                },
                facts: data.facts
            });
        } catch (parseError) {
            console.error('JSON Parse Error:', responseText);
            throw new Error('Failed to parse AI response');
        }
    } catch (error) {
        console.error('Error in orchestrator:', error);
        res.status(500).json({ error: 'Failed to generate discussion' });
    }
});

app.post('/api/check-answer', async (req, res) => {
    const { answer } = req.body;

    if (!answer) {
        return res.status(400).json({ error: 'Answer is required' });
    }

    try {
        const prompt = `Feedback on a student reflection. Source: "${TRANSCRIPT}"
Question: "How did the drought affect forests and non-farming communities across Canada?"
Model themes: wildfires (tinder-dry, scale), impact on towns/rural/First Nations; air quality + health risks; Eastern Newfoundland, bans/evacuations.
Student answer: "${answer}"
If they address 5+ of these themes (forests e.g. wildfires, scale, impact on communities, air quality, health, Newfoundland, evacuations/bans), isCorrect: true. Below 5 themes = isCorrect: false. Be lenient on wording but count themes clearly present.
Respond ONLY with valid JSON: {"isCorrect": true or false, "feedbackTitle": "string", "feedbackDesc": "string (if wrong give hint not answer)"}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const feedback = JSON.parse(cleanedJson);

        res.json(feedback);
    } catch (error) {
        console.error('Error checking answer with Gemini:', error);
        // Fallback: if it contains keywords from the transcript, count as correct
        const keywords = ['wildfire', 'forest', 'air quality', 'evacuat', 'health', '6.5 million', 'newfoundland', 'non-farming', 'communities'];
        const isCorrect = keywords.some(k => answer.toLowerCase().includes(k));
        res.json({ 
            isCorrect: isCorrect, 
            feedbackTitle: isCorrect ? "Analysis Complete" : "Incomplete Reflection",
            feedbackDesc: isCorrect ? "The reflection identifies key effects from the reading on forests and non-farming communities." : "The current response does not fully address how the drought affected forests and non-farming communities as described in the reading. Review the passage for evidence on wildfires, air quality, health risks, and impacts on communities (e.g. evacuations)."
        }); 
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
