export interface Config {
	url: string;
	serviceUrl: string;
	returnUrl: string;
}

export default {
	default: ({ env }) => ({
		// CAS application URL.
		// E.g. https://example.com/cas
		url: env('CAS_URL'),
		// Strapi backend URL to use as the service param in CAS login and validation requests.
		// E.g. http://localhost:1337/api/cas/callback
		serviceUrl: `${env('CAS_STRAPI_URL')}/api/cas/callback`,
		// Client URL to redirect to after authentication. Used to pass access token.
		// E.g. http://localhost:3000/login
		returnUrl: env('CAS_RETURN_URL'),
	}),
	validator: (config: Config) => {
		for (const [k, v] of Object.entries(config)) {
			if (!v) {
				throw new Error(`${k} is required`);
			}
			config[k] = v.trim();
			if (/url$/i.test(k)) {
				config[k].replace(/\/+$/, ''); // remove trailing slash
				if (!/^https?:\/\//.test(v)) {
					throw new Error(`${k} invalid URL: ${v}`);
				}
			}
		}
	},
};
