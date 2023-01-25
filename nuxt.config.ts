import browserslistToEsbuild from 'browserslist-to-esbuild';

import breakpoints from './assets/constants/breakpoints';

const WEEK_IN_SECONDS = 60 * 60 * 24 * 7;
const MONTH_IN_SECONDS = 60 * 60 * 24 * 31;
const DEFAULT_CACHE = `private, immutable, max-age=${WEEK_IN_SECONDS}, stale-while-revalidate=${MONTH_IN_SECONDS}`;

const defaultHeaders = {
  'Cache-Control': DEFAULT_CACHE,
  'Access-Control-Allow-Origin': process.env.SITE_ORIGIN || '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS, PUT, POST, DELETE',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Content-Security-Policy': 'default-src \'self\'; connect-src https: \'self\'; script-src \'unsafe-inline\' \'self\'; script-src-elem \'unsafe-inline\' \'self\'; style-src \'unsafe-inline\' \'self\'; upgrade-insecure-requests',
};

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: { translate: 'no' },
      title: 'Keycap',
      meta: [
        { name: 'description', content: 'Better notes ❤. Synced between your devices' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'theme-color', content: '#f2f1f3', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#1b1a1e', media: '(prefers-color-scheme: dark)' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'default', media: '(prefers-color-scheme: light)' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent', media: '(prefers-color-scheme: dark)' },
      ],
    },
  },

  routeRules: {
    '/_nuxt/**': {
      headers: { ...(process.env.NODE_ENV === 'production' ? defaultHeaders : {}) },
    },
    '/': { prerender: true },
    '/login': { prerender: true },
    '/register': { prerender: true },
    '/about': { prerender: true },

    '/api/**': { headers: { 'Cache-Control': 'no-store' } },
  },

  runtimeConfig: {
    public: {
      authCookiePrefix: 'auth',
    },
  },

  modules: [
    '@vueuse/nuxt',
    '@nuxtjs/device',
    'nuxt-icon',
    '@nuxtjs/fontaine',
  ],

  css: [
    'normalize.css',
    '~/assets/styles/global.scss',
    '~/assets/fonts/Mona-Sans/style.css',
  ],

  sourcemap: process.env.NODE_ENV === 'development',

  build: {
    transpile: ['ufo'],
  },

  vite: {
    build: {
      target: browserslistToEsbuild(),
    },

    css: {
      preprocessorOptions: {
        scss: {
          additionalData: [
            Object.entries(breakpoints).map(([key, value]) => `$breakpoint-${key}: ${value}px;`).join('\n'),
          ].join('\n'),
        },
      },
    },
  },

  device: {
    refreshOnResize: true,
  },

  fontMetrics: {
    fonts: [
      // src is relative to public folder
      { family: 'Mona Sans', src: '/fonts/Mona-Sans.woff2' },
    ],
  },
});
