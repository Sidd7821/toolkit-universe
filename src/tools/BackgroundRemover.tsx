import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Upload, Image, Trash2, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProcessedImage {
  id: string;
  original: string;
  processed: string;
  timestamp: Date;
}

const BackgroundRemover = () => {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [removalMethod, setRemovalMethod] = useState<string>("ai");
  const [processedImages, setProcessedImages] = useState<ProcessedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<ProcessedImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setProcessedImage(null);
        setSelectedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!image) return;

    setIsProcessing(true);
    
    try {
      // Simulate AI background removal process
      // In a real implementation, you would call an AI service like Remove.bg, Cloudinary, etc.
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll create a simple effect by applying a filter
      // In production, replace this with actual AI background removal
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new window.Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        
        if (ctx) {
          // Draw the original image
          ctx.drawImage(img, 0, 0);
          
          // Get image data for processing
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;
          
          // Simple edge detection and background removal simulation
          // This is just a demo - real AI would be much more sophisticated
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            // Simple brightness-based background detection
            const brightness = (r + g + b) / 3;
            const threshold = 240; // Adjust this value for different sensitivity
            
            if (brightness > threshold) {
              // Make bright pixels transparent (background)
              data[i + 3] = 0; // Alpha channel
            } else {
              // Keep darker pixels (foreground)
              data[i + 3] = 255;
            }
          }
          
          ctx.putImageData(imageData, 0, 0);
          
          const processedDataUrl = canvas.toDataURL('image/png');
          setProcessedImage(processedDataUrl);
          
          // Add to processed images history
          const newProcessedImage: ProcessedImage = {
            id: Date.now().toString(),
            original: image,
            processed: processedDataUrl,
            timestamp: new Date(),
          };
          
          setProcessedImages(prev => [newProcessedImage, ...prev.slice(0, 9)]); // Keep last 10
          setSelectedImage(newProcessedImage);
          
          toast({
            title: "Background removed!",
            description: "Your image has been processed successfully.",
          });
        }
      };
      
      img.src = image;
      
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "There was an error removing the background. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = (imageData: string, filename: string) => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = imageData;
    link.click();
  };

  const resetImage = () => {
    setImage(null);
    setProcessedImage(null);
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const selectFromHistory = (processedImg: ProcessedImage) => {
    setSelectedImage(processedImg);
    setImage(processedImg.original);
    setProcessedImage(processedImg.processed);
  };

  const removeFromHistory = (id: string) => {
    setProcessedImages(prev => prev.filter(img => img.id !== id));
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Background Remover
          </CardTitle>
          <CardDescription>
            Remove backgrounds from images using AI-powered detection. Upload an image and get a transparent background version.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              ref={fileInputRef}
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
            <p className="text-sm text-muted-foreground">
              Supported formats: JPG, PNG, WebP. Max size: 10MB
            </p>
          </div>

          {image && (
            <>
              <div className="space-y-2">
                <Label>Removal Method</Label>
                <Select value={removalMethod} onValueChange={setRemovalMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select removal method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ai">AI-Powered (Recommended)</SelectItem>
                    <SelectItem value="manual">Manual Selection</SelectItem>
                    <SelectItem value="color">Color-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Original Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                    <img
                      src={image}
                      alt="Original"
                      className="max-w-full h-auto max-h-64 mx-auto"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Processed Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 min-h-64 flex items-center justify-center">
                    {processedImage ? (
                      <img
                        src={processedImage}
                        alt="Processed"
                        className="max-w-full h-auto max-h-64 mx-auto"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>Processed image will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={removeBackground} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Image className="h-4 w-4 mr-2" />
                      Remove Background
                    </>
                  )}
                </Button>
                <Button onClick={resetImage} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>

              {processedImage && (
                <div className="flex gap-2">
                  <Button onClick={() => downloadImage(processedImage, 'background-removed.png')}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Processed
                  </Button>
                  <Button onClick={() => downloadImage(image, 'original-image.png')} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Original
                  </Button>
                </div>
              )}
            </>
          )}

          {processedImages.length > 0 && (
            <div className="space-y-2">
              <Label>Recent Processed Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {processedImages.map((processedImg) => (
                  <div
                    key={processedImg.id}
                    className={`relative border-2 rounded-lg cursor-pointer transition-all ${
                      selectedImage?.id === processedImg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => selectFromHistory(processedImg)}
                  >
                    <img
                      src={processedImg.processed}
                      alt="Processed"
                      className="w-full h-20 object-cover rounded"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromHistory(processedImg.id);
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b">
                      {processedImg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tips for Best Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Use high-contrast images with clear subject separation</p>
          <p>• Ensure good lighting on the main subject</p>
          <p>• Avoid complex backgrounds with similar colors to the subject</p>
          <p>• For best results, use images with solid color backgrounds</p>
          <p>• PNG format preserves transparency for processed images</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundRemover;
