import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * RedPajama-INCITE-v1
 */
export class RedPajamaEngine extends ChatEngine {
	constructor() {
		super({
			instructions: ' ',
			roleMap: { assistant: '<bot>', user: '<human>', system: '<system>' },
			stopPrompts: ['human>:', '\n\n\n', '<human', '\n<'],
			// Need few-shot prompting or else it goes off the rails and generates chinese in 3B
			defaultMsgs:[
				{ role: 'user', content: 'Hello' },
				{ role: 'assistant', content: 'Hi there!' },
				{ role: 'user', content: 'Who are are you?' },
				{ role: 'assistant', content: 'I am an assistant created by TogetherComputer called RedPajama!' },
				{ role: 'user', content: 'How are you?' },
				{ role: 'assistant', content: 'Good! how may I help you today?' },
			],
		});
	}
}
