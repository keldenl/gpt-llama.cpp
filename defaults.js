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
	// '-b': '2000',
	// '-c': '4096',
	'--seed': '-1',
	'--repeat_penalty': '1.1764705882352942',
};

const openAiToLlamaMapping = {
	temperature: '--temp',
	stop: '--reverse-prompt', // string or string array
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
		description: 'use Mirostat sampling (default: 0, 0=disabled, 1=Mirostat, 2=Mirostat 2.0)'
	}
};

export const getHelpList = Object.keys(userArgByName)
	.map((name) => {
		const { type, description } = userArgByName[name];
		return `${name}${type !== 'undefined' ? ` (${type})` : ''}: ${description}`;
	})
	.join('\n');

export const validateAndReturnUserArgs = () => {
	const processArgs = process.argv.slice(2);
	const errors = [];

	processArgs.forEach((arg, i) => {
		// Check if the argument is supported
		if (Object.keys(userArgByName).includes(arg)) {
			const expectedType = userArgByName[arg].type;

			// Check if the argument doesn't require a value
			if (expectedType === 'undefined') {
				// Do additional checks if there is a next arg value
				if (i < processArgs.length - 1) {
					const argValue = processArgs[i + 1];
					// If next value != an arg, that means it's a value. This arg didn't need a value so add error
					if (!Object.keys(userArgByName).includes(argValue)) {
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
				if (Object.keys(userArgByName).includes(argValue)) {
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
				if (!Object.keys(userArgByName).includes(prevArg)) {
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

	console.log(processArgs.map((arg) => {
		if (Object.keys(userArgByName).includes(arg)) {
			return `--${arg}`;
		}
		return `${arg}`;
	}))

	// Map the user arguments that works with llama.cpp
	return {
		userArgs: processArgs.map((arg) => {
			if (Object.keys(userArgByName).includes(arg)) {
				return `--${arg}`;
			}
			return `${arg}`;
		}),
		errors,
	};
};

export const getArgs = (args) => {
	const convertedArgs = {};
	Object.keys(args).forEach((a) => {
		if (!!openAiToLlamaMapping[a] && !!args[a]) {
			convertedArgs[openAiToLlamaMapping[a]] = args[a];
		}
	});
	const { userArgs } = validateAndReturnUserArgs();
	const params = { ...defaultParams, ...convertedArgs };
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
