import { ChatEngine } from './index.js';
import { AlpacaEngine } from './AlpacaEngine.js';
import { Vicuna1_1Engine } from './Vicuna1_1Engine.js';
import { VicunaEngine } from './VicunaEngine.js';
import { RedPajamaEngine } from './RedPajama.js';

export function initializeChatEngine(modelPath) {
	const engineMap = {
		default: ChatEngine,
		// redpajama: RedPajamaEngine,
		'vicuna1.1': Vicuna1_1Engine,
		vicuna: VicunaEngine,
		alpaca: AlpacaEngine,
    redpajama: RedPajamaEngine,
		default: ChatEngine,
	};

  console.log('MODEL PATH: ', modelPath)

	for (const keyword of Object.keys(engineMap)) {
		if (modelPath.toLowerCase().includes(keyword.toLowerCase())) {
      console.log(`> ${keyword.toUpperCase()} MODEL DETECTED. LOADING ${keyword.toUpperCase()}ENGINE...`)
			return new engineMap[keyword.toLowerCase()]();
		}
	}
  console.log(`> AUTO MODEL DETECTION FAILED. LOADING DEFAULT CHATENGINE...`)
	return new engineMap['default']();
}
