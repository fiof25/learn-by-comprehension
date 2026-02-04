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

// Video Transcript Context
const TRANSCRIPT = fs.readFileSync(path.join(__dirname, '..', 'content', 'CHESS_HISTORY.md'), 'utf8');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
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
        const prompt = `You are an automated learning assistant providing professional feedback on a student's reflection.
        
        SOURCE CONTENT (from the video):
        "${TRANSCRIPT}"
        
        DISCUSSION QUESTION: 
        "What was the single most significant rule change in 15th-century Europe that created modern chess, and why was this change made?"
        
        STUDENT'S CURRENT ANSWER: 
        "${answer}"
        
        YOUR TASK:
        1. Analyze the answer against the video content for accuracy and completeness. 
        2. CORE CONCEPTS TO CHECK:
           - Concept A: The "advisor" piece was transformed into the "queen".
           - Concept B: The change was inspired by the rise of "powerful female leaders" (like Isabella of Castile).
        3. JUDGMENT CRITERIA:
           - If the student mentions BOTH the piece transformation (advisor -> queen) and the historical reason (female leaders), mark as isCorrect: true.
           - BE LENIENT with grammar or if they accidentally flip the direction (e.g., saying "queen turned into advisor") as long as they identified the two key entities and the reason.
           - If they mention the piece but not the reason (or vice versa), mark as isCorrect: false and provide a hint.
        4. Generate professional, hint-based feedback.
        
        Respond with ONLY a JSON object: 
        {
            "isCorrect": true/false, 
            "feedbackTitle": "A professional heading",
            "feedbackDesc": "A professional, concise evaluation. If incorrect, provide a hint without giving the full answer away unless they are very close."
        }`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        
        const cleanedJson = responseText.replace(/```json|```/g, '').trim();
        const feedback = JSON.parse(cleanedJson);

        res.json(feedback);
    } catch (error) {
        console.error('Error checking answer with Gemini:', error);
        // Fallback: if it contains keywords from the transcript, count as correct
        const keywords = ['gupta', 'chaturanga', 'persia', 'shah', 'social class', 'queen', 'advisor', 'female', 'leader'];
        const isCorrect = keywords.some(k => answer.toLowerCase().includes(k));
        res.json({ 
            isCorrect: isCorrect, 
            feedbackTitle: isCorrect ? "Analysis Complete" : "Incomplete Reflection",
            feedbackDesc: isCorrect ? "The reflection identifies key components from the lecture. Further detail could be added regarding the 15th-century transformation." : "The current response does not fully address the piece transformation and its historical context as described in the video. Please review the lecture for specific details on the advisor's role and the political surge at the time."
        }); 
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
