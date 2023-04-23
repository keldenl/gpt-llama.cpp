export const defaultMsgs = [
	{ role: 'system', content: 'You are a helpful assistant.' },
	{ role: 'user', content: 'How are you?' },
	{ role: 'assistant', content: 'Hi, how may I help you today?' },
];

const defaultParams = {
	'--temp': '0.7',
	'--n_predict': '512',
	'--top_p': '0.1',
	'--top_k': '40',
	'-b': '512',
	'-c': '2048',
	'--repeat_penalty': '1.1764705882352942',
};

const openAiToLlamaMapping = {
	temperature: '--temp',
	stop: '--reverse-prompt', // string or string array
	max_tokens: '--n_predict',
	top_p: '--top_p',
};

export const getArgs = (args) => {
	const convertedArgs = {};
	Object.keys(args).forEach((a) => {
		if (!!openAiToLlamaMapping[a]) {
			convertedArgs[openAiToLlamaMapping[a]] = args[a];
		}
	});
	const params = { ...defaultParams, ...convertedArgs };
	return Object.keys(params).flatMap((pKey) => !!params[pKey] ? [pKey, params[pKey]] : []);
};

export const gptModelNames = {
	3.5: 'gpt-3.5-turbo',
	4: 'gpt-4',
};

// export const defaultArgs = [
//   "--temp",
//   "0.7",
//   "-b",
//   "512",
//   "-n",
//   "512",
//   "--top_k",
//   "40",
//   "--top_p",
//   "0.1",
//   "--repeat_penalty",
//   "1.1764705882352942",
// ];
