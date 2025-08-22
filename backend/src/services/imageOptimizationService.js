const sharp = require('sharp');

class ImageOptimizationService {
  /**
   * Optimiza una imagen base64
   * @param {string} base64Image - Imagen en formato base64
   * @param {Object} options - Opciones de optimización
   * @returns {Promise<string>} - Imagen optimizada en base64
   */
  static async optimizeImage(base64Image, options = {}) {
    try {
      const {
        maxWidth = 1200,
        maxHeight = 1200,
        quality = 80,
        format = 'jpeg'
      } = options;

      // Convertir base64 a buffer
      const buffer = Buffer.from(base64Image, 'base64');
      
      // Optimizar imagen
      const optimizedBuffer = await sharp(buffer)
        .resize(maxWidth, maxHeight, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality })
        .toBuffer();

      // Convertir de vuelta a base64
      return optimizedBuffer.toString('base64');
    } catch (error) {
      console.error('Error al optimizar imagen:', error);
      // Si falla la optimización, devolver la imagen original
      return base64Image;
    }
  }

  /**
   * Optimiza múltiples imágenes
   * @param {Array} images - Array de objetos de imagen
   * @param {Object} options - Opciones de optimización
   * @returns {Promise<Array>} - Array de imágenes optimizadas
   */
  static async optimizeImages(images, options = {}) {
    const optimizedImages = [];
    
    for (const image of images) {
      try {
        const optimizedData = await this.optimizeImage(image.data, options);
        optimizedImages.push({
          ...image,
          data: optimizedData
        });
      } catch (error) {
        console.error(`Error al optimizar imagen ${image.filename}:`, error);
        // Si falla, mantener la imagen original
        optimizedImages.push(image);
      }
    }
    
    return optimizedImages;
  }

  /**
   * Calcula el tamaño aproximado de una imagen base64
   * @param {string} base64String - String base64
   * @returns {number} - Tamaño en bytes
   */
  static getImageSize(base64String) {
    return Math.ceil((base64String.length * 3) / 4);
  }

  /**
   * Verifica si una imagen necesita optimización
   * @param {string} base64String - String base64
   * @param {number} maxSizeMB - Tamaño máximo en MB
   * @returns {boolean} - True si necesita optimización
   */
  static needsOptimization(base64String, maxSizeMB = 1) {
    const sizeInBytes = this.getImageSize(base64String);
    const sizeInMB = sizeInBytes / (1024 * 1024);
    return sizeInMB > maxSizeMB;
  }
}

module.exports = ImageOptimizationService; 