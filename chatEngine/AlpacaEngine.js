import { ChatEngine } from './index.js';

/**
 * This works for the following models (but is not limited to):
 * Alpaca
 */
export class AlpacaEngine extends ChatEngine {
	constructor() {
		super({
			historyPrefix: '### Inputs',
			responsePrefix: '### Response',
			hasAiResponsePrefix: false
		});
		this.instructions = `Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.
		
### Instruction
Complete the following chat conversation between the ${this.roleMap.user} and the ${this.roleMap.assistant}. ${this.roleMap.system} messages should be strictly followed as additional instructions.`;
		this.stopPrompts = [...this.stopPrompts, '##', '\n##', '###'];
	}

	getInteractionPrompt(lastMessages) {
		return `### Inputs\\\n${this.messagesToString(
			lastMessages,
			this.newLine
		)}\\\n\\\n### Response\\\nassistant:\n`;
	}
}
