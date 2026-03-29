import { apiEndpoint, repositoryName } from "./slicemachine.config.json";
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/prismic',
  ],

  css: [
    '~/assets/css/tailwind.css',
    '~/assets/css/theme.css',
  ],

  vite: {
    plugins: [
      // @ts-expect-error - tailwindcss vite plugin
      (await import('@tailwindcss/vite')).default(),
    ],
  },

  supabase: {
    redirect: false, // We handle auth guards manually via middleware
  },

  prismic: {
    endpoint: apiEndpoint || repositoryName,
  },

  app: {
    head: {
      title: 'Prado Itinéraires',
      htmlAttrs: { lang: 'fr' },
      script: [
        {
          innerHTML: `(function(){try{var t=localStorage.getItem('prado-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t)}}catch(e){}})()`,
          type: 'text/javascript',
          tagPosition: 'head',
        },
      ],
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,400;0,500;0,600;1,400;1,500;1,600&display=swap' },
      ],
      meta: [
        { name: 'description', content: 'Actions socio-éducatives pour accompagner les jeunes vers l\'autonomie' },
      ],
    },
  },

  nitro: {
    preset: 'vercel',
  },

  routeRules: {
    '/': { isr: false, headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate' } },
  },

  runtimeConfig: {
    supabaseServiceRoleKey: '',
    resendApiKey: '',
    cronSecret: '',
    veriffApiKey: '',
    veriffSecretKey: '',
    veriffBaseUrl: 'https://stationapi.veriff.com',
    public: {
      supabaseUrl: '',
      supabaseKey: '',
      siteUrl: '',
    },
  },
})