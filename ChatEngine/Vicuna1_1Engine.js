import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * Vicuna v1.1, Wizard-Vicuna
 */
export class Vicuna1_1Engine extends ChatEngine {
	constructor() {
		super({
			roleMap: { assistant: 'ASSISTANT', user: 'USER', system: 'SYSTEM' },
		});
		this.stopPrompts = [...this.stopPrompts, '</s>', '\n</s>', '\n</s'];
	}
}
