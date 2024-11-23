// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import astroExif from './src/integration/astro-exif';
import pagefind from 'astro-pagefind';
import rehypeExternalLinks from 'rehype-external-links';
import icon from "astro-icon";

export default defineConfig({
  site: 'https://blog.bryanvold.com',
  build: {
    format: 'file',
  },
  integrations: [
    mdx(),
    tailwind(),
    sitemap(),
    astroExif(),
    pagefind(),
    icon({
      include: {
        mdi: ["*"]
      },
    }),
  ],
  markdown: {
    rehypePlugins: [
      [rehypeExternalLinks, {
        properties: {
          target: '_blank',
          rel: ['nofollow', 'noopener', 'noreferrer']
        }
      }]
    ],
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  },
//   i18n: {
//     defaultLocale: 'en',
//     locales: ['en', 'ru', 'de', 'es', 'hi'],
// 	routing: {                                                                                          
// 		prefixDefaultLocale: true
// 	}	
//   }
});