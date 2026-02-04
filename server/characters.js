import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getCharacterPrompt(name) {
    const fileName = name === 'jamie' ? 'JAMIE_BEAVER_V2.md' : 'THOMAS_GOOSE_V2.md';
    const filePath = path.join(__dirname, '..', 'characters', fileName);
    return fs.readFileSync(filePath, 'utf8');
}

export const COLLABORATIVE_SYSTEM_PROMPT = fs.readFileSync(path.join(__dirname, '..', 'characters', 'COLLABORATIVE_SYSTEM_PROMPT.md'), 'utf8');
export const JAMIE_PROMPT = getCharacterPrompt('jamie');
export const THOMAS_PROMPT = getCharacterPrompt('thomas');

export const INITIAL_POSITIONS = {
    jamie: {
        opinion: "The drought affected crops like wheat, canola, and barley. People at the ranch faced barren pastures and sold off cattle, and turned to irrigation but due to scarce water supplies it became too expensive.",
        status: "RED"
    },
    thomas: {
        opinion: "The drought affected forests by making trees dry and unhealthy, which caused problems for animals living there. It impacted non-farming communities because some people had to change their routines and deal with environmental challenges. Overall, the drought made life harder outside of farming areas as nature was damaged.",
        status: "RED"
    }
};
