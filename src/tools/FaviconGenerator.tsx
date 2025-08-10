import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  Copy,
  RotateCcw,
  Settings,
  Image as ImageIcon,
  Type,
  Smile,
  Palette,
  Eye,
  EyeOff,
  Check,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FaviconConfig {
  type: 'text' | 'image' | 'emoji';
  text: string;
  font: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  size: number;
  padding: number;
  borderRadius: number;
  shadow: boolean;
  border: boolean;
  borderColor: string;
  borderWidth: number;
}

const FaviconGenerator = () => {
  const [config, setConfig] = useState<FaviconConfig>({
    type: 'text',
    text: 'F',
    font: 'Arial',
    fontSize: 32,
    backgroundColor: '#3B82F6',
    textColor: '#FFFFFF',
    size: 32,
    padding: 4,
    borderRadius: 0,
    shadow: false,
    border: false,
    borderColor: '#000000',
    borderWidth: 1
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [generatedFavicons, setGeneratedFavicons] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fonts = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Georgia',
    'Verdana',
    'Courier New',
    'Impact',
    'Comic Sans MS',
    'Tahoma',
    'Trebuchet MS'
  ];

  const sizes = [16, 32, 48, 64, 128, 256];
  const commonSizes = [16, 32, 48];

  const emojis = [
    '🚀', '⭐', '💎', '🔥', '🌟', '🎯', '💡', '🎨', '🚀', '⚡',
    '🎉', '🏆', '💪', '🎭', '🎪', '🎨', '🎭', '🎪', '🎨', '🎭',
    '😀', '😎', '🤖', '👾', '🎮', '🎲', '🎯', '🎪', '🎨', '🎭'
  ];

  const generateFavicon = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = config.size;
    canvas.height = config.size;

    // Clear canvas
    ctx.clearRect(0, 0, config.size, config.size);

    // Draw background
    ctx.fillStyle = config.backgroundColor;
    if (config.borderRadius > 0) {
      ctx.beginPath();
      ctx.roundRect(0, 0, config.size, config.size, config.borderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, config.size, config.size);
    }

    // Draw border
    if (config.border) {
      ctx.strokeStyle = config.borderColor;
      ctx.lineWidth = config.borderWidth;
      if (config.borderRadius > 0) {
        ctx.beginPath();
        ctx.roundRect(0, 0, config.size, config.size, config.borderRadius);
        ctx.stroke();
      } else {
        ctx.strokeRect(0, 0, config.size, config.size);
      }
    }

    // Draw shadow
    if (config.shadow) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
    }

    if (config.type === 'text') {
      // Draw text
      ctx.fillStyle = config.textColor;
      ctx.font = `${config.fontSize}px ${config.font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = config.size / 2;
      const y = config.size / 2;
      
      ctx.fillText(config.text, x, y);
    } else if (config.type === 'image' && imageFile) {
      // Draw image
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(
          (config.size - config.padding * 2) / img.width,
          (config.size - config.padding * 2) / img.height
        );
        
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        
        const x = (config.size - scaledWidth) / 2;
        const y = (config.size - scaledHeight) / 2;
        
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        
        // Update preview
        setPreviewUrl(canvas.toDataURL());
      };
      img.src = URL.createObjectURL(imageFile);
    } else if (config.type === 'emoji') {
      // Draw emoji
      ctx.fillStyle = config.textColor;
      ctx.font = `${config.fontSize}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      const x = config.size / 2;
      const y = config.size / 2;
      
      ctx.fillText(config.text, x, y);
    }

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Update preview
    setPreviewUrl(canvas.toDataURL());
  }, [config, imageFile]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setConfig(prev => ({ ...prev, type: 'image' }));
      toast({
        title: "Image uploaded",
        description: "Image uploaded successfully",
      });
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid image file",
        variant: "destructive"
      });
    }
  };

  const generateAllSizes = () => {
    const newFavicons: string[] = [];
    
    sizes.forEach(size => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      tempCanvas.width = size;
      tempCanvas.height = size;

      // Draw background
      tempCtx.fillStyle = config.backgroundColor;
      if (config.borderRadius > 0) {
        tempCtx.beginPath();
        tempCtx.roundRect(0, 0, size, size, config.borderRadius);
        tempCtx.fill();
      } else {
        tempCtx.fillRect(0, 0, size, size);
      }

      // Draw border
      if (config.border) {
        tempCtx.strokeStyle = config.borderColor;
        tempCtx.lineWidth = config.borderWidth;
        if (config.borderRadius > 0) {
          tempCtx.beginPath();
          tempCtx.roundRect(0, 0, size, size, config.borderRadius);
          tempCtx.stroke();
        } else {
          tempCtx.strokeRect(0, 0, size, size);
        }
      }

      if (config.type === 'text') {
        tempCtx.fillStyle = config.textColor;
        const fontSize = Math.max(8, (config.fontSize * size) / 32);
        tempCtx.font = `${fontSize}px ${config.font}`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(config.text, size / 2, size / 2);
      } else if (config.type === 'emoji') {
        tempCtx.fillStyle = config.textColor;
        const fontSize = Math.max(8, (config.fontSize * size) / 32);
        tempCtx.font = `${fontSize}px Arial`;
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText(config.text, size / 2, size / 2);
      }

      newFavicons.push(tempCanvas.toDataURL());
    });

    setGeneratedFavicons(newFavicons);
    toast({
      title: "All sizes generated",
      description: `${sizes.length} favicon sizes created`,
    });
  };

  const downloadFavicon = (format: 'png' | 'ico' = 'png') => {
    if (!previewUrl) {
      toast({
        title: "No favicon",
        description: "Please generate a favicon first",
        variant: "destructive"
      });
      return;
    }

    const link = document.createElement('a');
    link.href = previewUrl;
    link.download = `favicon-${config.size}x${config.size}.${format}`;
    link.click();

    toast({
      title: "Download started",
      description: `Favicon downloaded as ${format.toUpperCase()}`,
    });
  };

  const downloadAllSizes = () => {
    if (generatedFavicons.length === 0) {
      toast({
        title: "No favicons",
        description: "Please generate all sizes first",
        variant: "destructive"
      });
      return;
    }

    generatedFavicons.forEach((favicon, index) => {
      const link = document.createElement('a');
      link.href = favicon;
      link.download = `favicon-${sizes[index]}x${sizes[index]}.png`;
      link.click();
    });

    toast({
      title: "All favicons downloaded",
      description: `${generatedFavicons.length} favicon files downloaded`,
    });
  };

  const copyFaviconCode = () => {
    if (!previewUrl) {
      toast({
        title: "No favicon",
        description: "Please generate a favicon first",
        variant: "destructive"
      });
      return;
    }

    const htmlCode = `<link rel="icon" type="image/png" sizes="${config.size}x${config.size}" href="favicon-${config.size}x${config.size}.png">`;
    navigator.clipboard.writeText(htmlCode);

    toast({
      title: "Code copied",
      description: "HTML code copied to clipboard",
    });
  };

  const clearAll = () => {
    setConfig({
      type: 'text',
      text: 'F',
      font: 'Arial',
      fontSize: 32,
      backgroundColor: '#3B82F6',
      textColor: '#FFFFFF',
      size: 32,
      padding: 4,
      borderRadius: 0,
      shadow: false,
      border: false,
      borderColor: '#000000',
      borderWidth: 1
    });
    setImageFile(null);
    setPreviewUrl('');
    setGeneratedFavicons([]);
    toast({
      title: "Cleared",
      description: "All settings and generated favicons have been cleared",
    });
  };

  const selectEmoji = (emoji: string) => {
    setConfig(prev => ({ ...prev, text: emoji, type: 'emoji' }));
    toast({
      title: "Emoji selected",
      description: `Selected emoji: ${emoji}`,
    });
  };

  // Generate favicon when config changes
  useEffect(() => {
    if (config.type === 'text' || config.type === 'emoji') {
      generateFavicon();
    }
  }, [config, generateFavicon]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="generator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generator">Generator</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          {/* Type Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Favicon Type</CardTitle>
              <CardDescription>
                Choose how to create your favicon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    config.type === 'text' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, type: 'text' }))}
                >
                  <Type className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold text-center">Text</h3>
                  <p className="text-sm text-muted-foreground text-center">Create from text or letters</p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    config.type === 'image' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, type: 'image' }))}
                >
                  <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold text-center">Image</h3>
                  <p className="text-sm text-muted-foreground text-center">Upload and convert an image</p>
                </div>

                <div
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    config.type === 'emoji' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setConfig(prev => ({ ...prev, type: 'emoji' }))}
                >
                  <Smile className="h-8 w-8 mx-auto mb-2" />
                  <h3 className="font-semibold text-center">Emoji</h3>
                  <p className="text-sm text-muted-foreground text-center">Use emojis as favicon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.type === 'text' && (
                <div className="space-y-4">
                  <div>
                    <Label>Text</Label>
                    <Input
                      value={config.text}
                      onChange={(e) => setConfig(prev => ({ ...prev, text: e.target.value }))}
                      placeholder="Enter text (1-2 characters recommended)"
                      maxLength={3}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Font</Label>
                      <Select value={config.font} onValueChange={(value) => setConfig(prev => ({ ...prev, font: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fonts.map(font => (
                            <SelectItem key={font} value={font}>
                              {font}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Font Size: {config.fontSize}px</Label>
                      <Slider
                        value={[config.fontSize]}
                        onValueChange={([value]) => setConfig(prev => ({ ...prev, fontSize: value }))}
                        max={64}
                        min={8}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              )}

              {config.type === 'image' && (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                </div>
              )}

              {config.type === 'emoji' && (
                <div className="space-y-4">
                  <div>
                    <Label>Selected Emoji</Label>
                    <div className="text-4xl text-center p-4 border rounded-lg">
                      {config.text}
                    </div>
                  </div>
                  <div>
                    <Label>Choose Emoji</Label>
                    <div className="grid grid-cols-10 gap-2 mt-2">
                      {emojis.map((emoji, index) => (
                        <button
                          key={index}
                          className="text-2xl p-2 border rounded hover:bg-gray-100 transition-colors"
                          onClick={() => selectEmoji(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Style Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Style Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Background Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.backgroundColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, backgroundColor: e.target.value }))}
                      placeholder="#3B82F6"
                      className="flex-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Text/Content Color</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      type="color"
                      value={config.textColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={config.textColor}
                      onChange={(e) => setConfig(prev => ({ ...prev, textColor: e.target.value }))}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Size: {config.size}x{config.size}px</Label>
                  <Select value={config.size.toString()} onValueChange={(value) => setConfig(prev => ({ ...prev, size: parseInt(value) }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size} value={size.toString()}>
                          {size}x{size}px
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Border Radius: {config.borderRadius}px</Label>
                  <Slider
                    value={[config.borderRadius]}
                    onValueChange={([value]) => setConfig(prev => ({ ...prev, borderRadius: value }))}
                    max={config.size / 2}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="shadow"
                    checked={config.shadow}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, shadow: checked }))}
                  />
                  <Label htmlFor="shadow">Add shadow</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="border"
                    checked={config.border}
                    onCheckedChange={(checked) => setConfig(prev => ({ ...prev, border: checked }))}
                  />
                  <Label htmlFor="border">Add border</Label>
                </div>
              </div>

              {config.border && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Border Color</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={config.borderColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={config.borderColor}
                        onChange={(e) => setConfig(prev => ({ ...prev, borderColor: e.target.value }))}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Border Width: {config.borderWidth}px</Label>
                    <Slider
                      value={[config.borderWidth]}
                      onValueChange={([value]) => setConfig(prev => ({ ...prev, borderWidth: value }))}
                      max={5}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex gap-2">
            <Button onClick={generateFavicon} className="flex-1">
              Generate Favicon
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Favicon Preview</CardTitle>
              <CardDescription>
                Preview your generated favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Canvas */}
              <div className="flex justify-center">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-300 rounded-lg"
                  style={{ width: '200px', height: '200px' }}
                />
              </div>

              {/* Preview Info */}
              {previewUrl && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Size</Label>
                      <p className="text-sm text-muted-foreground">
                        {config.size}x{config.size} pixels
                      </p>
                    </div>
                    <div>
                      <Label>Format</Label>
                      <p className="text-sm text-muted-foreground">PNG (transparent background)</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => downloadFavicon('png')}>
                      <Download className="h-4 w-4 mr-2" />
                      Download PNG
                    </Button>
                    <Button variant="outline" onClick={copyFaviconCode}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy HTML Code
                    </Button>
                  </div>
                </div>
              )}

              {!previewUrl && (
                <div className="text-center py-8 text-muted-foreground">
                  Generate a favicon to see the preview
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate All Sizes</CardTitle>
              <CardDescription>
                Create favicons in all common sizes for web use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {sizes.map(size => (
                  <div key={size} className="text-center p-3 border rounded-lg">
                    <div className="text-lg font-semibold">{size}x{size}</div>
                    <div className="text-sm text-muted-foreground">
                      {size === 16 ? 'Standard favicon' : 
                       size === 32 ? 'High DPI favicon' : 
                       size === 48 ? 'Windows tile' : 
                       size === 64 ? 'Desktop icon' : 
                       size === 128 ? 'Chrome Web Store' : 'App icon'}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Button onClick={generateAllSizes} className="flex-1">
                  Generate All Sizes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadAllSizes}
                  disabled={generatedFavicons.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download All
                </Button>
              </div>

              {/* Generated Favicons */}
              {generatedFavicons.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Generated Favicons</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {generatedFavicons.map((favicon, index) => (
                      <div key={index} className="text-center">
                        <img
                          src={favicon}
                          alt={`${sizes[index]}x${sizes[index]} favicon`}
                          className="mx-auto border rounded"
                          style={{ width: '64px', height: '64px' }}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          {sizes[index]}x{sizes[index]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* HTML Code */}
          <Card>
            <CardHeader>
              <CardTitle>HTML Implementation</CardTitle>
              <CardDescription>
                Copy the HTML code to use your favicon
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Standard Favicon</Label>
                  <Textarea
                    value={`<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">`}
                    readOnly
                    rows={2}
                    className="font-mono text-sm"
                  />
                </div>
                <div>
                  <Label>All Sizes (Recommended)</Label>
                  <Textarea
                    value={`<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="favicon-180x180.png">`}
                    readOnly
                    rows={6}
                    className="font-mono text-sm"
                  />
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const code = `<link rel="icon" type="image/png" sizes="16x16" href="favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="favicon-48x48.png">
<link rel="apple-touch-icon" sizes="180x180" href="favicon-180x180.png">`;
                    navigator.clipboard.writeText(code);
                    toast({
                      title: "Code copied",
                      description: "HTML code copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All HTML Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FaviconGenerator;
