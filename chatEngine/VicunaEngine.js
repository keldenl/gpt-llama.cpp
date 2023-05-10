import { ChatEngine } from './index.js';

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

	isModel(path) {
		return path.contains('vicuna');
	}
}
