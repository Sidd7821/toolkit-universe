import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Palette,
  Copy,
  Download,
  RotateCcw,
  RefreshCw,
  Settings,
  EyeDropper,
  Image as ImageIcon,
  Shuffle,
  Plus,
  Trash2,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Color {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  name?: string;
}

interface ColorScheme {
  name: string;
  colors: Color[];
}

const ColorPaletteGenerator = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [schemes, setSchemes] = useState<ColorScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<string>("");
  const [schemeName, setSchemeName] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(50);
  const [lightness, setLightness] = useState(50);
  const [paletteSize, setPaletteSize] = useState(5);
  const [harmonyType, setHarmonyType] = useState("analogous");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedColors, setExtractedColors] = useState<Color[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const harmonyTypes = [
    { value: "analogous", label: "Analogous" },
    { value: "monochromatic", label: "Monochromatic" },
    { value: "triadic", label: "Triadic" },
    { value: "complementary", label: "Complementary" },
    { value: "split-complementary", label: "Split Complementary" },
    { value: "square", label: "Square" },
    { value: "tetradic", label: "Tetradic" }
  ];

  const predefinedSchemes = [
    {
      name: "Sunset",
      colors: [
        { hex: "#FF6B6B", rgb: { r: 255, g: 107, b: 107 }, hsl: { h: 0, s: 100, l: 71 } },
        { hex: "#FFE66D", rgb: { r: 255, g: 230, b: 109 }, hsl: { h: 56, s: 100, l: 71 } },
        { hex: "#4ECDC4", rgb: { r: 78, g: 205, b: 196 }, hsl: { h: 175, s: 53, l: 55 } },
        { hex: "#45B7D1", rgb: { r: 69, g: 183, b: 209 }, hsl: { h: 194, s: 58, l: 55 } },
        { hex: "#96CEB4", rgb: { r: 150, g: 206, b: 180 }, hsl: { h: 150, s: 39, l: 70 } }
      ]
    },
    {
      name: "Ocean",
      colors: [
        { hex: "#1E3A8A", rgb: { r: 30, g: 58, b: 138 }, hsl: { h: 221, s: 64, l: 33 } },
        { hex: "#3B82F6", rgb: { r: 59, g: 130, b: 246 }, hsl: { h: 217, s: 91, l: 60 } },
        { hex: "#60A5FA", rgb: { r: 96, g: 165, b: 250 }, hsl: { h: 213, s: 93, l: 68 } },
        { hex: "#93C5FD", rgb: { r: 147, g: 197, b: 253 }, hsl: { h: 210, s: 96, l: 78 } },
        { hex: "#DBEAFE", rgb: { r: 219, g: 234, b: 254 }, hsl: { h: 214, s: 100, l: 93 } }
      ]
    },
    {
      name: "Forest",
      colors: [
        { hex: "#064E3B", rgb: { r: 6, g: 78, b: 59 }, hsl: { h: 160, s: 86, l: 16 } },
        { hex: "#059669", rgb: { r: 5, g: 150, b: 105 }, hsl: { h: 160, s: 84, l: 30 } },
        { hex: "#10B981", rgb: { r: 16, g: 185, b: 129 }, hsl: { h: 160, s: 84, l: 39 } },
        { hex: "#34D399", rgb: { r: 52, g: 211, b: 153 }, hsl: { h: 160, s: 84, l: 52 } },
        { hex: "#6EE7B7", rgb: { r: 110, g: 231, b: 183 }, hsl: { h: 160, s: 84, l: 67 } }
      ]
    }
  ];

  useEffect(() => {
    setSchemes(predefinedSchemes);
  }, []);

  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToHex = (h: number, s: number, l: number): string => {
    h /= 360;
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 1) {
      r = c; g = x; b = 0;
    } else if (1 <= h && h < 2) {
      r = x; g = c; b = 0;
    } else if (2 <= h && h < 3) {
      r = 0; g = c; b = x;
    } else if (3 <= h && h < 4) {
      r = 0; g = x; b = c;
    } else if (4 <= h && h < 5) {
      r = x; g = 0; b = c;
    } else if (5 <= h && h <= 6) {
      r = c; g = 0; b = x;
    }

    const rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
    const gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
    const bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');

    return `#${rHex}${gHex}${bHex}`;
  };

  const generateHarmoniousPalette = () => {
    const newColors: Color[] = [];
    const baseHue = hue;
    const baseSaturation = saturation;
    const baseLightness = lightness;

    switch (harmonyType) {
      case "analogous":
        for (let i = 0; i < paletteSize; i++) {
          const newHue = (baseHue + i * 30) % 360;
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;

      case "monochromatic":
        for (let i = 0; i < paletteSize; i++) {
          const newLightness = Math.max(10, Math.min(90, baseLightness + (i - Math.floor(paletteSize / 2)) * 15));
          const hex = hslToHex(baseHue, baseSaturation, newLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: baseHue, s: baseSaturation, l: newLightness }
          });
        }
        break;

      case "triadic":
        for (let i = 0; i < paletteSize; i++) {
          const newHue = (baseHue + i * 120) % 360;
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;

      case "complementary":
        for (let i = 0; i < paletteSize; i++) {
          const newHue = i % 2 === 0 ? baseHue : (baseHue + 180) % 360;
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;

      case "split-complementary":
        for (let i = 0; i < paletteSize; i++) {
          let newHue;
          if (i === 0) newHue = baseHue;
          else if (i % 2 === 1) newHue = (baseHue + 150) % 360;
          else newHue = (baseHue + 210) % 360;
          
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;

      case "square":
        for (let i = 0; i < paletteSize; i++) {
          const newHue = (baseHue + i * 90) % 360;
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;

      case "tetradic":
        for (let i = 0; i < paletteSize; i++) {
          const newHue = (baseHue + i * 60) % 360;
          const hex = hslToHex(newHue, baseSaturation, baseLightness);
          const rgb = hexToRgb(hex);
          newColors.push({
            hex,
            rgb,
            hsl: { h: newHue, s: baseSaturation, l: baseLightness }
          });
        }
        break;
    }

    setColors(newColors);
    toast({
      title: "Palette generated",
      description: `${harmonyType} color palette created with ${paletteSize} colors`,
    });
  };

  const generateRandomPalette = () => {
    const newColors: Color[] = [];
    for (let i = 0; i < paletteSize; i++) {
      const h = Math.floor(Math.random() * 360);
      const s = Math.floor(Math.random() * 40) + 30; // 30-70%
      const l = Math.floor(Math.random() * 40) + 30; // 30-70%
      
      const hex = hslToHex(h, s, l);
      const rgb = hexToRgb(hex);
      newColors.push({
        hex,
        rgb,
        hsl: { h, s, l }
      });
    }
    setColors(newColors);
    toast({
      title: "Random palette generated",
      description: `${paletteSize} random colors created`,
    });
  };

  const addCustomColor = () => {
    const hex = hslToHex(hue, saturation, lightness);
    const rgb = hexToRgb(hex);
    const newColor: Color = {
      hex,
      rgb,
      hsl: { h: hue, s: saturation, l: lightness }
    };
    setColors(prev => [...prev, newColor]);
    toast({
      title: "Color added",
      description: "Custom color added to palette",
    });
  };

  const removeColor = (index: number) => {
    setColors(prev => prev.filter((_, i) => i !== index));
    toast({
      title: "Color removed",
      description: "Color removed from palette",
    });
  };

  const saveScheme = () => {
    if (!schemeName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for the color scheme",
        variant: "destructive"
      });
      return;
    }

    if (colors.length === 0) {
      toast({
        title: "No colors",
        description: "Please add some colors before saving",
        variant: "destructive"
      });
      return;
    }

    const newScheme: ColorScheme = {
      name: schemeName,
      colors: [...colors]
    };

    setSchemes(prev => [...prev, newScheme]);
    setSchemeName("");
    toast({
      title: "Scheme saved",
      description: `"${schemeName}" color scheme saved`,
    });
  };

  const loadScheme = (schemeName: string) => {
    const scheme = schemes.find(s => s.name === schemeName);
    if (scheme) {
      setColors([...scheme.colors]);
      toast({
        title: "Scheme loaded",
        description: `"${schemeName}" color scheme loaded`,
      });
    }
  };

  const deleteScheme = (schemeName: string) => {
    setSchemes(prev => prev.filter(s => s.name !== schemeName));
    toast({
      title: "Scheme deleted",
      description: `"${schemeName}" color scheme deleted`,
    });
  };

  const copyColor = (color: Color) => {
    navigator.clipboard.writeText(color.hex);
    toast({
      title: "Color copied",
      description: `${color.hex} copied to clipboard`,
    });
  };

  const copyPalette = () => {
    const colorList = colors.map(c => c.hex).join('\n');
    navigator.clipboard.writeText(colorList);
    toast({
      title: "Palette copied",
      description: "All colors copied to clipboard",
    });
  };

  const downloadPalette = () => {
    const colorData = colors.map(color => ({
      hex: color.hex,
      rgb: color.rgb,
      hsl: color.hsl
    }));

    const blob = new Blob([JSON.stringify(colorData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'color-palette.json';
    link.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Palette downloaded",
      description: "Color palette saved as JSON file",
    });
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      extractColorsFromImage(file);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive"
      });
    }
  };

  const extractColorsFromImage = (file: File) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
      if (!imageData) return;

      const data = imageData.data;
      const colorMap = new Map<string, number>();

      // Sample pixels and count colors
      for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(Number);
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          return {
            hex,
            rgb: { r, g, b },
            hsl: rgbToHsl(r, g, b)
          };
        });

      setExtractedColors(sortedColors);
      toast({
        title: "Colors extracted",
        description: `${sortedColors.length} colors extracted from image`,
      });
    };

    img.src = URL.createObjectURL(file);
  };

  const clearAll = () => {
    setColors([]);
    setExtractedColors([]);
    setImageFile(null);
    toast({
      title: "Cleared",
      description: "All colors and images have been cleared",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="schemes">Schemes</TabsTrigger>
          <TabsTrigger value="extractor">Extractor</TabsTrigger>
          <TabsTrigger value="tools">Tools</TabsTrigger>
        </TabsList>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          {/* Color Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Color Controls
              </CardTitle>
              <CardDescription>
                Adjust base color and generate harmonious palettes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Color Preview */}
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-lg border-2 border-gray-300"
                  style={{ backgroundColor: hslToHex(hue, saturation, lightness) }}
                />
                <div className="space-y-2">
                  <div className="text-sm font-mono">
                    HEX: {hslToHex(hue, saturation, lightness).toUpperCase()}
                  </div>
                  <div className="text-sm font-mono">
                    RGB: ({hexToRgb(hslToHex(hue, saturation, lightness)).r}, {hexToRgb(hslToHex(hue, saturation, lightness)).g}, {hexToRgb(hslToHex(hue, saturation, lightness)).b})
                  </div>
                  <div className="text-sm font-mono">
                    HSL: ({hue}°, {saturation}%, {lightness}%)
                  </div>
                </div>
              </div>

              {/* HSL Sliders */}
              <div className="space-y-4">
                <div>
                  <Label>Hue: {hue}°</Label>
                  <Slider
                    value={[hue]}
                    onValueChange={([value]) => setHue(value)}
                    max={360}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Saturation: {saturation}%</Label>
                  <Slider
                    value={[saturation]}
                    onValueChange={([value]) => setSaturation(value)}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Lightness: {lightness}%</Label>
                  <Slider
                    value={[lightness]}
                    onValueChange={([value]) => setLightness(value)}
                    max={100}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Harmony Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Harmony Type</Label>
                  <Select value={harmonyType} onValueChange={setHarmonyType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {harmonyTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Palette Size</Label>
                  <Select value={paletteSize.toString()} onValueChange={(value) => setPaletteSize(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[3, 4, 5, 6, 7, 8].map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size} colors
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateHarmoniousPalette} className="flex-1">
                  <Palette className="h-4 w-4 mr-2" />
                  Generate Palette
                </Button>
                <Button variant="outline" onClick={generateRandomPalette}>
                  <Shuffle className="h-4 w-4 mr-2" />
                  Random Palette
                </Button>
                <Button variant="outline" onClick={addCustomColor}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Color
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Generated Palette */}
          {colors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Generated Palette ({colors.length} colors)
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyPalette}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadPalette}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAll}>
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {colors.map((color, index) => (
                    <div key={index} className="space-y-2">
                      <div
                        className="w-full h-20 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                        style={{ backgroundColor: color.hex }}
                        onClick={() => copyColor(color)}
                        title="Click to copy"
                      />
                      <div className="text-center space-y-1">
                        <div className="text-sm font-mono font-bold">{color.hex.toUpperCase()}</div>
                        <div className="text-xs text-muted-foreground">
                          RGB({color.rgb.r}, {color.rgb.g}, {color.rgb.b})
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeColor(index)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Schemes Tab */}
        <TabsContent value="schemes" className="space-y-6">
          {/* Save Current Palette */}
          <Card>
            <CardHeader>
              <CardTitle>Save Current Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter scheme name"
                  value={schemeName}
                  onChange={(e) => setSchemeName(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={saveScheme} disabled={!schemeName.trim() || colors.length === 0}>
                  Save Scheme
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Saved Schemes */}
          <Card>
            <CardHeader>
              <CardTitle>Saved Color Schemes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schemes.map((scheme) => (
                  <div key={scheme.name} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold">{scheme.name}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadScheme(scheme.name)}
                        >
                          Load
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteScheme(scheme.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {scheme.colors.map((color, index) => (
                        <div
                          key={index}
                          className="w-8 h-8 rounded border-2 border-gray-300"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                {schemes.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No saved schemes yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Extractor Tab */}
        <TabsContent value="extractor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Extract Colors from Image
              </CardTitle>
              <CardDescription>
                Upload an image to extract its dominant colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Choose Image
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Supports JPG, PNG, GIF, WebP
                </p>
              </div>

              {imageFile && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Selected: {imageFile.name}
                  </p>
                </div>
              )}

              {extractedColors.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Extracted Colors</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setColors(prev => [...extractedColors, ...prev])}
                    >
                      Add to Palette
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {extractedColors.map((color, index) => (
                      <div key={index} className="space-y-2">
                        <div
                          className="w-full h-16 rounded-lg border-2 border-gray-300 cursor-pointer hover:scale-105 transition-transform"
                          style={{ backgroundColor: color.hex }}
                          onClick={() => copyColor(color)}
                          title="Click to copy"
                        />
                        <div className="text-center">
                          <div className="text-sm font-mono font-bold">{color.hex.toUpperCase()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tools Tab */}
        <TabsContent value="tools" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Color Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Color Contrast Checker</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Check contrast ratios for accessibility
                  </p>
                  <Button variant="outline" size="sm">
                    Open Tool
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Color Blindness Simulator</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    See how colors appear to color-blind users
                  </p>
                  <Button variant="outline" size="sm">
                    Open Tool
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Color Namer</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Find names for your colors
                  </p>
                  <Button variant="outline" size="sm">
                    Open Tool
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-2">Gradient Generator</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Create beautiful gradients
                  </p>
                  <Button variant="outline" size="sm">
                    Open Tool
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ColorPaletteGenerator;
