import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Upload,
  FileImage,
  Play,
  Download,
  Trash2,
  ArrowUpDown,
  Settings,
  X,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import GIF from "gif.js"; // npm install gif.js
// Make sure to copy node_modules/gif.js/dist/gif.worker.js to public/gif.worker.js

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

interface GifSettings {
  frameDelay: number;
  loopCount: number;
  quality: number;
  width: number;
  height: number;
  maintainAspectRatio: boolean;
}

const MAX_IMAGES = 20;

const GifMaker = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [settings, setSettings] = useState<GifSettings>({
    frameDelay: 500,
    loopCount: 0,
    quality: 10,
    width: 400,
    height: 300,
    maintainAspectRatio: true
  });
  const [showSettings, setShowSettings] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addImages = useCallback((files: FileList) => {
    const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select valid image files (JPG, PNG, GIF, WebP)",
        variant: "destructive"
      });
      return;
    }

    if (images.length + imageFiles.length > MAX_IMAGES) {
      toast({
        title: "Maximum images exceeded",
        description: `You can add up to ${MAX_IMAGES} images total`,
        variant: "destructive"
      });
      return;
    }

    if (images.length + imageFiles.length < 2) {
      toast({
        title: "Need more images",
        description: "Please select at least 2 images to create a GIF",
        variant: "destructive"
      });
      return;
    }

    const newImages: ImageFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + " MB"
    }));

    setImages(prev => [...prev, ...newImages]);
  }, [images, toast]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      addImages(event.target.files);
    }
    event.target.value = "";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer.files) {
      addImages(event.dataTransfer.files);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  };

  const moveImage = (id: string, dir: "up" | "down") => {
    setImages(prev => {
      const idx = prev.findIndex(img => img.id === id);
      if (idx === -1) return prev;
      const newArr = [...prev];
      if (dir === "up" && idx > 0) {
        [newArr[idx], newArr[idx - 1]] = [newArr[idx - 1], newArr[idx]];
      } else if (dir === "down" && idx < newArr.length - 1) {
        [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      }
      return newArr;
    });
  };

  const createGif = useCallback(async () => {
    if (images.length < 2) {
      toast({
        title: "Need more images",
        description: "Please add at least 2 images to create a GIF",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
    }

    try {
      const gif = new GIF({
        workers: 2,
        quality: settings.quality,
        workerScript: "/gif.worker.js",
        width: settings.width,
        height: settings.height,
        repeat: settings.loopCount // 0 for infinite, >0 for n loops
      });

      for (const image of images) {
        const imgEl = await new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = image.preview;
        });

        const canvas = document.createElement("canvas");
        canvas.width = settings.width;
        canvas.height = settings.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context unavailable");

        let drawW = settings.width;
        let drawH = settings.height;
        let offsetX = 0;
        let offsetY = 0;
        if (settings.maintainAspectRatio) {
          const imgAspect = imgEl.width / imgEl.height;
          const canvasAspect = settings.width / settings.height;
          if (imgAspect > canvasAspect) {
            drawH = settings.width / imgAspect;
            offsetY = (settings.height - drawH) / 2;
          } else {
            drawW = settings.height * imgAspect;
            offsetX = (settings.width - drawW) / 2;
          }
        }

        ctx.clearRect(0, 0, settings.width, settings.height);
        ctx.drawImage(imgEl, offsetX, offsetY, drawW, drawH);

        gif.addFrame(canvas, { delay: settings.frameDelay });
      }

      gif.on("finished", (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setGifUrl(url);
        toast({
          title: "GIF created successfully!",
          description: `Created GIF with ${images.length} frames`
        });
        setIsCreating(false);
      });

      gif.render();
    } catch (err) {
      console.error(err);
      toast({
        title: "GIF creation failed",
        description: "An error occurred while creating the GIF",
        variant: "destructive"
      });
      setIsCreating(false);
    }
  }, [images, settings, toast, gifUrl]);

  const downloadGif = () => {
    if (gifUrl) {
      const a = document.createElement("a");
      a.href = gifUrl;
      a.download = "created.gif";
      a.click();
    }
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      setGifUrl(null);
    }
  };

  const resetSettings = () => {
    setSettings({
      frameDelay: 500,
      loopCount: 0,
      quality: 10,
      width: 400,
      height: 300,
      maintainAspectRatio: true
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" /> GIF Maker
          </CardTitle>
          <CardDescription>
            Create animated GIFs from multiple images with customizable settings. Supports JPG, PNG, GIF, and WebP formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload */}
          <div 
            className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="gif-upload" className="cursor-pointer">
              <div className="text-lg font-medium mb-2">Click to upload images or drag and drop</div>
              <div className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, GIF, WebP • Min 2 images • Max {MAX_IMAGES} images
              </div>
              <Button variant="outline" size="lg">
                <FileImage className="h-4 w-4 mr-2" /> Select Images
              </Button>
            </Label>
            <Input
              id="gif-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Settings */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" /> GIF Settings
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={resetSettings}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
                  {showSettings ? "Hide" : "Show"} Settings
                </Button>
              </div>
            </div>

            {showSettings && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label>Frame Delay: {settings.frameDelay}ms</Label>
                    <Slider
                      value={[settings.frameDelay]}
                      onValueChange={([v]) => setSettings(p => ({ ...p, frameDelay: v }))}
                      min={100}
                      max={2000}
                      step={100}
                    />
                  </div>
                  <div>
                    <Label>Quality: {settings.quality} (lower = better)</Label>
                    <Slider
                      value={[settings.quality]}
                      onValueChange={([v]) => setSettings(p => ({ ...p, quality: v }))}
                      min={1}
                      max={20}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label>Loop Count: {settings.loopCount === 0 ? "Infinite" : settings.loopCount}</Label>
                    <Slider
                      value={[settings.loopCount]}
                      onValueChange={([v]) => setSettings(p => ({ ...p, loopCount: v }))}
                      min={0}
                      max={10}
                      step={1}
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Width: {settings.width}px</Label>
                    <Slider
                      value={[settings.width]}
                      onValueChange={([v]) => setSettings(p => ({ ...p, width: v }))}
                      min={100}
                      max={800}
                      step={50}
                    />
                  </div>
                  <div>
                    <Label>Height: {settings.height}px</Label>
                    <Slider
                      value={[settings.height]}
                      onValueChange={([v]) => setSettings(p => ({ ...p, height: v }))}
                      min={100}
                      max={600}
                      step={50}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="aspect-ratio"
                      checked={settings.maintainAspectRatio}
                      onCheckedChange={checked => setSettings(p => ({ ...p, maintainAspectRatio: checked }))}
                    />
                    <Label htmlFor="aspect-ratio">Maintain aspect ratio</Label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Preview */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Selected Images ({images.length})</h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={clearAll} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" /> Clear All
                  </Button>
                  <Button
                    onClick={createGif}
                    disabled={isCreating || images.length < 2}
                    className="bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating GIF...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" /> Create GIF
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                    <img src={image.preview} alt={image.name} className="w-full h-24 object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <div className="flex gap-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, "up")}
                          disabled={index === 0}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpDown className="h-3 w-3 rotate-180" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, "down")}
                          disabled={index === images.length - 1}
                          className="h-8 w-8 p-0"
                        >
                          <ArrowUpDown className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2 bg-background">
                      <div className="text-xs font-medium truncate">{image.name}</div>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        Frame {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* GIF Preview and Download */}
          {gifUrl && (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex flex-col items-center gap-4">
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 text-center">GIF Created Successfully!</h4>
                  <p className="text-sm text-green-700 dark:text-green-300 text-center">Your animated GIF is ready</p>
                </div>
                <img 
                  src={gifUrl} 
                  alt="Created GIF" 
                  className="max-w-md w-full rounded-lg shadow-md"
                />
                <Button onClick={downloadGif} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" /> Download GIF
                </Button>
              </div>
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
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Upload Images</p>
              <p className="text-sm text-muted-foreground">Select at least 2 image files (JPG, PNG, GIF, WebP)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Customize Settings</p>
              <p className="text-sm text-muted-foreground">Adjust frame delay, quality, dimensions, and aspect ratio</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Arrange & Create</p>
              <p className="text-sm text-muted-foreground">Arrange order and click "Create GIF"</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GifMaker;