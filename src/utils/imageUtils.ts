
export const imageUtils = {
  getValidImageUrl: (imageUrls: string[] | null, productName: string) => {
    console.log('ProductCard - Checking image URLs for product:', productName, imageUrls);
    
    if (imageUrls && imageUrls.length > 0) {
      const firstImage = imageUrls[0];
      console.log('ProductCard - First image URL:', firstImage);
      
      // Check if the image URL exists and is not a placeholder
      if (firstImage && 
          firstImage !== '/placeholder.svg' && 
          !firstImage.includes('placeholder.svg') &&
          firstImage.trim() !== '') {
        console.log('ProductCard - Using valid image URL:', firstImage);
        return firstImage;
      } else {
        console.log('ProductCard - Image URL is invalid or placeholder, using fallback');
      }
    } else {
      console.log('ProductCard - No image URLs available');
    }
    return '/placeholder.svg';
  },

  handleImageError: (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.error('ProductCard - Image failed to load:', target.src);
    if (target.src !== '/placeholder.svg') {
      console.log('ProductCard - Falling back to placeholder');
      target.src = '/placeholder.svg';
    }
  },

  handleImageLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    console.log('ProductCard - Image loaded successfully:', target.src);
  }
};
