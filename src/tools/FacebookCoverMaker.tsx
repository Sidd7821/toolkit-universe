import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, Type, Image as ImageIcon, Palette, Settings, Facebook } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoverTemplate {
  id: string;
  name: string;
  width: number;
  height: number;
  description: string;
  preview: string;
}

const FacebookCoverMaker = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("desktop");
  const [coverText, setCoverText] = useState("Your Cover Text Here");
  const [fontSize, setFontSize] = useState([48]);
  const [textColor, setTextColor] = useState("#ffffff");
  const [backgroundColor, setBackgroundColor] = useState("#1877f2");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageOpacity, setImageOpacity] = useState([0.7]);
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });

  const templates: CoverTemplate[] = [
    {
      id: "desktop",
      name: "Desktop Cover",
      width: 851,
      height: 315,
      description: "Standard Facebook cover photo (851×315)",
      preview: "📱"
    },
    {
      id: "mobile",
      name: "Mobile Cover",
      width: 640,
      height: 360,
      description: "Mobile-optimized cover (640×360)",
      preview: "📱"
    },
    {
      id: "square",
      name: "Square Cover",
      width: 500,
      height: 500,
      description: "Square format for profile pictures (500×500)",
      preview: "⬜"
    }
  ];

  const fonts = [
    { value: "Arial", label: "Arial" },
    { value: "Helvetica", label: "Helvetica" },
    { value: "Times New Roman", label: "Times New Roman" },
    { value: "Georgia", label: "Georgia" },
    { value: "Verdana", label: "Verdana" },
    { value: "Impact", label: "Impact" },
    { value: "Comic Sans MS", label: "Comic Sans MS" }
  ];

  const [selectedFont, setSelectedFont] = useState("Arial");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        toast({
          title: "Image Uploaded!",
          description: "Background image has been added to your cover",
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const generateCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const template = templates.find(t => t.id === selectedTemplate);
    if (!template) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = template.width;
    canvas.height = template.height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, template.width, template.height);

    // Draw background image if uploaded
    if (uploadedImage) {
      const img = new Image();
      img.onload = () => {
        // Calculate image dimensions to cover canvas
        const scale = Math.max(template.width / img.width, template.height / img.height);
        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;
        const x = (template.width - scaledWidth) / 2;
        const y = (template.height - scaledHeight) / 2;

        ctx.globalAlpha = imageOpacity[0];
        ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
        ctx.globalAlpha = 1;

        // Draw text overlay
        drawText(ctx, template);
      };
      img.src = uploadedImage;
    } else {
      // Draw text directly if no image
      drawText(ctx, template);
    }
  };

  const drawText = (ctx: CanvasRenderingContext2D, template: CoverTemplate) => {
    ctx.font = `${fontSize[0]}px ${selectedFont}`;
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Add text shadow for better visibility
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    const x = (template.width * textPosition.x) / 100;
    const y = (template.height * textPosition.y) / 100;

    // Handle multiline text
    const lines = coverText.split('\n');
    const lineHeight = fontSize[0] * 1.2;
    const totalHeight = lines.length * lineHeight;
    const startY = y - (totalHeight / 2) + (lineHeight / 2);

    lines.forEach((line, index) => {
      ctx.fillText(line, x, startY + (index * lineHeight));
    });

    // Reset shadow
    ctx.shadowColor = "transparent";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const downloadCover = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `facebook-cover-${selectedTemplate}.png`;
    link.href = canvas.toDataURL();
    link.click();

    toast({
      title: "Cover Downloaded!",
      description: "Your Facebook cover has been saved successfully",
    });
  };

  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCoverText(event.target.value);
  };

  const handleFontSizeChange = (value: number[]) => {
    setFontSize(value);
  };

  const handleImageOpacityChange = (value: number[]) => {
    setImageOpacity(value);
  };

  const handleTextPositionChange = (axis: 'x' | 'y', value: number) => {
    setTextPosition(prev => ({ ...prev, [axis]: value }));
  };

  const resetToDefaults = () => {
    setCoverText("Your Cover Text Here");
    setFontSize([48]);
    setTextColor("#ffffff");
    setBackgroundColor("#1877f2");
    setImageOpacity([0.7]);
    setTextPosition({ x: 50, y: 50 });
    setSelectedFont("Arial");
    setUploadedImage(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Facebook className="text-4xl text-blue-600" />
          Facebook Cover Maker
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Create stunning Facebook cover photos with custom text, backgrounds, and layouts. Perfect for personal profiles and business pages.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Cover Preview
              </CardTitle>
              <CardDescription>
                Preview your Facebook cover in real-time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mb-4">
                <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4">
                  <canvas
                    ref={canvasRef}
                    className="max-w-full h-auto border border-border rounded shadow-lg"
                    style={{ maxHeight: "400px" }}
                  />
                </div>
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={generateCover} className="flex items-center gap-2">
                  <ImageIcon className="h-4 w-4" />
                  Generate Cover
                </Button>
                <Button onClick={downloadCover} variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Cover Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template">Template Size</Label>
                <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <span className="mr-2">{template.preview}</span>
                        {template.name} ({template.width}×{template.height})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {templates.find(t => t.id === selectedTemplate)?.description}
                </p>
              </div>

              <div>
                <Label htmlFor="coverText">Cover Text</Label>
                <Textarea
                  id="coverText"
                  value={coverText}
                  onChange={handleTextChange}
                  placeholder="Enter your cover text..."
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use Enter for multiple lines
                </p>
              </div>

              <div>
                <Label htmlFor="font">Font Family</Label>
                <Select value={selectedFont} onValueChange={setSelectedFont}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fonts.map((font) => (
                      <SelectItem key={font.value} value={font.value}>
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Font Size: {fontSize[0]}px</Label>
                <Slider
                  value={fontSize}
                  onValueChange={handleFontSizeChange}
                  max={120}
                  min={12}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Text Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground self-center">
                    {textColor}
                  </span>
                </div>
              </div>

              <div>
                <Label>Background Color</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <span className="text-sm text-muted-foreground self-center">
                    {backgroundColor}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Background Image
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUpload">Upload Image</Label>
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, GIF up to 5MB
                </p>
              </div>

              {uploadedImage && (
                <>
                  <div>
                    <Label>Image Opacity: {Math.round(imageOpacity[0] * 100)}%</Label>
                    <Slider
                      value={imageOpacity}
                      onValueChange={handleImageOpacityChange}
                      max={1}
                      min={0.1}
                      step={0.1}
                      className="w-full"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUploadedImage(null)}
                      className="flex-1"
                    >
                      Remove Image
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="h-5 w-5" />
                Text Position
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Horizontal Position: {textPosition.x}%</Label>
                <Slider
                  value={[textPosition.x]}
                  onValueChange={(value) => handleTextPositionChange('x', value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>

              <div>
                <Label>Vertical Position: {textPosition.y}%</Label>
                <Slider
                  value={[textPosition.y]}
                  onValueChange={(value) => handleTextPositionChange('y', value[0])}
                  max={100}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={resetToDefaults}
                variant="outline"
                className="w-full"
              >
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Design Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">📏 Dimensions</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Desktop: 851×315 pixels</li>
                  <li>• Mobile: 640×360 pixels</li>
                  <li>• Square: 500×500 pixels</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🎨 Best Practices</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>• Use high contrast colors</li>
                  <li>• Keep text readable</li>
                  <li>• Avoid cluttered designs</li>
                  <li>• Test on mobile devices</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FacebookCoverMaker;
