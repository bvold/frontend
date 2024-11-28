// src/integration/astro-exif.ts
import type { AstroIntegration } from 'astro';
import { getExifData } from '../utils/exif';
import path from 'path';
import fs from 'fs/promises';
import yaml from 'yaml';
import { glob } from 'glob';

interface GalleryImage {
  url: string;
  caption?: string;
  alt: string;
  exif?: {
    dateTaken?: string;
    manufacturer?: string;
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

async function parseImagePath(imagePath: string, publicDir: string): Promise<string> {
  // Remove any URL parameters
  imagePath = imagePath.split('?')[0];
  
  // Convert URL path to filesystem path
  const cleanPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
  const fullPath = path.join(publicDir, cleanPath);
  
  console.log(`Attempting to access image at: ${fullPath}`);
  
  // Check if file exists
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch (error) {
    throw new Error(`Image file not found: ${fullPath}`);
  }
}

async function updateFrontmatter(content: string, heroExif: any, galleryExifData: any[]): Promise<string> {
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) {
    console.warn('No frontmatter found in content');
    return content;
  }

  let frontmatter;
  try {
    frontmatter = yaml.parse(frontmatterMatch[1]) as Frontmatter;
    console.log('Parsed frontmatter:', frontmatter);
  } catch (error) {
    console.error('Error parsing frontmatter:', error);
    return content;
  }

  // Update hero image EXIF if it exists
  if (heroExif) {
    frontmatter.heroExif = heroExif;
    console.log('Updated hero EXIF:', heroExif);
  }

  // Update gallery EXIF data if it exists
  if (frontmatter.gallery && galleryExifData.length > 0) {
    frontmatter.gallery = frontmatter.gallery.map((image: GalleryImage, index: number) => ({
      ...image,
      exif: galleryExifData[index] || image.exif
    }));
    console.log('Updated gallery EXIF data');
  }

  const newFrontmatter = yaml.stringify(frontmatter);
  return `---\n${newFrontmatter}---${content.slice(frontmatterMatch[0].length)}`;
}

export default function astroExif(): AstroIntegration {
  let exiftoolProcess: any = null;

  return {
    name: 'astro-exif',
    hooks: {
      'astro:config:setup': async () => {
        console.log('Initializing astro-exif integration');
        // Initialize ExifTool process
        const { default: exiftool } = await import('node-exiftool');
        const ep = new exiftool.ExiftoolProcess();
        await ep.open();
        exiftoolProcess = ep;
        console.log('ExifTool process initialized');
      },
      'astro:build:setup': async () => {
        const publicDir = path.join(process.cwd(), 'public');
        const contentDir = path.join(process.cwd(), 'src', 'content', 'photo');
        
        console.log('Public directory:', publicDir);
        console.log('Content directory:', contentDir);
        
        // Find all markdown and MDX files in the content/photo directory
        const photoFiles = await glob(['**/*.{md,mdx}'], {
          cwd: contentDir,
          absolute: true
        });
        
        console.log(`Found ${photoFiles.length} photo files to process:`, photoFiles);
        
        for (const filePath of photoFiles) {
          try {
            console.log(`\nProcessing ${filePath}`);
            const content = await fs.readFile(filePath, 'utf-8');
            const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (frontmatterMatch) {
              const frontmatter = yaml.parse(frontmatterMatch[1]) as Frontmatter;
              let heroExif = null;
              const galleryExifData = [];

              // Process hero image if it exists
              if (frontmatter.heroImage) {
                try {
                  const heroImagePath = await parseImagePath(frontmatter.heroImage, publicDir);
                  console.log(`Reading EXIF from hero image: ${heroImagePath}`);
                  heroExif = await getExifData(heroImagePath);
                  console.log('Hero image EXIF data:', heroExif);
                } catch (error) {
                  console.warn(`Warning: Could not read EXIF data from hero image ${frontmatter.heroImage}:`, error);
                }
              }

              // Process gallery images if they exist
              if (frontmatter.gallery) {
                for (const image of frontmatter.gallery) {
                  try {
                    const imagePath = await parseImagePath(image.url, publicDir);
                    console.log(`Reading EXIF from gallery image: ${imagePath}`);
                    const exifData = await getExifData(imagePath);
                    console.log('Gallery image EXIF data:', exifData);
                    galleryExifData.push(exifData);
                  } catch (error) {
                    console.warn(`Warning: Could not read EXIF data from gallery image ${image.url}:`, error);
                    galleryExifData.push(null);
                  }
                }
              }

              // Update the frontmatter with the new EXIF data
              const updatedContent = await updateFrontmatter(content, heroExif, galleryExifData);
              await fs.writeFile(filePath, updatedContent);
              console.log(`Updated ${filePath} with EXIF data`);
            }
          } catch (error) {
            console.error(`Error processing file ${filePath}:`, error);
          }
        }
      },
      'astro:build:done': async () => {
        console.log('Cleaning up ExifTool process');
        // Clean up ExifTool process
        if (exiftoolProcess) {
          await exiftoolProcess.close();
        }
      }
    }
  };
}