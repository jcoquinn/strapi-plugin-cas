export default {
	default: ({ env }) => ({
		url: env('CAS_URL', 'https://example.com/cas'),
	}),
	validator: (config: { url: string; service: string }) => {
		if (config.url.trim() === '') {
			throw new Error('CAS_URL environment variable is required');
		}
	},
};
