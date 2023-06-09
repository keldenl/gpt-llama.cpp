export const defaultMsgs = [
	{ role: 'system', content: 'You are a helpful assistant.' },
	{ role: 'user', content: 'How are you?' },
	{ role: 'assistant', content: 'Hi, how may I help you today?' },
];

const defaultParams = {
	'--temp': '0.7',
	'--n_predict': '1000',
	'--top_p': '0.1',
	'--top_k': '40',
	'-c': '2048',
	'--seed': '-1',
	'--repeat_penalty': '1.1764705882352942',
};

const defaultGgmlParams = {
	'--temp': '0.8',
	'--n_predict': '1000',
	'--top_p': '0.1',
	'--top_k': '40',
	// '--temp': '0.85',
	// '--n_predict': '1000',
	// '--top_p': '0.1',
	// '--top_k': '40',
};

const openAiToLlamaMapping = {
	temperature: '--temp',
	stop: '--reverse-prompt', // string or string array
	max_tokens: '--n_predict',
	top_p: '--top_p',
};

const openAiToGgmlMapping = {
	temperature: '--temp',
	max_tokens: '--n_predict',
	top_p: '--top_p',
};

const userArgByName = {
	threads: {
		type: 'number',
		description: 'number of threads to use during computation',
	},
	ctx_size: { type: 'number', description: 'size of the prompt context' },
	repeat_penalty: {
		type: 'number',
		description: 'penalize repeat sequence of tokens',
	},
	mlock: {
		type: 'undefined',
		description:
			'force system to keep model in RAM rather than swapping or compressing',
	},
	help: { type: 'undefined', description: 'show this help message and exit' },
	lora: {
		type: 'string',
		description: 'apply LoRA adapter (implies --no-mmap)',
	},
	'lora-base': {
		type: 'string',
		description:
			'optional model to use as a base for the layers modified by the LoRA adapter',
	},
	mirostat: {
		type: 'number',
		description:
			'use Mirostat sampling (default: 0, 0=disabled, 1=Mirostat, 2=Mirostat 2.0)',
	},
	"n-gpu-layers": {
		type: 'number',
		description: 'number of layers to store in VRAM (1 for Mac GPU)'
	}
};

const shortUserArgByName = {
	t: userArgByName['threads'],
	h: userArgByName['help'],
	ngl: userArgByName['n-gpu-layers'],
}

export const getHelpList = Object.keys(userArgByName)
	.map((name) => {
		const { type, description } = userArgByName[name];
		return `${name}${type !== 'undefined' ? ` (${type})` : ''}: ${description}`;
	})
	.join('\n');

export const validateAndReturnUserArgs = () => {
	const processArgs = process.argv.slice(2);
	const errors = [];

	const shortAndLongUserArgsByName = {...userArgByName, ...shortUserArgByName}

	processArgs.forEach((arg, i) => {
		// Check if the argument is supported
		if (Object.keys(shortAndLongUserArgsByName).includes(arg)) {
			const expectedType = shortAndLongUserArgsByName[arg].type;

			// Check if the argument doesn't require a value
			if (expectedType === 'undefined') {
				// Do additional checks if there is a next arg value
				if (i < processArgs.length - 1) {
					const argValue = processArgs[i + 1];
					// If next value != an arg, that means it's a value. This arg didn't need a value so add error
					if (!Object.keys(shortAndLongUserArgsByName).includes(argValue)) {
						errors.push(`${arg} does not require a value.`);
						return;
					}
				}
				return;
			}

			// Check if the next argument exists  (since value is required)
			if (i < processArgs.length - 1) {
				const argValue = processArgs[i + 1];
				// If next arg is an user arg, that means we're missing a value
				if (Object.keys(shortAndLongUserArgsByName).includes(argValue)) {
					errors.push(`${arg} is missing a value.`);
					return;
				}

				// Parse the argument value and get its type
				const parsedArgValue = isNaN(parseInt(argValue))
					? argValue
					: parseInt(argValue);
				const valueType = typeof parsedArgValue;

				// Check if the argument value type matches the expected type
				if (valueType !== expectedType) {
					errors.push(`${arg} expects a ${expectedType}, not ${valueType}`);
					return;
				}
			} else {
				errors.push(`${arg} is missing a value.`);
			}
		} else {
			// If this isn't a valid arg, it must be a value. That means prev arg must be a valid arg.
			if (i > 0) {
				const prevArg = processArgs[i - 1];
				if (!Object.keys(shortAndLongUserArgsByName).includes(prevArg)) {
					errors.push(`${arg} is not a valid argument.`);
				}
			} else {
				errors.push(`${arg} is not a valid argument.`);
			}
		}
	});

	// Check if there are any errors, print them if there are
	if (errors.length > 0) {
		console.log(`Args Error: ${errors.join(' ')}`);
		console.log('Please double check that your npm arguments are correct.');
		return { errors, userArgs: [] };
	}

	// Map the user arguments that works with llama.cpp
	return {
		userArgs: processArgs.map((arg) => {
			if (Object.keys(userArgByName).includes(arg)) {
				return `--${arg}`;
			} else if (Object.keys(shortUserArgByName).includes(arg)) {
				return `-${arg}`;
			}
			return `${arg}`;
		}),
		errors,
	};
};

export const getArgs = (args, inference = 'llama.cpp') => {
	const convertedArgs = {};
	const openAiMapping = inference === 'llama.cpp'
		? openAiToLlamaMapping
		: openAiToGgmlMapping;
	Object.keys(args).forEach((a) => {
		if (!!openAiMapping[a]) {
			if (a === 'max_tokens' && args[a] === null) {
				convertedArgs[openAiMapping[a]] = -1;
			} else if (!!args[a]) {
				convertedArgs[openAiMapping[a]] = args[a];
			}
		}
	});
	console.log(convertedArgs)

	const { userArgs } = inference === 'llama.cpp'
		? validateAndReturnUserArgs()
		: { userArgs: [] };

	const defaultInferenceParams =
		inference === 'llama.cpp' ? defaultParams : defaultGgmlParams;
	const params = { ...defaultInferenceParams, ...convertedArgs };
	return {
		args: [
			...Object.keys(params).flatMap((pKey) =>
				!!params[pKey] ? [pKey, params[pKey]] : []
			),
			...userArgs,
		],
		maxTokens: params['--n_predict'],
	};
};

export const gptModelNames = {
	3.5: 'gpt-3.5-turbo',
	4: 'gpt-4',
};