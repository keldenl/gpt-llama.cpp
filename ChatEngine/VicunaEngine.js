import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * Vicuna (original), Stable-Vicuna
 */
export class VicunaEngine extends ChatEngine {
	constructor() {
		super({
			chatPrefix: '###',
			roleMap: { assistant: 'Assistant', user: 'Human', system: 'System' },
			// instructionsPrefix: '### Instructions',
			// historyPrefix: '### Inputs',
			// responsePrefix: '### Response',
		});
		this.stopPrompts = [...this.stopPrompts, '##', '\n##', '###', '\n\n'];
	}
}
