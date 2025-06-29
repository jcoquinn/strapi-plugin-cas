import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
	async login(ctx: Context) {
		const cas = strapi.plugin('cas');
		const url = cas.config('url');
		const service = encodeURIComponent(cas.config('serviceUrl'));
		ctx.redirect(`${url}/login?service=${service}`);
	},
	async callback(ctx: Context) {
		const { ticket } = ctx.query as { ticket?: string };
		if (!ticket) {
			ctx.status = 400;
			ctx.body = { error: 'CAS: missing ticket query param' };
			return;
		}
		const cas = strapi.plugin('cas');
		const service = cas.config('serviceUrl');
		const attrs = await cas.service('ticket').validate(ticket, service);

		const up = strapi.plugin('users-permissions');
		let user = await strapi.db
			.query('plugin::users-permissions.user')
			.findOne({ where: { username: attrs.username } });
		if (user) {
			const jwt = await up.service('jwt').issue({ id: user.id });
			return ctx.redirect(
				`${cas.config('returnUrl')}?accessToken=${encodeURIComponent(jwt)}`,
			);
		}
		const settings: { default_role?: number } = await strapi
			.store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
			.get();
		const role = await strapi.db
			.query('plugin::users-permissions.role')
			.findOne({ where: { type: settings.default_role } });
		user = await up.service('user').add({
			...attrs,
			role: role.id,
			confirmed: true,
		});
		const jwt = await up.service('jwt').issue({ id: user.id });
		return ctx.redirect(`${cas.config('returnUrl')}?accessToken=${encodeURIComponent(jwt)}`);
	},
});

export default controller;
