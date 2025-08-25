import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Upload, 
  Download, 
  Smartphone, 
  Monitor,
  Apple,
  Smartphone as Android,
  Image,
  Settings,
  CheckCircle,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface IconSize {
  name: string;
  width: number;
  height: number;
  platform: 'ios' | 'android' | 'web';
  description: string;
}

const AppIconResizer = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedIcons, setProcessedIcons] = useState<{ size: string; url: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const iconSizes: IconSize[] = [
    // iOS Sizes
    { name: "iOS App Store", width: 1024, height: 1024, platform: 'ios', description: "App Store icon" },
    { name: "iOS iPhone", width: 180, height: 180, platform: 'ios', description: "iPhone app icon" },
    { name: "iOS iPad", width: 167, height: 167, platform: 'ios', description: "iPad app icon" },
    { name: "iOS Settings", width: 87, height: 87, platform: 'ios', description: "Settings icon" },
    { name: "iOS Spotlight", width: 120, height: 120, platform: 'ios', description: "Spotlight search" },
    { name: "iOS Notification", width: 40, height: 40, platform: 'ios', description: "Notification icon" },
    
    // Android Sizes
    { name: "Android Play Store", width: 512, height: 512, platform: 'android', description: "Play Store icon" },
    { name: "Android Adaptive", width: 108, height: 108, platform: 'android', description: "Adaptive icon" },
    { name: "Android Launcher", width: 192, height: 192, platform: 'android', description: "Launcher icon" },
    { name: "Android Notification", width: 24, height: 24, platform: 'android', description: "Notification icon" },
    { name: "Android Action Bar", width: 32, height: 32, platform: 'android', description: "Action bar icon" },
    
    // Web Sizes
    { name: "Web Favicon", width: 32, height: 32, platform: 'web', description: "Website favicon" },
    { name: "Web Touch Icon", width: 180, height: 180, platform: 'web', description: "Touch icon" },
    { name: "Web Apple Touch", width: 152, height: 152, platform: 'web', description: "Apple touch icon" },
    { name: "Web Manifest", width: 512, height: 512, platform: 'web', description: "PWA manifest icon" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file (PNG, JPG, SVG)",
          variant: "destructive"
        });
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      toast({
        title: "File selected",
        description: `${file.name} has been uploaded successfully`,
      });
    }
  };

  const handleSizeToggle = (sizeName: string) => {
    setSelectedSizes(prev => 
      prev.includes(sizeName) 
        ? prev.filter(size => size !== sizeName)
        : [...prev, sizeName]
    );
  };

  const processIcons = async () => {
    if (!selectedFile || selectedSizes.length === 0) {
      toast({
        title: "Missing requirements",
        description: "Please select a file and at least one icon size",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processed = selectedSizes.map(sizeName => {
        const size = iconSizes.find(s => s.name === sizeName);
        return {
          size: sizeName,
          url: previewUrl // In real implementation, this would be the resized image
        };
      });
      
      setProcessedIcons(processed);
      toast({
        title: "Icons processed",
        description: `${processed.length} icons have been generated successfully`,
      });
    } catch (error) {
      toast({
        title: "Processing failed",
        description: "An error occurred while processing the icons",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadIcon = (icon: { size: string; url: string }) => {
    const link = document.createElement('a');
    link.href = icon.url;
    link.download = `icon-${icon.size.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAll = () => {
    processedIcons.forEach(icon => {
      setTimeout(() => downloadIcon(icon), 100);
    });
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'ios': return <Apple className="w-4 h-4" />;
      case 'android': return <Android className="w-4 h-4" />;
      case 'web': return <Monitor className="w-4 h-4" />;
      default: return <Image className="w-4 h-4" />;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
    
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Icon
            </CardTitle>
            <CardDescription>
              Upload a high-resolution image (1024x1024 recommended)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="mb-4"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose Image
              </Button>
              <p className="text-sm text-muted-foreground">
                PNG, JPG, or SVG files up to 10MB
              </p>
            </div>

            {previewUrl && (
              <div className="text-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-32 h-32 mx-auto rounded-lg border"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  {selectedFile?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Icon Sizes Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Select Icon Sizes
            </CardTitle>
            <CardDescription>
              Choose which icon sizes to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {iconSizes.map((size) => (
                <div
                  key={size.name}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedSizes.includes(size.name)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSizeToggle(size.name)}
                >
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(size.platform)}
                    <div>
                      <p className="font-medium">{size.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {size.width}×{size.height}px • {size.description}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">
                    {size.width}×{size.height}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Process Button */}
      <div className="mt-6 text-center">
        <Button
          onClick={processIcons}
          disabled={!selectedFile || selectedSizes.length === 0 || isProcessing}
          size="lg"
          className="px-8"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Processing...
            </>
          ) : (
            <>
              <Image className="w-4 h-4 mr-2" />
              Generate Icons ({selectedSizes.length})
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      {processedIcons.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Generated Icons
            </CardTitle>
            <CardDescription>
              Your icons have been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {processedIcons.map((icon) => (
                <div key={icon.size} className="text-center">
                  <div className="relative group">
                    <img
                      src={icon.url}
                      alt={icon.size}
                      className="w-16 h-16 mx-auto rounded-lg border"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => downloadIcon(icon)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-xs mt-2 font-medium">{icon.size}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button onClick={downloadAll} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download All Icons
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            Tips for Best Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Image Requirements:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Use square images (1:1 aspect ratio)</li>
                <li>• Minimum 1024×1024 pixels for best quality</li>
                <li>• PNG format recommended for transparency</li>
                <li>• Keep important elements within safe area</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Platform Guidelines:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• iOS: Simple, recognizable designs</li>
                <li>• Android: Material Design principles</li>
                <li>• Web: Clear at small sizes</li>
                <li>• Test icons at actual display sizes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppIconResizer;
