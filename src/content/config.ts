// src/content/config.ts
import { defineCollection, z } from 'astro:content';
// import { date } from 'astro:schema';

// Define schemas for different content types
const baseSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  category: z.enum(['general', 'tech', 'photo', 'bible', 'language']),
});

const blogSchema = baseSchema.extend({
});

const techSchema = baseSchema.extend({
  tags: z.array(z.string()),
  language: z.string().optional(),
  codeRepo: z.string().url().optional(),
});

const photoSchema = baseSchema.extend({
  // Transform string to Date or accept Date object
  date: z.string()
    .or(z.date())
    .transform((val) => new Date(val)),
  camera: z.string().optional(),
  lens: z.string().optional(),
  gallery: z.array(z.object({
    url: z.string(),
    caption: z.string().optional(),
	alt: z.string(),
	exif: z.object({
    dateTaken: z.string().optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    focalLength: z.string().optional(),
    aperture: z.string().optional(),
    shutterSpeed: z.string().optional(),
    iso: z.number().optional(),
	}).optional(),
  })).optional(),
});

const bibleSchema = baseSchema.extend({
  scriptureReferences: z.array(z.string()).optional(),
  bibleBlogType: z.enum(['interpretation', 'study', 'commentary']).optional(),
});

const languageSchema = baseSchema.extend({
  languageLevel: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  targetLanguage: z.string(),
});

// Define collections for each content type
export const collections = {
  'general': defineCollection({ schema: blogSchema }),
  'tech': defineCollection({ schema: techSchema }),
  'photo': defineCollection({ schema: photoSchema }),
  'bible': defineCollection({ schema: bibleSchema }),
  'language': defineCollection({ schema: languageSchema }),
};