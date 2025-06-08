
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, ExternalLink } from 'lucide-react';

interface ImageDebuggerProps {
  imageUrls: string[];
  title?: string;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ imageUrls, title = "Image Debug Info" }) => {
  const [imageStates, setImageStates] = useState<{[key: string]: 'loading' | 'success' | 'error' | 'untested'}>({});
  const [testing, setTesting] = useState(false);

  const testImage = async (url: string): Promise<'success' | 'error'> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve('success');
      img.onerror = () => resolve('error');
      img.src = url;
      
      // Timeout after 10 seconds
      setTimeout(() => resolve('error'), 10000);
    });
  };

  const testAllImages = async () => {
    setTesting(true);
    const newStates: {[key: string]: 'loading' | 'success' | 'error'} = {};
    
    // Set all to loading
    imageUrls.forEach(url => {
      newStates[url] = 'loading';
    });
    setImageStates(newStates);

    // Test each image
    for (const url of imageUrls) {
      if (url && url.trim() !== '') {
        const result = await testImage(url);
        setImageStates(prev => ({ ...prev, [url]: result }));
      } else {
        setImageStates(prev => ({ ...prev, [url]: 'error' }));
      }
    }
    
    setTesting(false);
  };

  useEffect(() => {
    // Initialize states
    const initialStates: {[key: string]: 'untested'} = {};
    imageUrls.forEach(url => {
      initialStates[url] = 'untested';
    });
    setImageStates(initialStates);
  }, [imageUrls]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline" className="text-blue-600">Testing...</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-600 border-green-300">✓ Accessible</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-600 border-red-300">✗ Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-gray-600">Untested</Badge>;
    }
  };

  if (imageUrls.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <p className="text-gray-500 text-sm">No images to debug</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-orange-800">{title}</CardTitle>
          <Button 
            onClick={testAllImages} 
            disabled={testing}
            size="sm"
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
          >
            {testing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Test All Images
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {imageUrls.map((url, index) => (
          <div key={index} className="border rounded-lg p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {getStatusIcon(imageStates[url])}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">Image {index + 1}</span>
                  {getStatusBadge(imageStates[url])}
                </div>
                <div className="text-xs text-gray-600 break-all mb-2">
                  {url || 'Empty URL'}
                </div>
                {url && url.trim() !== '' && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 text-xs"
                      onClick={() => window.open(url, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Open
                    </Button>
                    {imageStates[url] === 'success' && (
                      <div className="w-12 h-12 border rounded overflow-hidden">
                        <img 
                          src={url} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ImageDebugger;
