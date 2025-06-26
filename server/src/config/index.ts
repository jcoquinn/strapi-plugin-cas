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
			url: 'CAS_URL',
			serviceUrl: 'CAS_SERVICE_URL',
		};
		for (const [k, v] of Object.keys(config).entries()) {
			if (!v) {
				throw new Error(`${env[k]} is required`);
			}
			config[k] = v.trim().replace(/\/+$/, '');
			if (config[k] === '') {
				throw new Error(`${env[k]} invalid value: ${config[k]}`);
			}
		}
	},
};
