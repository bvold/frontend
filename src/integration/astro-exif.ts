// src/integration/astro-exif.ts
import type { AstroIntegration } from 'astro';
import { getExifData } from '../utils/exif';
import path from 'path';
import fs from 'fs/promises';
import yaml from 'yaml';

interface AstroPage {
  component: string;
  [key: string]: any;
}

interface GalleryImage {
  url: string;
  caption?: string;
  alt: string;
  exif?: {
    dateTaken?: string;
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: number;
  };
}

interface Frontmatter {
  heroImage?: string;
  gallery?: GalleryImage[];
  [key: string]: any;
}

async function parseImagePath(imagePath: string): Promise<string> {
  // Convert URL path to filesystem path
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  return path.join(process.cwd(), 'public', cleanPath);
}

async function updateFrontmatter(content: string, heroExif: any, galleryExifData: any[]): Promise<string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return content;

  const frontmatter = yaml.parse(frontmatterMatch[1]) as Frontmatter;

  // Update hero image EXIF if it exists
  if (heroExif) {
    frontmatter.heroExif = {
      dateTaken: heroExif.dateTaken,
      camera: heroExif.camera,
      lens: heroExif.lens,
      focalLength: heroExif.focalLength,
      aperture: heroExif.aperture,
      shutterSpeed: heroExif.shutterSpeed,
      iso: heroExif.iso
    };
  }

  // Update gallery EXIF data if it exists
  if (frontmatter.gallery && galleryExifData.length > 0) {
    frontmatter.gallery = frontmatter.gallery.map((image: GalleryImage, index: number) => ({
      ...image,
      exif: galleryExifData[index] ? {
        dateTaken: galleryExifData[index].dateTaken,
        camera: galleryExifData[index].camera,
        lens: galleryExifData[index].lens,
        focalLength: galleryExifData[index].focalLength,
        aperture: galleryExifData[index].aperture,
        shutterSpeed: galleryExifData[index].shutterSpeed,
        iso: galleryExifData[index].iso
      } : image.exif
    }));
  }

  return `---\n${yaml.stringify(frontmatter)}---${content.slice(frontmatterMatch[0].length)}`;
}

export default function astroExif(): AstroIntegration {
  return {
    name: 'astro-exif',
    hooks: {
      'astro:build:setup': async ({ pages }) => {
        const photoFiles = Array.from(pages.values()).filter((page: AstroPage) => 
          page.component.includes('content/photo/') || 
          page.component.includes('content/photos/')
        );
        
        for (const page of photoFiles) {
          try {
            const content = await fs.readFile(page.component, 'utf-8');
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (frontmatterMatch) {
              const frontmatter = yaml.parse(frontmatterMatch[1]) as Frontmatter;
              let heroExif = null;
              const galleryExifData = [];

              // Process hero image if it exists
              if (frontmatter.heroImage) {
                const heroImagePath = await parseImagePath(frontmatter.heroImage);
                try {
                  heroExif = await getExifData(heroImagePath);
                } catch (error) {
                  console.warn(`Warning: Could not read EXIF data from hero image ${heroImagePath}:`, error);
                }
              }

              // Process gallery images if they exist
              if (frontmatter.gallery) {
                for (const image of frontmatter.gallery) {
                  try {
                    const imagePath = await parseImagePath(image.url);
                    const exifData = await getExifData(imagePath);
                    galleryExifData.push(exifData);
                  } catch (error) {
                    console.warn(`Warning: Could not read EXIF data from gallery image ${image.url}:`, error);
                    galleryExifData.push(null);
                  }
                }
              }

              // Update the frontmatter with the new EXIF data
              const updatedContent = await updateFrontmatter(content, heroExif, galleryExifData);
              await fs.writeFile(page.component, updatedContent);
            }
          } catch (error) {
            console.error(`Error processing file ${page.component}:`, error);
          }
        }
      }
    }
  };
}