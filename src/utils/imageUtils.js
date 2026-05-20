// ================================================
// IMAGE UTILITIES - Safe Image Handling
// ================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Default placeholder SVG
export const DEFAULT_PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect fill='%231e293b' width='400' height='400'/%3E%3Ccircle cx='200' cy='180' r='80' fill='%23374151'/%3E%3Ccircle cx='200' cy='180' r='50' fill='%231e293b'/%3E%3Ctext x='200' y='320' text-anchor='middle' fill='%239ca3af' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E`;

/**
 * Normalize image URL to full URL
 * Handles: relative paths, http/https, S3 URLs
 */
export const normalizeImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (typeof imagePath !== 'string') return null;
  
  // Already full URL (S3, http, https)
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Data URL (SVG placeholder etc)
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  // Relative path - prepend API base URL
  return `${API_BASE_URL}/${imagePath}`.replace(/([^:]\/)\/+/g, '$1');
};

/**
 * Safe parse images from product
 * Handles: null, undefined, string JSON, array, object
 * 
 * Expected format: product.images = string[] (from API)
 */
export const parseProductImages = (product) => {
  if (!product) return [];
  
  console.log("[ImageUtils] Parsing product:", product?.name, {
    imagesType: typeof product.images,
    imagesIsArray: Array.isArray(product.images),
    imagesLength: product.images?.length,
    imagesValue: product.images
  });
  
  // Try different image fields
  let rawImages = product.images || product.imagesList || product.imageUrls || [];
  
  // If string (JSON), parse it
  if (typeof rawImages === 'string') {
    try {
      const parsed = JSON.parse(rawImages);
      rawImages = Array.isArray(parsed) ? parsed : [];
      console.log("[ImageUtils] Parsed JSON images:", rawImages);
    } catch (e) {
      // Not JSON, treat as single image URL
      if (rawImages.trim()) {
        const result = [normalizeImageUrl(rawImages.trim())].filter(Boolean);
        console.log("[ImageUtils] Single image from string:", result);
        return result;
      }
      return [];
    }
  }
  
  // If object, try to extract URL
  if (!Array.isArray(rawImages) && typeof rawImages === 'object') {
    if (rawImages.url) {
      return [normalizeImageUrl(rawImages.url)].filter(Boolean);
    }
    if (rawImages.imageUrl) {
      return [normalizeImageUrl(rawImages.imageUrl)].filter(Boolean);
    }
    return [];
  }
  
  // Ensure array
  if (!Array.isArray(rawImages)) {
    console.log("[ImageUtils] Images is not array:", rawImages);
    return [];
  }
  
  // Filter and normalize
  const result = rawImages
    .filter(img => img && (typeof img === 'string' || typeof img === 'object'))
    .map(img => {
      // Handle object format {id, imageUrl}
      if (typeof img === 'object' && img.imageUrl) {
        return normalizeImageUrl(img.imageUrl);
      }
      // Handle string format
      if (typeof img === 'string' && img.trim()) {
        return normalizeImageUrl(img.trim());
      }
      return null;
    })
    .filter(Boolean);
  
  console.log("[ImageUtils] Final images:", result);
  return result;
};

/**
 * Get primary image URL for product
 */
export const getPrimaryImage = (product, fallback = DEFAULT_PLACEHOLDER) => {
  const images = parseProductImages(product);
  const primaryImage = images[0] || fallback;
  console.log("[ImageUtils] Primary image for", product?.name, ":", primaryImage);
  return primaryImage;
};

/**
 * Get all images for product as array (never null/undefined)
 */
export const getProductImages = (product) => {
  const images = parseProductImages(product);
  return images.length > 0 ? images : [DEFAULT_PLACEHOLDER];
};

/**
 * Preload images in background
 */
export const preloadImages = (images) => {
  if (!images || images.length === 0) return;
  
  images.forEach(src => {
    if (!src) return;
    const img = new Image();
    img.src = src;
  });
};

/**
 * Preload images for multiple products
 */
export const preloadProductImages = (products) => {
  if (!products || products.length === 0) return;
  
  products.forEach(product => {
    const images = parseProductImages(product);
    preloadImages(images);
  });
};
