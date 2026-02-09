import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve characters dir relative to this file (works both locally and on Vercel)
const charactersDir = path.join(__dirname, '..', 'characters');

export const JAMIE_PROMPT = fs.readFileSync(path.join(charactersDir, 'JAMIE_BEAVER_V2.md'), 'utf8');
export const THOMAS_PROMPT = fs.readFileSync(path.join(charactersDir, 'THOMAS_GOOSE_V2.md'), 'utf8');
export const COLLABORATIVE_SYSTEM_PROMPT = fs.readFileSync(path.join(charactersDir, 'COLLABORATIVE_SYSTEM_PROMPT.md'), 'utf8');

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
