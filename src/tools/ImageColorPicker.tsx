import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Palette, Copy, RotateCcw, Droplets } from "lucide-react";

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  position: { x: number; y: number };
}

const ImageColorPicker = () => {
  const [image, setImage] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<ColorInfo[]>([]);
  const [isPicking, setIsPicking] = useState(false);
  const [hoverColor, setHoverColor] = useState<ColorInfo | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const showToast = (title: string, description: string, isError = false) => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${
      isError ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`;
    toast.innerHTML = `<div class="font-semibold">${title}</div><div class="text-sm">${description}</div>`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setSelectedColors([]);
        setImageLoaded(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Setup canvas when image loads
  const setupCanvas = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;

    if (!ctx) return;

    // Set canvas dimensions to match image
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Draw image to canvas for pixel data extraction
    ctx.drawImage(img, 0, 0);
    setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (image && imageRef.current) {
      const img = imageRef.current;
      if (img.complete) {
        setupCanvas();
      } else {
        img.onload = setupCanvas;
      }
    }
  }, [image, setupCanvas]);

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  };

  const getColorAtPosition = useCallback((clientX: number, clientY: number): ColorInfo | null => {
    if (!canvasRef.current || !imageRef.current || !imageLoaded) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imageRef.current;
    if (!ctx) return null;

    // Get image bounds
    const imgRect = img.getBoundingClientRect();
    
    // Calculate position relative to image
    const x = clientX - imgRect.left;
    const y = clientY - imgRect.top;

    // Check if click is within image bounds
    if (x < 0 || y < 0 || x >= imgRect.width || y >= imgRect.height) {
      return null;
    }

    // Convert display coordinates to actual image coordinates
    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;
    
    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);

    // Ensure coordinates are within bounds
    if (actualX >= canvas.width || actualY >= canvas.height) return null;

    try {
      // Get the color data at the position
      const imageData = ctx.getImageData(actualX, actualY, 1, 1);
      const data = imageData.data;

      const r = data[0];
      const g = data[1];
      const b = data[2];
      const alpha = data[3];

      // Skip transparent pixels
      if (alpha === 0) return null;

      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const hsl = rgbToHsl(r, g, b);

      return {
        hex: hex.toUpperCase(),
        rgb: { r, g, b },
        hsl,
        position: { x: Math.round(x), y: Math.round(y) },
      };
    } catch (error) {
      console.error('Error getting color data:', error);
      return null;
    }
  }, [imageLoaded]);

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!image || !isPicking || !imageLoaded) return;

    const color = getColorAtPosition(e.clientX, e.clientY);
    if (color) {
      // Check if color already exists
      const exists = selectedColors.some(c => c.hex === color.hex);
      if (!exists) {
        setSelectedColors(prev => [...prev, color]);
        showToast("Color picked!", `Added ${color.hex} to your palette.`);
      } else {
        showToast("Color already exists", `${color.hex} is already in your palette.`);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!image || !isPicking || !imageLoaded) return;

    const color = getColorAtPosition(e.clientX, e.clientY);
    setHoverColor(color);
  };

  const handleMouseLeave = () => {
    setHoverColor(null);
  };

  const copyColorToClipboard = async (color: ColorInfo) => {
    try {
      await navigator.clipboard.writeText(color.hex);
      showToast("Color copied!", `${color.hex} copied to clipboard.`);
    } catch (error) {
      showToast("Copy failed", "Failed to copy color to clipboard.", true);
    }
  };

  const removeColor = (index: number) => {
    setSelectedColors(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllColors = () => {
    setSelectedColors([]);
  };

  const exportPalette = () => {
    if (selectedColors.length === 0) return;

    const paletteData = {
      name: "Image Color Palette",
      colors: selectedColors.map(color => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
      })),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palette.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showToast("Palette exported!", "Color palette downloaded successfully.");
  };

  const resetImage = () => {
    setImage(null);
    setSelectedColors([]);
    setHoverColor(null);
    setIsPicking(false);
    setImageLoaded(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Image Color Picker
          </CardTitle>
          <CardDescription>
            Upload an image and click on it to extract colors. Build a custom color palette from any image.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload">Upload Image</Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
          </div>

          {image && (
            <>
              <div className="flex gap-2 flex-wrap">
                <Button
                  onClick={() => setIsPicking(!isPicking)}
                  variant={isPicking ? "default" : "outline"}
                  disabled={!imageLoaded}
                >
                  <Droplets className="h-4 w-4 mr-2" />
                  {isPicking ? "Stop Picking" : "Start Picking"}
                </Button>
                <Button onClick={resetImage} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                {!imageLoaded && (
                  <div className="text-sm text-gray-500 flex items-center">
                    Loading image...
                  </div>
                )}
              </div>

              {isPicking && imageLoaded && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💡 Click anywhere on the image to pick colors. Move your mouse to preview colors.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Image</Label>
                <div
                  ref={containerRef}
                  className={`relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 ${
                    isPicking && imageLoaded ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                  onClick={handleImageClick}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Uploaded image"
                    className="max-w-full h-auto block"
                    draggable={false}
                    style={{ maxHeight: '500px' }}
                  />
                  
                  {/* Hidden canvas for color extraction */}
                  <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Color preview overlay */}
                  {hoverColor && isPicking && imageLoaded && (
                    <div
                      className="absolute pointer-events-none bg-white border border-gray-300 rounded-lg p-2 shadow-lg z-10"
                      style={{
                        left: Math.min(hoverColor.position.x + 10, containerRef.current?.clientWidth || 0 - 120),
                        top: Math.max(hoverColor.position.y - 40, 10),
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-300"
                          style={{ backgroundColor: hoverColor.hex }}
                        />
                        <span className="text-sm font-mono">{hoverColor.hex}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        RGB({hoverColor.rgb.r}, {hoverColor.rgb.g}, {hoverColor.rgb.b})
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {selectedColors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Selected Colors ({selectedColors.length})</Label>
                    <div className="flex gap-2">
                      <Button onClick={exportPalette} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export Palette
                      </Button>
                      <Button onClick={clearAllColors} variant="outline" size="sm">
                        Clear All
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {selectedColors.map((color, index) => (
                      <div
                        key={index}
                        className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <div
                            className="w-12 h-12 rounded-lg border border-gray-300 shadow-sm flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-mono font-semibold text-lg truncate">{color.hex}</div>
                            <div className="text-sm text-gray-600 truncate">
                              RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                            </div>
                          </div>
                        </div>
                        
                        <div className="space-y-1 mb-3 text-xs text-gray-500">
                          <div>HSL({color.hsl.h}°, {color.hsl.s}%, {color.hsl.l}%)</div>
                          <div>Position: ({color.position.x}, {color.position.y})</div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => copyColorToClipboard(color)}
                            size="sm"
                            variant="outline"
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button
                            onClick={() => removeColor(index)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Color palette preview */}
                  <div className="space-y-2">
                    <Label>Palette Preview</Label>
                    <div className="flex flex-wrap gap-1 p-4 bg-gray-50 rounded-lg border">
                      {selectedColors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded border border-gray-300 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                          onClick={() => copyColorToClipboard(color)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>1. Upload an image (JPG, PNG, WebP, GIF)</p>
          <p>2. Wait for the image to load completely</p>
          <p>3. Click "Start Picking" to enable color selection</p>
          <p>4. Click anywhere on the image to pick colors</p>
          <p>5. Hover over the image to preview colors before picking</p>
          <p>6. Build your custom color palette (duplicates are automatically filtered)</p>
          <p>7. Copy individual colors or export the entire palette as JSON</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Formats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-gray-600">
          <p>• <Badge variant="secondary">HEX</Badge> - Web-friendly color codes (e.g., #FF5733)</p>
          <p>• <Badge variant="secondary">RGB</Badge> - Red, Green, Blue values (0-255)</p>
          <p>• <Badge variant="secondary">HSL</Badge> - Hue, Saturation, Lightness values</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageColorPicker;