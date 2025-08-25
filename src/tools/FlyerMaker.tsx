import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { 
  FileImage, 
  Download, 
  Image as ImageIcon, 
  Type, 
  Palette, 
  Layout, 
  Layers,
  RotateCcw,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FlyerMaker = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [flyerTitle, setFlyerTitle] = useState<string>("Event Title");
  const [flyerSubtitle, setFlyerSubtitle] = useState<string>("Date • Time • Location");
  const [flyerDescription, setFlyerDescription] = useState<string>("Add your event description here. Include important details about your event that will attract attendees.");
  const [contactInfo, setContactInfo] = useState<string>("Contact: email@example.com | (123) 456-7890");
  
  const [backgroundColor, setBackgroundColor] = useState<string>("#4f46e5");
  const [textColor, setTextColor] = useState<string>("#ffffff");
  const [accentColor, setAccentColor] = useState<string>("#f97316");
  
  const [selectedTemplate, setSelectedTemplate] = useState<string>("modern");
  const [selectedSize, setSelectedSize] = useState<string>("a4");
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  
  const [showBorder, setShowBorder] = useState<boolean>(true);
  const [borderWidth, setBorderWidth] = useState<number>(4);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  
  const templates = [
    { id: "modern", name: "Modern" },
    { id: "classic", name: "Classic" },
    { id: "minimal", name: "Minimal" },
    { id: "bold", name: "Bold" },
    { id: "gradient", name: "Gradient" },
  ];
  
  const sizes = [
    { id: "a4", name: "A4 (210×297mm)", width: 794, height: 1123 },
    { id: "letter", name: "US Letter (8.5×11in)", width: 816, height: 1056 },
    { id: "instagram", name: "Instagram (1080×1080px)", width: 1080, height: 1080 },
    { id: "facebook", name: "Facebook (1200×630px)", width: 1200, height: 630 },
    { id: "flyer", name: "Standard Flyer (5×7in)", width: 480, height: 672 },
  ];
  
  const handleBackgroundImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setBackgroundImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoImage(event.target.result as string);
          setShowLogo(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  
  const removeBackgroundImage = () => {
    setBackgroundImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const removeLogo = () => {
    setLogoImage(null);
    setShowLogo(false);
  };
  
  const getCurrentSize = () => {
    return sizes.find(size => size.id === selectedSize) || sizes[0];
  };
  
  const renderFlyer = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = getCurrentSize();
    canvas.width = size.width;
    canvas.height = size.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        drawContent(ctx, canvas.width, canvas.height);
      };
      img.src = backgroundImage;
    } else {
      if (selectedTemplate === "gradient") {
        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, accentColor);
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = backgroundColor;
      }
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      drawContent(ctx, canvas.width, canvas.height);
    }
  };
  
  const drawContent = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // Border
    if (showBorder) {
      ctx.strokeStyle = accentColor;
      ctx.lineWidth = borderWidth;
      const offset = borderWidth / 2;
      ctx.strokeRect(offset, offset, width - borderWidth, height - borderWidth);
    }
    
    // Logo
    if (showLogo && logoImage) {
      const logoImg = new Image();
      logoImg.onload = () => {
        const logoSize = Math.min(width * 0.2, height * 0.1);
        const logoX = width * 0.5 - logoSize / 2;
        const logoY = height * 0.05;
        ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      };
      logoImg.src = logoImage;
    }
    
    // Text content based on template
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    
    const padding = width * 0.1;
    const contentWidth = width - (padding * 2);
    
    // Title
    let yPosition = height * (showLogo ? 0.2 : 0.15);
    let fontSize = Math.min(width * 0.08, 72);
    ctx.font = `bold ${fontSize}px Arial`;
    
    // Wrap title text
    const titleLines = wrapText(ctx, flyerTitle, contentWidth);
    titleLines.forEach(line => {
      ctx.fillText(line, width / 2, yPosition);
      yPosition += fontSize * 1.2;
    });
    
    // Subtitle
    yPosition += fontSize * 0.3;
    fontSize = Math.min(width * 0.04, 36);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(flyerSubtitle, width / 2, yPosition);
    
    // Accent line
    yPosition += fontSize * 1.5;
    ctx.strokeStyle = accentColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width / 2 - contentWidth / 4, yPosition);
    ctx.lineTo(width / 2 + contentWidth / 4, yPosition);
    ctx.stroke();
    
    // Description
    yPosition += fontSize * 1.5;
    fontSize = Math.min(width * 0.03, 24);
    ctx.font = `${fontSize}px Arial`;
    
    // Wrap description text
    const descLines = wrapText(ctx, flyerDescription, contentWidth);
    descLines.forEach(line => {
      ctx.fillText(line, width / 2, yPosition);
      yPosition += fontSize * 1.3;
    });
    
    // Contact info at bottom
    fontSize = Math.min(width * 0.025, 18);
    ctx.font = `${fontSize}px Arial`;
    ctx.fillText(contactInfo, width / 2, height - height * 0.08);
  };
  
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    lines.push(currentLine);
    return lines;
  };
  
  const downloadFlyer = () => {
    if (!canvasRef.current) return;
    
    // Ensure the flyer is rendered with the latest settings
    renderFlyer();
    
    // Small delay to ensure rendering is complete
    setTimeout(() => {
      const link = document.createElement('a');
      link.download = `flyer-${selectedTemplate}-${Date.now()}.png`;
      link.href = canvasRef.current?.toDataURL('image/png') || '';
      link.click();
      
      toast({
        title: "Flyer Downloaded",
        description: "Your flyer has been downloaded successfully."
      });
    }, 500);
  };
  
  // Initial render
  useState(() => {
    renderFlyer();
  });
  
  // Re-render when any design property changes
  useState(() => {
    const timeoutId = setTimeout(() => {
      renderFlyer();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [
    flyerTitle, flyerSubtitle, flyerDescription, contactInfo,
    backgroundColor, textColor, accentColor,
    selectedTemplate, selectedSize, backgroundImage, logoImage,
    showBorder, borderWidth, showLogo
  ]);

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileImage className="h-6 w-6" />
          <span>Flyer Maker</span>
        </CardTitle>
        <CardDescription>
          Create professional marketing flyers for events, promotions, and announcements
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left side - Design controls */}
          <div className="space-y-6">
            <Tabs defaultValue="content">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="content">
                  <Type className="h-4 w-4 mr-2" /> Content
                </TabsTrigger>
                <TabsTrigger value="design">
                  <Palette className="h-4 w-4 mr-2" /> Design
                </TabsTrigger>
                <TabsTrigger value="layout">
                  <Layout className="h-4 w-4 mr-2" /> Layout
                </TabsTrigger>
                <TabsTrigger value="images">
                  <ImageIcon className="h-4 w-4 mr-2" /> Images
                </TabsTrigger>
              </TabsList>
              
              {/* Content Tab */}
              <TabsContent value="content" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="flyer-title">Title</Label>
                  <Input 
                    id="flyer-title" 
                    value={flyerTitle}
                    onChange={(e) => setFlyerTitle(e.target.value)}
                    placeholder="Event Title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flyer-subtitle">Subtitle</Label>
                  <Input 
                    id="flyer-subtitle" 
                    value={flyerSubtitle}
                    onChange={(e) => setFlyerSubtitle(e.target.value)}
                    placeholder="Date • Time • Location"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="flyer-description">Description</Label>
                  <Textarea 
                    id="flyer-description" 
                    value={flyerDescription}
                    onChange={(e) => setFlyerDescription(e.target.value)}
                    placeholder="Add your event description here..."
                    rows={4}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-info">Contact Information</Label>
                  <Input 
                    id="contact-info" 
                    value={contactInfo}
                    onChange={(e) => setContactInfo(e.target.value)}
                    placeholder="Contact: email@example.com | (123) 456-7890"
                  />
                </div>
              </TabsContent>
              
              {/* Design Tab */}
              <TabsContent value="design" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Template</Label>
                  <Select 
                    value={selectedTemplate} 
                    onValueChange={setSelectedTemplate}
                  >
                    <SelectTrigger id="template">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="background-color">Background Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="background-color" 
                      type="color" 
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="text-color" 
                      type="color" 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="accent-color">Accent Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="accent-color" 
                      type="color" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      type="text" 
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </TabsContent>
              
              {/* Layout Tab */}
              <TabsContent value="layout" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="size">Flyer Size</Label>
                  <Select 
                    value={selectedSize} 
                    onValueChange={setSelectedSize}
                  >
                    <SelectTrigger id="size">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map(size => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-border">Show Border</Label>
                  <Switch 
                    id="show-border" 
                    checked={showBorder}
                    onCheckedChange={setShowBorder}
                  />
                </div>
                
                {showBorder && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="border-width">Border Width</Label>
                      <span className="text-sm">{borderWidth}px</span>
                    </div>
                    <Slider
                      id="border-width"
                      min={1}
                      max={20}
                      step={1}
                      value={[borderWidth]}
                      onValueChange={(value) => setBorderWidth(value[0])}
                    />
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-logo">Show Logo</Label>
                  <Switch 
                    id="show-logo" 
                    checked={showLogo}
                    onCheckedChange={setShowLogo}
                    disabled={!logoImage}
                  />
                </div>
              </TabsContent>
              
              {/* Images Tab */}
              <TabsContent value="images" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="background-image">Background Image</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="background-image" 
                      type="file" 
                      accept="image/*"
                      ref={fileInputRef}
                      onChange={handleBackgroundImageUpload}
                      className="flex-1"
                    />
                    {backgroundImage && (
                      <Button variant="outline" size="icon" onClick={removeBackgroundImage}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {backgroundImage && (
                    <div className="text-sm text-muted-foreground">
                      Background image uploaded
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="logo-image">Logo Image</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="logo-image" 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="flex-1"
                    />
                    {logoImage && (
                      <Button variant="outline" size="icon" onClick={removeLogo}>
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {logoImage && (
                    <div className="text-sm text-muted-foreground">
                      Logo image uploaded
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={downloadFlyer} className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download Flyer
              </Button>
              <Button variant="outline" className="flex-1">
                <Share2 className="h-4 w-4 mr-2" /> Share
              </Button>
            </div>
          </div>
          
          {/* Right side - Preview */}
          <div className="border rounded-md p-4 flex flex-col items-center justify-center bg-muted/30">
            <div className="text-sm font-medium mb-2">Preview</div>
            <div className="relative w-full overflow-hidden flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                className="max-w-full max-h-[600px] shadow-lg"
                style={{ aspectRatio: `${getCurrentSize().width} / ${getCurrentSize().height}` }}
              />
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              {getCurrentSize().name} - {getCurrentSize().width}×{getCurrentSize().height}px
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlyerMaker;