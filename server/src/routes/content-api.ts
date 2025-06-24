export const routes = {
  login: {
    method: 'GET',
    path: '/login',
    handler: 'controller.login',
    auth: false,
    config: {
      auth: false,
    },
  },
  callback: {
    method: 'GET',
    path: '/callback',
    handler: 'controller.callback',
    config: {
      auth: false,
    },
  },
};

export default [routes.login, routes.callback];
