# Strapi CAS Plugin

A plugin for Strapi v5 that provides a CAS client for authentication.

## Install

1. `cd` into root directory of the Strapi application

1. `git clone` this repo into `src/plugins/cas`

1. `cd` into `src/plugins/cas`

1. Run `npm ci`

1. Run `npm run build`

## Enable

Within the Strapi application's `config/plugins.ts`, add a `cas` entry.

```ts
export default ({ env }) => ({
  cas: {
    enabled: true,
    resolve: './src/plugins/cas',
  },
});
```

## Configure

Add the following environment variables with appropriate values to the `.env` file of the Strapi application.

`CAS_URL`

The URL of the CAS server application. CAS [URI paths](https://apereo.github.io/cas/7.2.x/protocol/CAS-Protocol-V2-Specification.html) will be appended to this URL.

Example: `https://example.com/cas`.

`CAS_STRAPI_URL`

The URL of the Strapi application. It's used as a URL prefix in the service parameter value for CAS login and validation requests.

Example: `http://localhost:1337`

`CAS_RETURN_URL`

The URL of the client application to redirect to after authentication which will receive the `access_token` as a query parameter.

Example: `http://localhost:3000/auth/cas`
