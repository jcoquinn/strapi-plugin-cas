export default [
	{
		method: 'GET',
		path: '/login',
		handler: 'controller.login',
		auth: false,
		config: {
			auth: false,
		},
	},
	{
		method: 'GET',
		path: '/callback',
		handler: 'controller.callback',
		config: {
			auth: false,
		},
	},
];
