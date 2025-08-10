import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Image, 
  Copy, 
  Download,
  RotateCcw,
  RefreshCw,
  Settings,
  Eye,
  EyeOff,
  Palette,
  Crop,
  Shuffle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ImageConfig {
  width: number;
  height: number;
  blur: number;
  grayscale: boolean;
  random: boolean;
  seed: string;
}

const LoremPicsumImageGenerator = () => {
  const [config, setConfig] = useState<ImageConfig>({
    width: 800,
    height: 600,
    blur: 0,
    grayscale: false,
    random: false,
    seed: ""
  });
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const presetSizes = [
    { label: "HD (1280x720)", width: 1280, height: 720 },
    { label: "Full HD (1920x1080)", width: 1920, height: 1080 },
    { label: "4K (3840x2160)", width: 3840, height: 2160 },
    { label: "Square (800x800)", width: 800, height: 800 },
    { label: "Portrait (600x800)", width: 600, height: 800 },
    { label: "Landscape (1200x800)", width: 1200, height: 800 },
    { label: "Mobile (375x667)", width: 375, height: 667 },
    { label: "Tablet (768x1024)", width: 768, height: 1024 },
    { label: "Desktop (1440x900)", width: 1440, height: 900 },
    { label: "Banner (1200x300)", width: 1200, height: 300 }
  ];

  const generateImageUrl = (config: ImageConfig): string => {
    let url = `https://picsum.photos/${config.width}/${config.height}`;
    
    if (config.seed && !config.random) {
      url += `?random=${config.seed}`;
    } else if (config.random) {
      url += `?random=${Date.now()}`;
    }
    
    if (config.blur > 0) {
      url += `${url.includes('?') ? '&' : '?'}blur=${config.blur}`;
    }
    
    if (config.grayscale) {
      url += `${url.includes('?') ? '&' : '?'}grayscale`;
    }
    
    return url;
  };

  const generateImage = async () => {
    if (config.width < 1 || config.height < 1) {
      toast({
        title: "Invalid dimensions",
        description: "Width and height must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (config.width > 5000 || config.height > 5000) {
      toast({
        title: "Dimensions too large",
        description: "Maximum dimensions are 5000x5000 pixels",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const imageUrl = generateImageUrl(config);
      
      // Preload the image to ensure it's valid
      const img = new Image();
      img.onload = () => {
        setGeneratedImages(prev => [imageUrl, ...prev.slice(0, 9)]); // Keep last 10
        setIsGenerating(false);
        toast({
          title: "Image generated",
          description: `${config.width}x${config.height} placeholder image created`,
        });
      };
      img.onerror = () => {
        setIsGenerating(false);
        toast({
          title: "Generation failed",
          description: "Failed to generate image. Please try again.",
          variant: "destructive"
        });
      };
      img.src = imageUrl;
    } catch (error) {
      setIsGenerating(false);
      toast({
        title: "Error",
        description: "An error occurred while generating the image",
        variant: "destructive"
      });
    }
  };

  const generateMultiple = async (count: number) => {
    if (count < 1 || count > 10) {
      toast({
        title: "Invalid count",
        description: "Please generate between 1 and 10 images",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    const newImages: string[] = [];
    
    try {
      for (let i = 0; i < count; i++) {
        const imageUrl = generateImageUrl({
          ...config,
          random: true // Force random for multiple images
        });
        
        // Preload each image
        await new Promise<void>((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            newImages.push(imageUrl);
            resolve();
          };
          img.onerror = reject;
          img.src = imageUrl;
        });
      }
      
      setGeneratedImages(prev => [...newImages, ...prev.slice(0, 10 - newImages.length)]);
      toast({
        title: "Multiple images generated",
        description: `Generated ${count} placeholder images`,
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate some images. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const applyPreset = (preset: { width: number; height: number }) => {
    setConfig(prev => ({
      ...prev,
      width: preset.width,
      height: preset.height
    }));
    toast({
      title: "Preset applied",
      description: `Applied ${preset.label}`,
    });
  };

  const copyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL copied",
      description: "Image URL copied to clipboard",
    });
  };

  const downloadImage = async (url: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `placeholder-${config.width}x${config.height}.jpg`;
      link.click();
      URL.revokeObjectURL(downloadUrl);
      
      toast({
        title: "Download started",
        description: "Image download has begun",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download image. Please try again.",
        variant: "destructive"
      });
    }
  };

  const clearAll = () => {
    setGeneratedImages([]);
    toast({
      title: "Cleared",
      description: "All generated images have been cleared",
    });
  };

  const randomizeSeed = () => {
    const newSeed = Math.random().toString(36).substring(2, 15);
    setConfig(prev => ({ ...prev, seed: newSeed, random: false }));
    toast({
      title: "Seed randomized",
      description: "New random seed generated",
    });
  };

  return (
    <div className="space-y-6">
      {/* Configuration Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Image Configuration
          </CardTitle>
          <CardDescription>
            Generate placeholder images with custom dimensions and effects
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width (pixels)</Label>
              <Input
                type="number"
                value={config.width}
                onChange={(e) => setConfig(prev => ({ ...prev, width: parseInt(e.target.value) || 800 }))}
                min="1"
                max="5000"
                placeholder="800"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Height (pixels)</Label>
              <Input
                type="number"
                value={config.height}
                onChange={(e) => setConfig(prev => ({ ...prev, height: parseInt(e.target.value) || 600 }))}
                min="1"
                max="5000"
                placeholder="600"
              />
            </div>
          </div>

          {/* Preset Sizes */}
          <div>
            <Label className="text-sm font-medium">Quick Presets</Label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mt-2">
              {presetSizes.map((preset) => (
                <Button
                  key={preset.label}
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(preset)}
                  className="text-xs h-auto py-2"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showAdvanced ? "Hide" : "Show"} Advanced Options
            </Button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Blur Effect (0-10)</Label>
                    <Slider
                      value={[config.blur]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, blur: value }))}
                      max={10}
                      min={0}
                      step={1}
                      className="w-full"
                    />
                    <span className="text-sm text-muted-foreground">{config.blur}</span>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Seed (for consistent images)</Label>
                    <div className="flex gap-2">
                      <Input
                        value={config.seed}
                        onChange={(e) => setConfig(prev => ({ ...prev, seed: e.target.value, random: false }))}
                        placeholder="Enter seed or leave empty"
                        disabled={config.random}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={randomizeSeed}
                        disabled={config.random}
                      >
                        <Shuffle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="grayscale"
                      checked={config.grayscale}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, grayscale: checked }))}
                    />
                    <Label htmlFor="grayscale">Grayscale</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="random"
                      checked={config.random}
                      onCheckedChange={(checked) => setConfig(prev => ({ ...prev, random: checked }))}
                    />
                    <Label htmlFor="random">Random (ignore seed)</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={generateImage} 
              disabled={isGenerating}
              className="flex-1"
            >
              {isGenerating ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Image className="h-4 w-4 mr-2" />
              )}
              Generate Image
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => generateMultiple(5)}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate 5
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => generateMultiple(10)}
              disabled={isGenerating}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate 10
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Images */}
      {generatedImages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Generated Images ({generatedImages.length})
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={clearAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generatedImages.map((imageUrl, index) => (
                <div key={index} className="border rounded-lg overflow-hidden">
                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Placeholder ${config.width}x${config.height}`}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => copyImageUrl(imageUrl)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy URL
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => downloadImage(imageUrl)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono">{config.width}×{config.height}</span>
                      <Badge variant="outline" className="text-xs">
                        {index + 1}
                      </Badge>
                    </div>
                    {config.blur > 0 && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Blur: {config.blur}
                      </Badge>
                    )}
                    {config.grayscale && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Grayscale
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            About Lorem Picsum
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lorem Picsum provides beautiful, high-quality placeholder images for your projects. 
            Each image is unique and perfect for mockups, designs, and development.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• High-quality random images</li>
                <li>• Custom dimensions</li>
                <li>• Blur and grayscale effects</li>
                <li>• Consistent images with seeds</li>
                <li>• Free to use</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Use Cases:</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Website mockups</li>
                <li>• Design prototypes</li>
                <li>• Development testing</li>
                <li>• Content placeholders</li>
                <li>• UI/UX design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoremPicsumImageGenerator;
