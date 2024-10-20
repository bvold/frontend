// src/integration/astro-exif.ts
import type { AstroIntegration } from 'astro';
import { getExifData } from '../utils/exif';
import path from 'path';
import fs from 'fs/promises';

interface AstroPage {
    component: string;
    [key: string]: any;
  }

export default function astroExif(): AstroIntegration {
  return {
    name: 'astro-exif',
    hooks: {
      'astro:build:setup': async ({ pages }) => {
        // Convert Map to Array and filter
        const photoFiles = Array.from(pages.values()).filter((page: AstroPage) => 
            page.component.startsWith('src/content/photo/'));
        
        for (const page of photoFiles) {
          const content = await fs.readFile(page.component, 'utf-8');
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          
          if (frontmatterMatch) {
            const imagePathMatch = content.match(/!\[.*?\]\((.*?)\)/);
            if (imagePathMatch) {
              const imagePath = path.join(
                process.cwd(), 
                'public', 
                imagePathMatch[1]
              );
              
              const exifData = await getExifData(imagePath);
              if (exifData) {
                // Update frontmatter with EXIF data
                const newFrontmatter = `---
${frontmatterMatch[1]}
exif:
  dateTaken: "${exifData.dateTaken}"
  camera: "${exifData.camera}"
  lens: "${exifData.lens}"
  focalLength: "${exifData.focalLength}"
  aperture: "${exifData.aperture}"
  shutterSpeed: "${exifData.shutterSpeed}"
  iso: ${exifData.iso}
---`;
                const newContent = content.replace(/^---[\s\S]*?---/, newFrontmatter);
                await fs.writeFile(page.component, newContent);
              }
            }
          }
        }
      }
    }
  };
}