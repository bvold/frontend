/** @type {import('tailwindcss').Config} */
import tailwind from '@astrojs/tailwind'
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [],
	integrations: [tailwind()],
}
