import type { Core } from '@strapi/strapi';
import type { Context } from 'koa';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async login(ctx: Context) {
    const url = strapi.plugin('cas').config('url');
    const service = `${strapi.config.get('server.url')}/api/cas/callback`;
    ctx.redirect(`${url}/login?service=${encodeURIComponent(service)}`);
  },
  async callback(ctx: Context) {
    const { ticket } = ctx.query as { ticket?: string };
    if (!ticket) {
      ctx.status = 400;
      ctx.body = { error: 'CAS: missing ticket query param' };
      return;
    }
    const service = `${strapi.config.get('server.url')}/api/cas/callback`;
    const attrs = await strapi.plugin('cas').service('ticket').validate(ticket, service);

    const up = strapi.plugin('users-permissions');
    let user = await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { username: attrs.username } });
    if (user) {
      user = await up.service('user').edit(user.id, { email: attrs.email });
      ctx.body = {
        jwt: await up.service('jwt').issue({ id: user.id }),
        user: await strapi.contentAPI.sanitize.output(
          user,
          strapi.getModel('plugin::users-permissions.user'),
          { auth: ctx.state.auth },
        ),
      };
      return;
    }
    const settings: { default_role?: number } = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();
    const role = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: settings.default_role } });
    user = await up.service('user').add({
      username: attrs.username,
      email: attrs.email,
      role: role.id,
      confirmed: true,
    });
    ctx.body = {
      jwt: await up.service('jwt').issue({ id: user.id }),
      user: await strapi.contentAPI.sanitize.output(
        user,
        strapi.getModel('plugin::users-permissions.user'),
        { auth: ctx.state.auth },
      ),
    };
  },
});

export default controller;
