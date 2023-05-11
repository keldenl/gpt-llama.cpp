import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * Dante1.3, Dante1.3B3, Dante2.8B
 */
export class DanteEngine extends ChatEngine {
	constructor() {
		super({
			// instructionsPrefix: '### Instruction:',
			instructions: `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.
### Instruction:
Act like a AI language model, you are designed to assist the human by answering their questions in a helpful and informative manner. You respond clearly and consider the conversation history.`,
			historyPrefix: '### Input:',
			responsePrefix: '### Response:',
			roleMap: {assistant: '[AI]', user: '[HM]'},
			hasAiResponsePrefix: false
		});
		// 0.6 temp, top_p 0.9
		// need to change stopprompt '<' once the stop prompt-ing is improved. this will stop when any instance of < is found
		this.stopPrompts = [...this.stopPrompts, '##', '\n##', '###', '[HM]', '\n[HM]', '\n[HM', '<end>', '<', '\n<', '.<']; 
	}

	getInteractionPrompt(lastMessages) {
		return `### Input:\\\n${this.messagesToString(
			lastMessages,
			this.newLine
		)}\\\n\\\n### Response:\\\n[AI]:\n`;
	}
}