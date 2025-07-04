
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, X, Image as ImageIcon, Loader2, AlertCircle } from 'lucide-react';

interface CategoryImageUploadProps {
  imageUrl: string;
  onImageChange: (imageUrl: string) => void;
}

const CategoryImageUpload: React.FC<CategoryImageUploadProps> = ({ 
  imageUrl, 
  onImageChange 
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { toast } = useToast();

  const compressImage = useCallback((file: File, maxWidth = 400, quality = 0.8): Promise<File> => {
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

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    try {
      console.log('CategoryImageUpload - Starting upload for file:', file.name);
      
      // Compress the image
      const compressedFile = await compressImage(file);
      console.log('CategoryImageUpload - Image compressed:', compressedFile.size, 'bytes');
      
      // Generate unique filename
      const fileExt = 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `categories/${fileName}`;

      console.log('CategoryImageUpload - Uploading to path:', filePath);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(filePath, compressedFile);

      if (error) {
        console.error('CategoryImageUpload - Upload error:', error);
        throw error;
      }

      console.log('CategoryImageUpload - Upload successful:', data);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      console.log('CategoryImageUpload - Generated public URL:', publicUrl);
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

  const handleFile = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: `${file.name} is not a valid image file.`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${file.name} is too large. Maximum 5MB allowed.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const uploadedUrl = await uploadImage(file);
      
      if (uploadedUrl) {
        console.log('CategoryImageUpload - Upload successful:', uploadedUrl);
        onImageChange(uploadedUrl);
        setImageError(false);
        toast({
          title: "Upload successful",
          description: "Category image uploaded successfully.",
        });
      }
    } finally {
      setUploading(false);
    }
  }, [uploadImage, onImageChange, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const removeImage = useCallback(() => {
    onImageChange('');
    setImageError(false);
  }, [onImageChange]);

  const handleImageError = useCallback(() => {
    console.error('CategoryImageUpload - Image failed to load:', imageUrl);
    setImageError(true);
  }, [imageUrl]);

  const handleImageLoad = useCallback(() => {
    console.log('CategoryImageUpload - Image loaded successfully:', imageUrl);
    setImageError(false);
  }, [imageUrl]);

  const isValidImageUrl = useCallback((url: string) => {
    return url && 
           url !== '/placeholder.svg' && 
           !url.includes('placeholder.svg') &&
           url.trim() !== '';
  }, []);

  return (
    <div className="space-y-4">
      {/* Current Image Preview */}
      {imageUrl && isValidImageUrl(imageUrl) && (
        <div className="relative group">
          <div className="aspect-video w-full max-w-sm rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
            {imageError ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                <AlertCircle className="h-8 w-8 mb-2" />
                <span className="text-xs text-center px-2">
                  Failed to load image
                </span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt="Category image"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
            )}
          </div>
          
          {/* Remove button */}
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

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
                Upload Category Image
              </p>
              <p className="text-sm text-gray-500">
                Drag and drop an image here or click to browse
              </p>
              <p className="text-xs text-gray-400">
                Maximum 5MB, recommended size: 400x225px (16:9 aspect ratio)
              </p>
            </div>
            
            <div className="mt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="relative"
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Choose Image
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileInput}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={uploading}
                />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center justify-center text-sm text-gray-500">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Uploading image...
        </div>
      )}
    </div>
  );
};

export default CategoryImageUpload;
