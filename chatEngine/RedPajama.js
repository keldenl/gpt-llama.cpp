import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * RedPajama-INCITE-v1
 */
export class RedPajamaEngine extends ChatEngine {
	constructor() {
		super({
			roleMap: { assistant: '<bot>', user: '<human>', system: '<system>' },
			stopPrompts: ['human>:', '\n\n\n', '<human', '\n<'],
		});
	}
}
