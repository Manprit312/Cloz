import { Injectable } from '@angular/core';
import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.1 to 1.0
  maxSizeMB?: number; // Maximum file size in MB
}

@Injectable({
  providedIn: 'root',
})
export class ImageCompressionService {
  private readonly DEFAULT_MAX_WIDTH = 1200;
  private readonly DEFAULT_MAX_HEIGHT = 1200;
  private readonly DEFAULT_QUALITY = 0.7;
  private readonly DEFAULT_MAX_SIZE_MB = 1;

  /**
   * Compress an image file using browser-image-compression library
   * @param file The image file to compress
   * @param options Compression options
   * @returns Promise that resolves to a compressed File
   */
  async compressImage(
    file: File,
    options: CompressionOptions = {}
  ): Promise<File> {
    try {
      const maxWidth = options.maxWidth || this.DEFAULT_MAX_WIDTH;
      const maxHeight = options.maxHeight || this.DEFAULT_MAX_HEIGHT;
      const quality = options.quality || this.DEFAULT_QUALITY;
      const maxSizeMB = options.maxSizeMB || this.DEFAULT_MAX_SIZE_MB;

      // Use the larger dimension for maxWidthOrHeight to ensure both constraints are respected
      // The library maintains aspect ratio, so this ensures neither dimension exceeds its limit
      const maxWidthOrHeight = Math.max(maxWidth, maxHeight);

      // Determine output format - prefer JPEG for better compression, but keep PNG for transparency
      let outputFileType = 'image/jpeg';
      if (file.type === 'image/png' || file.type === 'image/webp') {
        // Keep PNG/WebP format if original was PNG/WebP (preserves transparency)
        outputFileType = file.type;
      }

      const compressionOptions = {
        maxSizeMB: maxSizeMB,
        maxWidthOrHeight: maxWidthOrHeight,
        useWebWorker: true, // Use web worker for better performance
        initialQuality: quality,
        fileType: outputFileType,
        preserveExif: false, // Remove EXIF data to reduce file size
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image. Please try again.');
    }
  }

  /**
   * Convert a File to base64 string (for preview)
   * @param file The file to convert
   * @returns Promise that resolves to base64 string
   */
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target?.result) {
          resolve(e.target.result as string);
        } else {
          reject(new Error('Failed to read file'));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };

      reader.readAsDataURL(file);
    });
  }
}

