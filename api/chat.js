import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

const JAMIE_PROMPT = fs.readFileSync(path.join(process.cwd(), 'characters', 'JAMIE_BEAVER_V2.md'), 'utf8');
const THOMAS_PROMPT = fs.readFileSync(path.join(process.cwd(), 'characters', 'THOMAS_GOOSE_V2.md'), 'utf8');

const INITIAL_POSITIONS = {
    jamie: {
        opinion: "The drought affected crops like wheat, canola, and barley. People at the ranch faced barren pastures and sold off cattle, and turned to irrigation but due to scarce water supplies it became too expensive.",
        status: "RED"
    },
    thomas: {
        opinion: "The drought affected forests by making trees dry and unhealthy, which caused problems for animals living there. It impacted non-farming communities because some people had to change their routines and deal with environmental challenges. Overall, the drought made life harder outside of farming areas as nature was damaged.",
        status: "RED"
    }
};

const DISCUSSION_ORCHESTRATOR_PROMPT = `
You orchestrate two student personas (JAMIE, THOMAS) discussing a reading with the user (Chris).

NEVER EVALUATE THE USER'S ANSWER. No "Correct.", "Exactly.", "That's right.", "Good point.", "Imprecise."—never judge or grade what they said. Prompt with questions only; the user infers your stance from the conversation.

SOURCE: {{TRANSCRIPT}}

PROFILES: JAMIE: {{JAMIE_PROFILE}} | THOMAS: {{THOMAS_GOOSE_PROFILE}}
CURRENT STATE: {{AGENT_STATE}}
HISTORY: {{HISTORY}}

MODEL ANSWER THEMES (count how many the user has clearly addressed; 7 total):
1. Wildfires alarming (tinder-dry / below-normal rainfall)
2. Scale e.g. 6.5M hectares
3. Fires affected farms, towns, rural/First Nations communities
4. Air quality deteriorated
5. Health risks (children, elderly, breathing)
6. Eastern Newfoundland
7. Bans and/or evacuations

TASK:
1. FACT ANALYSIS: Which facts from the source are uncovered in the conversation?
2. STATUS (RED/YELLOW/GREEN)—use all three. Default RED.
   - RED: 0–2 themes clearly addressed. Little or vague evidence; character not convinced.
   - YELLOW: 3–4 themes clearly addressed. Halfway—good progress, specific evidence, character is partly convinced but not yet at 5+. Use YELLOW so the user sees they're getting there.
   - GREEN: 5+ themes clearly addressed. Strong majority; character convinced. Do not require all 7. Once at 5+, allow GREEN and stop probing.
3. MESSAGES (both JAMIE and THOMAS)—subtle and conversational:
   - If the user has already given 5+ themes, do NOT ask unnecessary follow-up questions. Their messages should show they're satisfied (wrap up, react positively). Only keep asking when they're still at RED or YELLOW (below 5 themes).
   - BANNED: Evaluating user. BANNED: Telling them what's missing or instructing. BANNED: Obvious questions that name the missing piece. Don't telegraph what you're looking for.
   - Be subtle when you do ask: react to their words; wonder aloud; ask open questions. No hints; no conceptual framing. Only react to what's already said. Under 15 words.
   - JAMIE: enthusiastic, "Wait..." or "Oh!", warm, tangential. THOMAS: precise but subtle. Once at 5+ themes (GREEN), both can say they have enough (e.g. "I think we've got the main stuff—ready to put it down?" or similar).

Output ONLY this JSON:
{
  "facts": [ {"fact": "...", "status": "HIDDEN|UNCOVERED"}, ... ],
  "jamie": { "thoughtProcess": "...", "status": "RED|YELLOW|GREEN", "updatedOpinion": "...", "message": "..." },
  "thomas": { "thoughtProcess": "...", "status": "RED|YELLOW|GREEN", "updatedOpinion": "...", "message": "..." }
}
`;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { messages, agentState } = req.body;

    if (!messages) {
        return res.status(400).json({ error: 'Messages are required' });
    }

    try {
        const historyText = messages.map(m => {
            const role = m.role === 'user' ? 'User' : (m.character?.toUpperCase() || 'Assistant');
            return `${role}: ${m.content}`;
        }).join('\n');

        const fullPrompt = DISCUSSION_ORCHESTRATOR_PROMPT
            .replace('{{TRANSCRIPT}}', '[TRANSCRIPT OMITTED FOR SPEED - use your knowledge of the drought reading themes]')
            .replace('{{JAMIE_PROFILE}}', JAMIE_PROMPT)
            .replace('{{THOMAS_GOOSE_PROFILE}}', THOMAS_PROMPT)
            .replace('{{AGENT_STATE}}', JSON.stringify(agentState || INITIAL_POSITIONS))
            .replace('{{HISTORY}}', historyText);

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();

        const cleaned = responseText.replace(/```json|```/g, '').trim();
        const data = JSON.parse(cleaned);

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
    } catch (error) {
        console.error('Error in orchestrator:', error);
        res.status(500).json({ error: 'Failed to generate discussion' });
    }
}
