const sharp = require('sharp');

class ImageCompressionService {
  constructor() {
    this.defaultOptions = {
      maxWidth: 800,
      maxHeight: 600,
      quality: 70,
      format: 'jpeg'
    };
  }

  /**
   * Compress image from base64 string
   * @param {string} base64Image - Base64 encoded image
   * @param {object} options - Compression options
   * @returns {Promise<string>} - Compressed base64 image
   */
  async compressBase64Image(base64Image, options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };
      
      // Remove data URL prefix if present
      const base64Data = base64Image.replace(/^data:image\/[a-z]+;base64,/, '');
      const imageBuffer = Buffer.from(base64Data, 'base64');
      
      // Compress image
      let sharpInstance = sharp(imageBuffer);
      
      // Resize if needed
      if (opts.maxWidth || opts.maxHeight) {
        sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Set format and quality
      if (opts.format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: opts.quality });
      } else if (opts.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: opts.quality });
      } else if (opts.format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: opts.quality });
      }
      
      const compressedBuffer = await sharpInstance.toBuffer();
      const compressedBase64 = compressedBuffer.toString('base64');
      
      // Add data URL prefix back
      const mimeType = opts.format === 'png' ? 'image/png' : 
                      opts.format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      return `data:${mimeType};base64,${compressedBase64}`;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw new Error('Failed to compress image');
    }
  }

  /**
   * Compress image buffer
   * @param {Buffer} imageBuffer - Image buffer
   * @param {object} options - Compression options
   * @returns {Promise<Buffer>} - Compressed image buffer
   */
  async compressImageBuffer(imageBuffer, options = {}) {
    try {
      const opts = { ...this.defaultOptions, ...options };
      
      let sharpInstance = sharp(imageBuffer);
      
      // Resize if needed
      if (opts.maxWidth || opts.maxHeight) {
        sharpInstance = sharpInstance.resize(opts.maxWidth, opts.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        });
      }
      
      // Set format and quality
      if (opts.format === 'jpeg') {
        sharpInstance = sharpInstance.jpeg({ quality: opts.quality });
      } else if (opts.format === 'png') {
        sharpInstance = sharpInstance.png({ quality: opts.quality });
      } else if (opts.format === 'webp') {
        sharpInstance = sharpInstance.webp({ quality: opts.quality });
      }
      
      return await sharpInstance.toBuffer();
    } catch (error) {
      console.error('Error compressing image buffer:', error);
      throw new Error('Failed to compress image buffer');
    }
  }

  /**
   * Get image info and size
   * @param {string|Buffer} image - Base64 string or buffer
   * @returns {Promise<object>} - Image metadata
   */
  async getImageInfo(image) {
    try {
      let imageBuffer;
      
      if (typeof image === 'string') {
        const base64Data = image.replace(/^data:image\/[a-z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else {
        imageBuffer = image;
      }
      
      const metadata = await sharp(imageBuffer).metadata();
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: imageBuffer.length,
        sizeKB: Math.round(imageBuffer.length / 1024),
        sizeMB: Math.round(imageBuffer.length / (1024 * 1024) * 100) / 100
      };
    } catch (error) {
      console.error('Error getting image info:', error);
      throw new Error('Failed to get image information');
    }
  }

  /**
   * Compress image for food storage (optimized for food images)
   * @param {string} base64Image - Base64 encoded image
   * @returns {Promise<object>} - Compressed image data with metadata
   */
  async compressForFoodStorage(base64Image) {
    try {
      const originalInfo = await this.getImageInfo(base64Image);
      
      // Optimize settings for food images
      const compressionOptions = {
        maxWidth: 600,
        maxHeight: 400,
        quality: 75,
        format: 'jpeg'
      };
      
      const compressedImage = await this.compressBase64Image(base64Image, compressionOptions);
      const compressedInfo = await this.getImageInfo(compressedImage);
      
      return {
        originalImage: base64Image,
        compressedImage,
        originalSize: originalInfo,
        compressedSize: compressedInfo,
        compressionRatio: Math.round((1 - compressedInfo.size / originalInfo.size) * 100),
        metadata: {
          compressed: true,
          compressionDate: new Date().toISOString(),
          settings: compressionOptions
        }
      };
    } catch (error) {
      console.error('Error compressing image for food storage:', error);
      // Return original image if compression fails
      return {
        originalImage: base64Image,
        compressedImage: base64Image,
        originalSize: await this.getImageInfo(base64Image),
        compressedSize: await this.getImageInfo(base64Image),
        compressionRatio: 0,
        metadata: {
          compressed: false,
          error: error.message
        }
      };
    }
  }
}

module.exports = new ImageCompressionService();