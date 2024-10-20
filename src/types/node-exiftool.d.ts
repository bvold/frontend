// src/types/node-exiftool.d.ts
declare module 'node-exiftool' {
    export interface ExifTags {
      DateTimeOriginal?: string;
      Model?: string;
      LensModel?: string;
      FocalLength?: number;
      FNumber?: number;
      ExposureTime?: number;
      ISO?: number;
      GPSPosition?: string;
      [key: string]: any;
    }
  
    export interface ExifMetadata {
      data: ExifTags[];
      error?: string;
    }
  
    export class ExiftoolProcess {
      constructor(binary?: string);
      open(): Promise<void>;
      close(): Promise<void>;
      readMetadata(file: string, args?: string[]): Promise<ExifMetadata>;
    }
  }