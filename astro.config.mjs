// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import compress from 'astro-compress';

export default defineConfig({
  site: 'https://blog.bryanvold.com',
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
    compress()
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'de', 'es', 'hi'],
	routing: {                                                                                          
		prefixDefaultLocale: true
	}	
  }
});