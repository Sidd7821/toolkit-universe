import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, RotateCw, Download, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ImageRotator: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (JPG, PNG, GIF, WebP)",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setProcessedImageUrl(null);
      setRotation(0);
    }
  }, [toast]);

  const handleRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
  }, []);

  const rotateImage = useCallback(async () => {
    if (!selectedFile || !previewUrl) return;

    setIsProcessing(true);
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate new dimensions after rotation
        const angle = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));
        
        const newWidth = Math.ceil(img.width * cos + img.height * sin);
        const newHeight = Math.ceil(img.width * sin + img.height * cos);

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Move to center of canvas
        ctx.translate(newWidth / 2, newHeight / 2);
        ctx.rotate(angle);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        // Convert to blob and create URL
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setProcessedImageUrl(url);
            setIsProcessing(false);
            toast({
              title: "Success!",
              description: "Image rotated successfully",
            });
          }
        }, 'image/png', 0.9);
      };
      img.src = previewUrl;
    } catch (error) {
      setIsProcessing(false);
      toast({
        title: "Error",
        description: "Failed to rotate image. Please try again.",
        variant: "destructive",
      });
    }
  }, [selectedFile, previewUrl, rotation, toast]);

  const downloadImage = useCallback(() => {
    if (!processedImageUrl) return;

    const link = document.createElement('a');
    link.href = processedImageUrl;
    link.download = `rotated_${selectedFile?.name || 'image'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImageUrl, selectedFile]);

  const clearImage = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (processedImageUrl) URL.revokeObjectURL(processedImageUrl);
    setSelectedFile(null);
    setPreviewUrl(null);
    setProcessedImageUrl(null);
    setRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [previewUrl, processedImageUrl]);

  const quickRotate = useCallback((direction: 'left' | 'right') => {
    const newRotation = direction === 'left' ? rotation - 90 : rotation + 90;
    setRotation(newRotation);
  }, [rotation]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Image Rotator</h1>
        <p className="text-lg text-gray-600">
          Rotate your images in any direction with precision control
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image file to rotate (JPG, PNG, GIF, WebP)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image-upload">Choose Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="cursor-pointer"
              />
            </div>

            {selectedFile && (
              <div className="space-y-2">
                <Label>Selected File</Label>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <ImageIcon className="h-5 w-5 text-gray-500" />
                  <span className="text-sm text-gray-700">{selectedFile.name}</span>
                  <Badge variant="secondary" className="ml-auto">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </Badge>
                </div>
              </div>
            )}

            {selectedFile && (
              <Button onClick={clearImage} variant="outline" className="w-full">
                Clear Image
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Rotation Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCw className="h-5 w-5" />
              Rotation Controls
            </CardTitle>
            <CardDescription>
              Adjust the rotation angle and apply transformations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Rotation Angle: {rotation}°</Label>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => quickRotate('left')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  -90°
                </Button>
                <Button
                  onClick={() => quickRotate('right')}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <RotateCw className="h-4 w-4 mr-1" />
                  +90°
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Custom Rotation</Label>
              <Input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-180°</span>
                <span>0°</span>
                <span>180°</span>
              </div>
            </div>

            <Button
              onClick={rotateImage}
              disabled={!selectedFile || isProcessing}
              className="w-full"
            >
              {isProcessing ? 'Processing...' : 'Rotate Image'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Preview Section */}
      {(previewUrl || processedImageUrl) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Image Preview</CardTitle>
            <CardDescription>
              {processedImageUrl ? 'Rotated image preview' : 'Original image preview'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {previewUrl && (
                <div className="space-y-2">
                  <Label>Original Image</Label>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={previewUrl}
                      alt="Original"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                </div>
              )}
              
              {processedImageUrl && (
                <div className="space-y-2">
                  <Label>Rotated Image</Label>
                  <div className="border rounded-lg overflow-hidden bg-gray-50">
                    <img
                      src={processedImageUrl}
                      alt="Rotated"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>
                  <Button
                    onClick={downloadImage}
                    className="w-full"
                    disabled={!processedImageUrl}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Rotated Image
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>Upload an image file using the file input above</li>
            <li>Use the quick rotation buttons for 90° increments or the slider for custom angles</li>
            <li>Click "Rotate Image" to apply the transformation</li>
            <li>Preview the result and download the rotated image</li>
            <li>Use the clear button to start over with a new image</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageRotator;
