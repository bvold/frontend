import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import matter from 'gray-matter';
import { glob } from 'glob';

interface Frontmatter {
  title: string;
  category: 'bible' | 'general' | 'tech' | 'photo' | 'language';
  pubDate: string;
}

// Color schemes and patterns moved to constants for reuse
const COLOR_SCHEMES = {
  bible: {
    primary: '#7c3aed',
    secondary: '#4c1d95',
    pattern: 'crosses'
  },
  general: {
    primary: '#2563eb',
    secondary: '#1e40af',
    pattern: 'circles'
  },
  tech: {
    primary: '#059669',
    secondary: '#047857',
    pattern: 'circuit'
  },
  photo: {
    primary: '#dc2626',
    secondary: '#991b1b',
    pattern: 'camera'
  },
  language: {
    primary: '#d97706',
    secondary: '#b45309',
    pattern: 'characters'
  }
};

const PATTERNS = {
  crosses: `
    <pattern id="crosses" patternUnits="userSpaceOnUse" width="60" height="60">
      <path d="M20 10h20v20h20v20H40v20H20V50H0V30h20z" fill="currentColor" opacity="0.1"/>
    </pattern>
  `,
  circles: `
    <pattern id="circles" patternUnits="userSpaceOnUse" width="40" height="40">
      <circle cx="20" cy="20" r="15" fill="currentColor" opacity="0.1"/>
    </pattern>
  `,
  circuit: `
    <pattern id="circuit" patternUnits="userSpaceOnUse" width="100" height="100">
      <path d="M10 10h20v20H10zm60 0h20v20H70zm-30 30h20v20H40zm30 30h20v20H70zm-60 0h20v20H10z" fill="currentColor" opacity="0.1"/>
      <path d="M30 20h40M50 30v40" stroke="currentColor" opacity="0.1" stroke-width="2"/>
    </pattern>
  `,
  camera: `
    <pattern id="camera" patternUnits="userSpaceOnUse" width="80" height="80">
      <path d="M20 20h40v30H20z M35 15h10v5H35z" fill="currentColor" opacity="0.1"/>
      <circle cx="40" cy="35" r="10" fill="currentColor" opacity="0.1"/>
    </pattern>
  `,
  characters: `
    <pattern id="characters" patternUnits="userSpaceOnUse" width="80" height="80">
      <text x="10" y="30" font-size="20" fill="currentColor" opacity="0.1">あ</text>
      <text x="40" y="50" font-size="20" fill="currentColor" opacity="0.1">文</text>
      <text x="20" y="70" font-size="20" fill="currentColor" opacity="0.1">字</text>
    </pattern>
  `
};

const CATEGORY_ICONS = {
  bible: 'M10 20h80v60h-80z M20 40h60M20 60h60',
  general: 'M50 20v60M20 50h60',
  tech: 'M30 30h40v40h-40z M40 40h20M40 50h20M40 60h20',
  photo: 'M20 30h60v40h-60z M40 50a10 10 0 1 0 20 0 10 10 0 1 0-20 0',
  language: 'M20 20h60v60h-60z M30 40h40M30 50h40M30 60h40'
};

function wrapText(text: string, maxLength: number = 30): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  words.forEach(word => {
    if ((currentLine + ' ' + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  });
  
  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

async function generateSVG(frontmatter: Frontmatter): Promise<string> {
  const width = 1200;
  const height = 630;

  // Debug
  console.log("frontmatter:", frontmatter);
  
  const scheme = COLOR_SCHEMES[frontmatter.category] || COLOR_SCHEMES.general;
  const wrappedTitle = wrapText(frontmatter.title);

    // Format date and time
  const pubDate = new Date(frontmatter.pubDate);
  const formattedDate = pubDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = pubDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  console.log("scheme:", scheme);
  console.log("wrappedTitle:", wrappedTitle);
  console.log("formattedDate:", formattedDate);
  console.log("Category:", frontmatter.category);

  return `
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 ${width} ${height}"
      width="${width}"
      height="${height}"
    >
      <defs>
        <!-- Gradient definition -->
        <linearGradient id="bg-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="${scheme.primary}" />
          <stop offset="100%" stop-color="${scheme.secondary}" />
        </linearGradient>
        
        <!-- Category-specific pattern -->
        ${PATTERNS[scheme.pattern as keyof typeof PATTERNS]}
      </defs>

      <!-- Background with gradient -->
      <rect width="100%" height="100%" fill="url(#bg-gradient)" />
      
      <!-- Pattern overlay -->
      <rect width="100%" height="100%" fill="url(#${scheme.pattern})" />
      
      <!-- Category icon -->
      <g transform="translate(80, 80) scale(0.5)" stroke="${scheme.secondary}" fill="none" stroke-width="4">
        <path d="${CATEGORY_ICONS[frontmatter.category]}" />
      </g>
      
      <!-- Title -->
      ${wrappedTitle.map((line, index) => `
        <text
          x="80"
          y="${200 + index * 60}"
          font-family="system-ui"
          font-weight="bold"
          font-size="48"
          fill="white"
          filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))"
        >${line}</text>
      `).join('')}
      
      <!-- Category -->
      <text
        x="80"
        y="120"
        font-family="system-ui"
        font-size="32"
        fill="white"
        opacity="0.9"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
      >${frontmatter.category.charAt(0).toUpperCase() + frontmatter.category.slice(1)}</text>
      
      <!-- Date -->
      <text
        x="80"
        y="${height - 80}"
        font-family="system-ui"
        font-size="24"
        fill="white"
        opacity="0.8"
        filter="drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
      >${formattedDate} at ${formattedTime}</text>
    </svg>
  `;
}

// Locate all .md and .mdx files under src/content/** directories
const postsDirPattern = path.join('src', 'content', '**', '*.{md,mdx}');
const heroImagesDir = path.join('public', 'images');

async function generateHeroImages() {
  const files = await glob(postsDirPattern);
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const content = await fs.readFile(file, 'utf-8');
    const parsedMatter = matter(content);
    const frontmatter = parsedMatter.data as Frontmatter;
    
    if (frontmatter.title && frontmatter.pubDate) {
      // Extract category from file path
      const category = path.basename(path.dirname(file));
      console.log("category:", category);

      // Define output path based on category
      const outputDir = path.join(heroImagesDir, category);
      console.log("outputDir:", outputDir);

      const outputFilePath = path.join(outputDir, `${category}-${path.basename(file, path.extname(file))}.png`);
      console.log("outputFilePath:", outputFilePath);

      // Ensure output directory exists
      fs.mkdir(outputDir, { recursive: true });

      // Generate SVG and save as PNG
      const svgContent = await generateSVG(frontmatter);
      await sharp(Buffer.from(svgContent))
        .png()
        .toFile(outputFilePath);
        
      console.log(`Generated hero image for: ${file}`);
    }
  }
}

try {
  generateHeroImages();
} catch (error) {
  console.error('Error generating hero images:', error);
  process.exit(1);
}