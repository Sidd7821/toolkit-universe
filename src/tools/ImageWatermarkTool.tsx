import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  FileImage, 
  Download, 
  Trash2, 
  Type,
  Image as ImageIcon,
  Settings,
  Eye,
  EyeOff,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WatermarkSettings {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  position: 'top-left' | 'top-center' | 'top-right' | 'center-left' | 'center' | 'center-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  rotation: number;
  showWatermark: boolean;
}

const ImageWatermarkTool = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [watermarkedImage, setWatermarkedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<WatermarkSettings>({
    text: 'Watermark',
    fontSize: 48,
    fontFamily: 'Arial',
    color: '#ffffff',
    opacity: 0.7,
    position: 'bottom-right',
    rotation: 0,
    showWatermark: true
  });
  const [showSettings, setShowSettings] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fontFamilies = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS'
  ];

  const positions = [
    { value: 'top-left', label: 'Top Left' },
    { value: 'top-center', label: 'Top Center' },
    { value: 'top-right', label: 'Top Right' },
    { value: 'center-left', label: 'Center Left' },
    { value: 'center', label: 'Center' },
    { value: 'center-right', label: 'Center Right' },
    { value: 'bottom-left', label: 'Bottom Left' },
    { value: 'bottom-center', label: 'Bottom Center' },
    { value: 'bottom-right', label: 'Bottom Right' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    setSelectedImage(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setWatermarkedImage(null);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const getPositionCoordinates = (position: string, canvasWidth: number, canvasHeight: number, textWidth: number, textHeight: number) => {
    const padding = 20;
    
    switch (position) {
      case 'top-left':
        return { x: padding, y: padding + textHeight };
      case 'top-center':
        return { x: (canvasWidth - textWidth) / 2, y: padding + textHeight };
      case 'top-right':
        return { x: canvasWidth - textWidth - padding, y: padding + textHeight };
      case 'center-left':
        return { x: padding, y: (canvasHeight + textHeight) / 2 };
      case 'center':
        return { x: (canvasWidth - textWidth) / 2, y: (canvasHeight + textHeight) / 2 };
      case 'center-right':
        return { x: canvasWidth - textWidth - padding, y: (canvasHeight + textHeight) / 2 };
      case 'bottom-left':
        return { x: padding, y: canvasHeight - padding };
      case 'bottom-center':
        return { x: (canvasWidth - textWidth) / 2, y: canvasHeight - padding };
      case 'bottom-right':
        return { x: canvasWidth - textWidth - padding, y: canvasHeight - padding };
      default:
        return { x: padding, y: padding + textHeight };
    }
  };

  const addWatermark = useCallback(async () => {
    if (!selectedImage || !imagePreview) {
      toast({
        title: "No image selected",
        description: "Please select an image first",
        variant: "destructive",
      });
      return;
    }

    if (!settings.showWatermark || !settings.text.trim()) {
      toast({
        title: "No watermark",
        description: "Please enter watermark text and ensure it's visible",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imagePreview;
      });

      // Set canvas size to match image
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      if (settings.showWatermark && settings.text.trim()) {
        // Set font properties
        ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;
        ctx.fillStyle = settings.color;
        ctx.globalAlpha = settings.opacity;

        // Measure text dimensions
        const textMetrics = ctx.measureText(settings.text);
        const textWidth = textMetrics.width;
        const textHeight = settings.fontSize;

        // Get position coordinates
        const coords = getPositionCoordinates(settings.position, canvas.width, canvas.height, textWidth, textHeight);

        // Save context state
        ctx.save();

        // Move to center of text for rotation
        ctx.translate(coords.x + textWidth / 2, coords.y - textHeight / 2);
        ctx.rotate((settings.rotation * Math.PI) / 180);

        // Draw text
        ctx.fillText(settings.text, -textWidth / 2, textHeight / 2);

        // Restore context state
        ctx.restore();
      }

      // Convert to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png', 0.9);
      });

      // Create URL for preview and download
      const url = URL.createObjectURL(blob);
      setWatermarkedImage(url);

      toast({
        title: "Watermark added successfully!",
        description: "Your watermarked image is ready",
      });

    } catch (error) {
      console.error('Watermark error:', error);
      toast({
        title: "Watermark failed",
        description: "An error occurred while adding the watermark",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, imagePreview, settings, toast]);

  const downloadImage = () => {
    if (watermarkedImage) {
      const link = document.createElement('a');
      link.href = watermarkedImage;
      link.download = `watermarked-${selectedImage?.name || 'image.png'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    if (watermarkedImage) {
      URL.revokeObjectURL(watermarkedImage);
    }
    setSelectedImage(null);
    setImagePreview(null);
    setWatermarkedImage(null);
  };

  const resetSettings = () => {
    setSettings({
      text: 'Watermark',
      fontSize: 48,
      fontFamily: 'Arial',
      color: '#ffffff',
      opacity: 0.7,
      position: 'bottom-right',
      rotation: 0,
      showWatermark: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Type className="h-5 w-5" />
            Image Watermark Tool
          </CardTitle>
          <CardDescription>
            Add custom text watermarks to your images with full control over positioning, styling, and appearance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="watermark-upload" className="cursor-pointer">
              <div className="text-lg font-medium mb-2">
                Click to upload image or drag and drop
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, GIF, WebP • Max 10MB
              </div>
              <Button variant="outline" size="lg">
                <FileImage className="h-4 w-4 mr-2" />
                Select Image
              </Button>
            </Label>
            <Input
              id="watermark-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Settings Panel */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Watermark Settings
              </h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSettings}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(!showSettings)}
                >
                  {showSettings ? 'Hide' : 'Show'} Settings
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Watermark Text</Label>
                    <Input
                      value={settings.text}
                      onChange={(e) => setSettings(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter watermark text..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Font Family</Label>
                    <Select
                      value={settings.fontFamily}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, fontFamily: value }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {fontFamilies.map((font) => (
                          <SelectItem key={font} value={font}>
                            {font}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, fontSize: value }))}
                      min={12}
                      max={120}
                      step={2}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={settings.color}
                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.color}
                        onChange={(e) => setSettings(prev => ({ ...prev, color: e.target.value }))}
                        placeholder="#ffffff"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Position</Label>
                    <Select
                      value={settings.position}
                      onValueChange={(value) => setSettings(prev => ({ ...prev, position: value as any }))}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((pos) => (
                          <SelectItem key={pos.value} value={pos.value}>
                            {pos.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Rotation: {settings.rotation}°</Label>
                    <Slider
                      value={[settings.rotation]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, rotation: value }))}
                      min={-180}
                      max={180}
                      step={5}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Opacity: {Math.round(settings.opacity * 100)}%</Label>
                    <Slider
                      value={[settings.opacity]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, opacity: value }))}
                      min={0.1}
                      max={1}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-watermark"
                      checked={settings.showWatermark}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showWatermark: checked }))}
                    />
                    <Label htmlFor="show-watermark">Show watermark</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Image Preview and Actions */}
          {imagePreview && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Image Preview</h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Image
                  </Button>
                  <Button
                    onClick={addWatermark}
                    disabled={isProcessing || !settings.showWatermark || !settings.text.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Type className="h-4 w-4 mr-2" />
                        Add Watermark
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Original Image */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Original Image</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Original"
                      className="w-full h-auto max-h-96 object-contain"
                    />
                  </div>
                </div>

                {/* Watermarked Image */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Watermarked Image</Label>
                  <div className="border rounded-lg overflow-hidden min-h-96 flex items-center justify-center bg-muted/20">
                    {watermarkedImage ? (
                      <img
                        src={watermarkedImage}
                        alt="Watermarked"
                        className="w-full h-auto max-h-96 object-contain"
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <ImageIcon className="h-16 w-16 mx-auto mb-2 opacity-50" />
                        <p>Watermarked image will appear here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Download Button */}
              {watermarkedImage && (
                <div className="flex justify-center">
                  <Button onClick={downloadImage} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Download Watermarked Image
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Upload Image</p>
              <p className="text-sm text-muted-foreground">
                Select an image file from your device (JPG, PNG, GIF, WebP)
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Customize Watermark</p>
              <p className="text-sm text-muted-foreground">
                Adjust text, font, color, position, rotation, and opacity
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Apply & Download</p>
              <p className="text-sm text-muted-foreground">
                Click "Add Watermark" and download your watermarked image
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageWatermarkTool;
