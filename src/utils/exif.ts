// src/utils/exif.ts
import exiftool from 'node-exiftool';

const ep = new exiftool.ExiftoolProcess();

export async function getExifData(imagePath: string) {
  try {
    await ep.open();
    const metadata = await ep.readMetadata(imagePath, ['-File:all']);
    const tags = metadata.data[0];

    return {
      dateTaken: tags.DateTimeOriginal,
      camera: tags.LensModel,
      lens: tags.LensModel,
      focalLength: tags.FocalLength,
      aperture: tags.FNumber,
      shutterSpeed: tags.ExposureTime,
      iso: tags.ISO,
      gps: tags.GPSPosition,
    };
  } catch (error) {
    console.error(`Error reading EXIF data from ${imagePath}:`, error);
    return null;
  } finally {
    await ep.close();
  }
}

// Optional: Export a function to explicitly close the exiftool process
export async function closeExiftool() {
  await ep.close();
}