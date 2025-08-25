import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  Image, 
  Settings, 
  Trash2,
  CheckCircle,
  Info,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageFile {
  id: string;
  file: File;
  originalSize: number;
  preview: string;
  processed?: {
    blob: Blob;
    size: number;
  };
}

const BulkImageResizer = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedImages, setProcessedImages] = useState<ImageFile[]>([]);
  const [progress, setProgress] = useState(0);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [quality, setQuality] = useState(85);
  const [format, setFormat] = useState('jpeg');
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newImages = files.map(file => {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a valid image file`,
          variant: "destructive"
        });
        return null;
      }

      const id = Math.random().toString(36).substr(2, 9);
      const preview = URL.createObjectURL(file);

      return {
        id,
        file,
        originalSize: file.size,
        preview
      };
    }).filter((img): img is ImageFile => img !== null);

    setImages(prev => [...prev, ...newImages]);
    
    toast({
      title: "Images added",
      description: `${newImages.length} image(s) have been added`,
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setProcessedImages(prev => prev.filter(img => img.id !== id));
  };

  const clearAll = () => {
    setImages([]);
    setProcessedImages([]);
    setProgress(0);
  };

  const resizeImage = (imageFile: ImageFile): Promise<ImageFile> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        let newWidth = width;
        let newHeight = height;

        if (maintainAspectRatio) {
          const ratio = Math.min(width / img.width, height / img.height);
          newWidth = Math.round(img.width * ratio);
          newHeight = Math.round(img.height * ratio);
        }

        canvas.width = newWidth;
        canvas.height = newHeight;
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const processedImage: ImageFile = {
                ...imageFile,
                processed: {
                  blob,
                  size: blob.size
                }
              };
              resolve(processedImage);
            } else {
              resolve(imageFile);
            }
          },
          `image/${format}`,
          quality / 100
        );
      };

      img.src = imageFile.preview;
    });
  };

  const processImages = async () => {
    if (images.length === 0) {
      toast({
        title: "No images",
        description: "Please add some images to process",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setProgress(0);
    const processed: ImageFile[] = [];

    for (let i = 0; i < images.length; i++) {
      const processedImage = await resizeImage(images[i]);
      processed.push(processedImage);
      setProgress(((i + 1) / images.length) * 100);
    }

    setProcessedImages(processed);
    setIsProcessing(false);

    toast({
      title: "Processing complete",
      description: `${processed.length} images have been resized successfully`,
    });
  };

  const downloadAll = () => {
    if (processedImages.length === 0) return;

    processedImages.forEach((image) => {
      const link = document.createElement('a');
      link.href = URL.createObjectURL(image.processed!.blob);
      link.download = `resized_${image.file.name.replace(/\.[^/.]+$/, '')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    toast({
      title: "Download started",
      description: `${processedImages.length} images are being downloaded`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Images
          </CardTitle>
          <CardDescription>
            Select multiple images to resize them all at once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Choose Images
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              {images.length > 0 && (
                <Button onClick={clearAll} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
            
            {images.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {images.length} image(s) selected
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resize Settings */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Resize Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Width (px)</Label>
                <Input
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label>Height (px)</Label>
                <Input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quality: {quality}%</Label>
              <Input
                type="range"
                min="1"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="aspect-ratio"
                checked={maintainAspectRatio}
                onCheckedChange={(checked) => setMaintainAspectRatio(checked as boolean)}
              />
              <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
            </div>

            <Button
              onClick={processImages}
              disabled={isProcessing || images.length === 0}
              className="w-full"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing... {Math.round(progress)}%
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Resize {images.length} Image{images.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>

            {isProcessing && (
              <Progress value={progress} className="w-full" />
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Preview */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Image Preview ({images.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <img
                    src={image.preview}
                    alt={image.file.name}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                    <Button
                      onClick={() => removeImage(image.id)}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="font-medium truncate">{image.file.name}</div>
                    <div>{formatFileSize(image.originalSize)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {processedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Processing Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={downloadAll} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Download All ({processedImages.length})
            </Button>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {processedImages.map((image) => (
                <div key={image.id} className="relative">
                  <img
                    src={URL.createObjectURL(image.processed!.blob)}
                    alt={image.file.name}
                    className="w-full h-24 object-cover rounded-lg border"
                  />
                  <div className="mt-2 text-xs text-muted-foreground">
                    <div className="font-medium truncate">{image.file.name}</div>
                    <div className="text-green-600">{formatFileSize(image.processed!.size)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Use WebP format for the best compression and quality ratio</li>
            <li>• Maintain aspect ratio to prevent image distortion</li>
            <li>• Use 85% quality for a good balance between size and quality</li>
            <li>• For web use, keep images under 1MB for faster loading</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkImageResizer;
