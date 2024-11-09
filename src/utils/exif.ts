// src/utils/exif.ts
import exiftool from 'node-exiftool';

let ep: any = null;

async function ensureExiftoolProcess() {
  if (!ep) {
    ep = new exiftool.ExiftoolProcess();
    await ep.open();
  }
  return ep;
}

export async function getExifData(imagePath: string) {
  const process = await ensureExiftoolProcess();
  
  try {
    console.log(`Reading EXIF data from: ${imagePath}`);
    const metadata = await process.readMetadata(imagePath, [
      // '-File:all',
      // '-ExifIFD:all',
      // '-IPTC:all',
      // '-XMP:all'
    ]);
    
    console.log('Raw metadata:', metadata);
    
    if (!metadata.data || !metadata.data[0]) {
      console.warn('No metadata found in image');
      return null;
    }

    const tags = metadata.data[0];

    // Try different possible tag names for each piece of data
    const result = {
      dateTaken: tags.DateTimeOriginal || tags.CreateDate || tags.ModifyDate,
      camera: tags.Model || tags.Make,
      lens: tags.LensModel || tags.Lens || tags.LensID,
      // focalLength: tags.FocalLength ? `${tags.FocalLength}mm` : null,
      focalLength: `${tags.FocalLength35efl}` ? `${tags.FocalLength}` : null,
      aperture: `${tags.FNumber}` || `${tags.Aperture}`,
      shutterSpeed: tags.ExposureTime || tags.ShutterSpeed,
      iso: tags.ISO || tags.ISOSpeedRatings,
    };

    console.log('Processed EXIF data:', result);
    return result;
  } catch (error) {
    console.error(`Error reading EXIF data:`, error);
    return null;
  }
}

// Optional: Export a function to explicitly close the exiftool process
export async function closeExiftool() {
  if (ep) {
    await ep.close();
    ep = null;
  }
}