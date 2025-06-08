import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import ImageDebugger from '@/components/ImageDebugger';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ 
  images, 
  onImagesChange, 
  maxImages = 6 
}) => {
  const [uploading, setUploading] = useState<boolean[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());
  const [showDebugger, setShowDebugger] = useState(false);
  const { toast } = useToast();

  const compressImage = useCallback((file: File, maxWidth = 800, quality = 0.8): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = img;
        const ratio = Math.min(maxWidth / width, maxWidth / height);
        
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now()
              });
              resolve(compressedFile);
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.src = URL.createObjectURL(file);
    });
  }, []);

  const uploadImage = useCallback(async (file: File, index: number): Promise<string | null> => {
    try {
      console.log('ImageUpload - Starting upload for file:', file.name);
      
      // Compress the image
      const compressedFile = await compressImage(file);
      console.log('ImageUpload - Image compressed:', compressedFile.size, 'bytes');
      
      // Generate unique filename
      const fileExt = 'jpg'; // Always use jpg after compression
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      console.log('ImageUpload - Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile);

      if (error) {
        console.error('ImageUpload - Upload error:', error);
        throw error;
      }

      console.log('ImageUpload - Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('ImageUpload - Generated public URL:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
      return null;
    }
  }, [compressImage, toast]);

  const handleFiles = useCallback(async (files: FileList) => {
    const fileArray = Array.from(files);
    const remainingSlots = maxImages - images.length;
    
    if (fileArray.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file types
    const validFiles = fileArray.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit before compression
      
      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file.`,
          variant: "destructive",
        });
        return false;
      }
      
      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `${file.name} is too large. Maximum 5MB allowed.`,
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    // Set uploading states
    const newUploadingStates = new Array(validFiles.length).fill(true);
    setUploading(prev => [...prev, ...newUploadingStates]);

    try {
      // Upload all files
      const uploadPromises = validFiles.map((file, index) => uploadImage(file, index));
      const uploadResults = await Promise.all(uploadPromises);
      
      // Filter successful uploads
      const successfulUploads = uploadResults.filter(url => url !== null) as string[];
      
      if (successfulUploads.length > 0) {
        console.log('ImageUpload - All uploads successful:', successfulUploads);
        onImagesChange([...images, ...successfulUploads]);
        toast({
          title: "Upload successful",
          description: `${successfulUploads.length} image(s) uploaded successfully.`,
        });
      }
    } finally {
      // Clear uploading states
      setUploading([]);
    }
  }, [images, maxImages, onImagesChange, uploadImage, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    
    // Remove error state for this image
    setImageErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(index);
      return newErrors;
    });
  }, [images, onImagesChange]);

  const handleImageError = useCallback((index: number) => {
    console.error('ImageUpload - Image failed to load at index:', index, 'URL:', images[index]);
    setImageErrors(prev => new Set(prev.add(index)));
  }, [images]);

  const handleImageLoad = useCallback((index: number) => {
    console.log('ImageUpload - Image loaded successfully at index:', index, 'URL:', images[index]);
    setImageErrors(prev => {
      const newErrors = new Set(prev);
      newErrors.delete(index);
      return newErrors;
    });
  }, [images]);

  // Check if an image URL is valid (not just placeholder)
  const isValidImageUrl = useCallback((url: string) => {
    return url && 
           url !== '/placeholder.svg' && 
           !url.includes('placeholder.svg') &&
           url.trim() !== '';
  }, []);

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card className={`border-2 border-dashed transition-colors ${
        dragActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
      }`}>
        <CardContent className="p-6">
          <div
            className="text-center"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <div className="space-y-2">
              <p className="text-lg font-medium">
                Upload Product Images
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop images here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Maximum {maxImages} images, up to 5MB each. Images will be optimized automatically.
              </p>
            </div>
            
            <div className="mt-4">
              <Button type="button" variant="outline" className="relative">
                <Upload className="mr-2 h-4 w-4" />
                Choose Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={images.length >= maxImages}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Images Counter and Debug Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {images.length} / {maxImages} images
          </Badge>
          {images.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugger(!showDebugger)}
              className="text-orange-600 hover:text-orange-800"
            >
              {showDebugger ? 'Hide' : 'Show'} Debug Info
            </Button>
          )}
        </div>
        {uploading.length > 0 && (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading {uploading.length} image(s)...
          </div>
        )}
      </div>

      {/* Image Debug Info */}
      {showDebugger && images.length > 0 && (
        <ImageDebugger imageUrls={images} title="Product Images Debug" />
      )}

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                {imageErrors.has(index) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <AlertCircle className="h-8 w-8 mb-2" />
                    <span className="text-xs text-center px-2">
                      Failed to load image
                    </span>
                  </div>
                ) : (
                  <img
                    src={imageUrl}
                    alt={`Product image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(index)}
                    onLoad={() => handleImageLoad(index)}
                  />
                )}
              </div>
              
              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeImage(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              
              {/* Image index badge */}
              <Badge 
                className="absolute bottom-2 left-2 bg-black/70 text-white"
                variant="secondary"
              >
                {index + 1}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
