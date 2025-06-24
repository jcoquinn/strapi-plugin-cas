export default {
	default: ({ env }) => ({
		// CAS application URL. E.g. https://example.com/cas
		url: env('CAS_URL'),
		// Strapi backend URL to use as the service param in CAS login and validation requests.
		// E.g. http[s]://<host>[:port]/api/cas/callback
		serviceUrl: env('CAS_SERVICE_URL'),
	}),
	validator: (config: { url: string; serviceUrl: string }) => {
		const env = {
			CAS_URL: 'url',
			CAS_SERVICE_URL: 'serviceUrl',
		};
		Object.keys(env).forEach((k) => {
			const key = env[k];
			if (!config[key]) {
				throw new Error(`${k} is required`);
			}
			config[key] = config[key].trim().replace(/\/+$/, '');
			if (config[key] === '') {
				throw new Error(`${k} invalid value: ${config[key]}`);
			}
		});
	},
};
