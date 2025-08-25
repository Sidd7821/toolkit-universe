import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Download, Image, Type, Palette, Instagram, Layers, Move, PanelLeft } from "lucide-react";

interface Template {
  id: string;
  name: string;
  category: string;
  background: string;
  elements: TemplateElement[];
}

interface TemplateElement {
  id: string;
  type: "text" | "image" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  backgroundColor?: string;
  borderRadius?: number;
  rotation?: number;
  opacity?: number;
  shape?: string;
  imageUrl?: string;
}

const InstagramStoryTemplates = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for template selection and customization
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [customizedTemplate, setCustomizedTemplate] = useState<Template | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [userImages, setUserImages] = useState<Record<string, string>>({});
  
  // Canvas state
  const [canvasWidth, setCanvasWidth] = useState<number>(1080); // Instagram story width
  const [canvasHeight, setCanvasHeight] = useState<number>(1920); // Instagram story height
  const [scale, setScale] = useState<number>(0.3); // Scale for display
  
  // Predefined templates
  const templates: Template[] = [
    {
      id: "minimal-quote",
      name: "Minimal Quote",
      category: "quotes",
      background: "#ffffff",
      elements: [
        {
          id: "quote-text",
          type: "text",
          x: 540,
          y: 960,
          width: 800,
          height: 400,
          content: "Your inspiring quote goes here",
          fontSize: 60,
          fontFamily: "Arial",
          color: "#000000",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "author-text",
          type: "text",
          x: 540,
          y: 1200,
          width: 600,
          height: 100,
          content: "- Author Name",
          fontSize: 32,
          fontFamily: "Arial",
          color: "#666666",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    },
    {
      id: "product-showcase",
      name: "Product Showcase",
      category: "business",
      background: "#f5f5f5",
      elements: [
        {
          id: "product-image",
          type: "image",
          x: 540,
          y: 800,
          width: 800,
          height: 800,
          imageUrl: "",
          borderRadius: 0,
          rotation: 0,
          opacity: 1
        },
        {
          id: "product-name",
          type: "text",
          x: 540,
          y: 1400,
          width: 800,
          height: 100,
          content: "Product Name",
          fontSize: 48,
          fontFamily: "Arial",
          color: "#000000",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "product-price",
          type: "text",
          x: 540,
          y: 1500,
          width: 800,
          height: 100,
          content: "$99.99",
          fontSize: 36,
          fontFamily: "Arial",
          color: "#e73c7e",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    },
    {
      id: "gradient-announcement",
      name: "Gradient Announcement",
      category: "announcements",
      background: "linear-gradient(45deg, #23a6d5, #e73c7e)",
      elements: [
        {
          id: "announcement-title",
          type: "text",
          x: 540,
          y: 860,
          width: 900,
          height: 200,
          content: "BIG ANNOUNCEMENT",
          fontSize: 72,
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "announcement-details",
          type: "text",
          x: 540,
          y: 1060,
          width: 800,
          height: 400,
          content: "Share the exciting details of your announcement here",
          fontSize: 36,
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    },
    {
      id: "photo-frame",
      name: "Photo Frame",
      category: "photos",
      background: "#ffffff",
      elements: [
        {
          id: "frame-shape",
          type: "shape",
          x: 540,
          y: 960,
          width: 900,
          height: 1600,
          backgroundColor: "#f0f0f0",
          borderRadius: 20,
          rotation: 0,
          opacity: 1
        },
        {
          id: "main-photo",
          type: "image",
          x: 540,
          y: 900,
          width: 800,
          height: 1200,
          imageUrl: "",
          borderRadius: 10,
          rotation: 0,
          opacity: 1
        },
        {
          id: "caption-text",
          type: "text",
          x: 540,
          y: 1600,
          width: 700,
          height: 100,
          content: "Your photo caption",
          fontSize: 32,
          fontFamily: "Arial",
          color: "#333333",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    },
    {
      id: "sale-promotion",
      name: "Sale Promotion",
      category: "business",
      background: "#000000",
      elements: [
        {
          id: "sale-badge",
          type: "shape",
          x: 540,
          y: 700,
          width: 500,
          height: 500,
          backgroundColor: "#ff4500",
          shape: "circle",
          rotation: 0,
          opacity: 0.9
        },
        {
          id: "sale-text",
          type: "text",
          x: 540,
          y: 700,
          width: 400,
          height: 300,
          content: "50% OFF",
          fontSize: 80,
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "promotion-details",
          type: "text",
          x: 540,
          y: 1200,
          width: 800,
          height: 200,
          content: "Limited time offer! Shop now!",
          fontSize: 48,
          fontFamily: "Arial",
          color: "#ffffff",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    },
    {
      id: "question-poll",
      name: "Question Poll",
      category: "engagement",
      background: "#f8f9fa",
      elements: [
        {
          id: "question-text",
          type: "text",
          x: 540,
          y: 700,
          width: 900,
          height: 200,
          content: "What's your favorite?",
          fontSize: 60,
          fontFamily: "Arial",
          color: "#212529",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "option-a-box",
          type: "shape",
          x: 540,
          y: 1000,
          width: 800,
          height: 120,
          backgroundColor: "#e9ecef",
          borderRadius: 60,
          rotation: 0,
          opacity: 1
        },
        {
          id: "option-a-text",
          type: "text",
          x: 540,
          y: 1000,
          width: 700,
          height: 100,
          content: "Option A",
          fontSize: 36,
          fontFamily: "Arial",
          color: "#212529",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        },
        {
          id: "option-b-box",
          type: "shape",
          x: 540,
          y: 1200,
          width: 800,
          height: 120,
          backgroundColor: "#e9ecef",
          borderRadius: 60,
          rotation: 0,
          opacity: 1
        },
        {
          id: "option-b-text",
          type: "text",
          x: 540,
          y: 1200,
          width: 700,
          height: 100,
          content: "Option B",
          fontSize: 36,
          fontFamily: "Arial",
          color: "#212529",
          backgroundColor: "transparent",
          rotation: 0,
          opacity: 1
        }
      ]
    }
  ];
  
  // Get template categories
  const categories = ["all", ...new Set(templates.map(t => t.category))];
  
  // Filter templates by category
  const filteredTemplates = selectedCategory === "all" 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);
  
  // Initialize with first template
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplateId) {
      setSelectedTemplateId(templates[0].id);
      setCustomizedTemplate(JSON.parse(JSON.stringify(templates[0])));
    }
  }, []);
  
  // Update customized template when template selection changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Deep clone the template to avoid modifying the original
        setCustomizedTemplate(JSON.parse(JSON.stringify(template)));
        setSelectedElementId(null);
      }
    }
  }, [selectedTemplateId]);
  
  // Render template to canvas when customized template changes
  useEffect(() => {
    if (customizedTemplate) {
      renderTemplate();
    }
  }, [customizedTemplate, userImages, scale]);
  
  // Render the template to canvas
  const renderTemplate = () => {
    const canvas = canvasRef.current;
    if (!canvas || !customizedTemplate) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (customizedTemplate.background.startsWith("linear-gradient")) {
      // Parse gradient
      const gradientMatch = customizedTemplate.background.match(/linear-gradient\((.*?),\s*(.*?),\s*(.*?)\)/);
      if (gradientMatch) {
        const angle = gradientMatch[1];
        const color1 = gradientMatch[2];
        const color2 = gradientMatch[3];
        
        // Convert angle to radians and calculate start/end points
        const angleRad = parseInt(angle) * (Math.PI / 180);
        const gradient = ctx.createLinearGradient(
          canvas.width / 2 - Math.cos(angleRad) * canvas.width,
          canvas.height / 2 - Math.sin(angleRad) * canvas.height,
          canvas.width / 2 + Math.cos(angleRad) * canvas.width,
          canvas.height / 2 + Math.sin(angleRad) * canvas.height
        );
        
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = "#ffffff"; // Fallback
      }
    } else {
      ctx.fillStyle = customizedTemplate.background;
    }
    
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw elements
    for (const element of customizedTemplate.elements) {
      ctx.save();
      
      // Apply element transformations
      ctx.globalAlpha = element.opacity !== undefined ? element.opacity : 1;
      
      // Translate to rotation center
      ctx.translate(element.x, element.y);
      
      // Apply rotation if specified
      if (element.rotation) {
        ctx.rotate(element.rotation * Math.PI / 180);
      }
      
      // Draw based on element type
      switch (element.type) {
        case "text":
          drawTextElement(ctx, element);
          break;
        case "image":
          drawImageElement(ctx, element);
          break;
        case "shape":
          drawShapeElement(ctx, element);
          break;
      }
      
      // Draw selection indicator if this element is selected
      if (selectedElementId === element.id) {
        ctx.strokeStyle = "#2196F3";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        const halfWidth = element.width / 2;
        const halfHeight = element.height / 2;
        ctx.strokeRect(-halfWidth, -halfHeight, element.width, element.height);
      }
      
      ctx.restore();
    }
  };
  
  // Draw text element
  const drawTextElement = (ctx: CanvasRenderingContext2D, element: TemplateElement) => {
    if (!element.content) return;
    
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    
    // Draw background if specified
    if (element.backgroundColor && element.backgroundColor !== "transparent") {
      ctx.fillStyle = element.backgroundColor;
      ctx.fillRect(-halfWidth, -halfHeight, element.width, element.height);
    }
    
    // Draw text
    ctx.fillStyle = element.color || "#000000";
    ctx.font = `${element.fontSize || 16}px ${element.fontFamily || "Arial"}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Handle multi-line text
    const lines = element.content.split("\n");
    const lineHeight = (element.fontSize || 16) * 1.2;
    
    lines.forEach((line, index) => {
      const yOffset = (index - (lines.length - 1) / 2) * lineHeight;
      ctx.fillText(line, 0, yOffset);
    });
  };
  
  // Draw image element
  const drawImageElement = (ctx: CanvasRenderingContext2D, element: TemplateElement) => {
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    
    // Check if user has uploaded an image for this element
    const imageUrl = userImages[element.id] || element.imageUrl;
    
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      
      if (img.complete) {
        // Draw image with border radius if specified
        if (element.borderRadius && element.borderRadius > 0) {
          ctx.beginPath();
          ctx.moveTo(-halfWidth + element.borderRadius, -halfHeight);
          ctx.lineTo(-halfWidth + element.width - element.borderRadius, -halfHeight);
          ctx.quadraticCurveTo(-halfWidth + element.width, -halfHeight, -halfWidth + element.width, -halfHeight + element.borderRadius);
          ctx.lineTo(-halfWidth + element.width, -halfHeight + element.height - element.borderRadius);
          ctx.quadraticCurveTo(-halfWidth + element.width, -halfHeight + element.height, -halfWidth + element.width - element.borderRadius, -halfHeight + element.height);
          ctx.lineTo(-halfWidth + element.borderRadius, -halfHeight + element.height);
          ctx.quadraticCurveTo(-halfWidth, -halfHeight + element.height, -halfWidth, -halfHeight + element.height - element.borderRadius);
          ctx.lineTo(-halfWidth, -halfHeight + element.borderRadius);
          ctx.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + element.borderRadius, -halfHeight);
          ctx.closePath();
          ctx.clip();
        }
        
        ctx.drawImage(img, -halfWidth, -halfHeight, element.width, element.height);
      } else {
        // Draw placeholder if image is not loaded
        ctx.fillStyle = "#e0e0e0";
        ctx.fillRect(-halfWidth, -halfHeight, element.width, element.height);
        
        ctx.fillStyle = "#9e9e9e";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Image", 0, 0);
        
        // Load image for next render
        img.onload = renderTemplate;
      }
    } else {
      // Draw placeholder for empty image slot
      ctx.fillStyle = "#e0e0e0";
      ctx.fillRect(-halfWidth, -halfHeight, element.width, element.height);
      
      ctx.fillStyle = "#9e9e9e";
      ctx.font = "16px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("Click to add image", 0, 0);
    }
  };
  
  // Draw shape element
  const drawShapeElement = (ctx: CanvasRenderingContext2D, element: TemplateElement) => {
    const halfWidth = element.width / 2;
    const halfHeight = element.height / 2;
    
    ctx.fillStyle = element.backgroundColor || "#000000";
    
    if (element.shape === "circle") {
      const radius = Math.min(element.width, element.height) / 2;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (element.borderRadius && element.borderRadius > 0) {
      // Rounded rectangle
      ctx.beginPath();
      ctx.moveTo(-halfWidth + element.borderRadius, -halfHeight);
      ctx.lineTo(-halfWidth + element.width - element.borderRadius, -halfHeight);
      ctx.quadraticCurveTo(-halfWidth + element.width, -halfHeight, -halfWidth + element.width, -halfHeight + element.borderRadius);
      ctx.lineTo(-halfWidth + element.width, -halfHeight + element.height - element.borderRadius);
      ctx.quadraticCurveTo(-halfWidth + element.width, -halfHeight + element.height, -halfWidth + element.width - element.borderRadius, -halfHeight + element.height);
      ctx.lineTo(-halfWidth + element.borderRadius, -halfHeight + element.height);
      ctx.quadraticCurveTo(-halfWidth, -halfHeight + element.height, -halfWidth, -halfHeight + element.height - element.borderRadius);
      ctx.lineTo(-halfWidth, -halfHeight + element.borderRadius);
      ctx.quadraticCurveTo(-halfWidth, -halfHeight, -halfWidth + element.borderRadius, -halfHeight);
      ctx.closePath();
      ctx.fill();
    } else {
      // Regular rectangle
      ctx.fillRect(-halfWidth, -halfHeight, element.width, element.height);
    }
  };
  
  // Handle element selection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!customizedTemplate || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate click position in canvas coordinates
    const x = (e.clientX - rect.left) * (canvas.width / (rect.width));
    const y = (e.clientY - rect.top) * (canvas.height / (rect.height));
    
    // Check if click is on any element (in reverse order to select top elements first)
    for (let i = customizedTemplate.elements.length - 1; i >= 0; i--) {
      const element = customizedTemplate.elements[i];
      
      // Calculate element bounds
      const halfWidth = element.width / 2;
      const halfHeight = element.height / 2;
      
      const left = element.x - halfWidth;
      const right = element.x + halfWidth;
      const top = element.y - halfHeight;
      const bottom = element.y + halfHeight;
      
      if (x >= left && x <= right && y >= top && y <= bottom) {
        setSelectedElementId(element.id);
        
        // If it's an image element without an image, open file dialog
        if (element.type === "image" && !userImages[element.id] && !element.imageUrl) {
          fileInputRef.current?.click();
        }
        
        return;
      }
    }
    
    // If click is not on any element, deselect
    setSelectedElementId(null);
  };
  
  // Update element text content
  const updateElementText = (text: string) => {
    if (!customizedTemplate || !selectedElementId) return;
    
    const updatedTemplate = { ...customizedTemplate };
    const elementIndex = updatedTemplate.elements.findIndex(e => e.id === selectedElementId);
    
    if (elementIndex !== -1 && updatedTemplate.elements[elementIndex].type === "text") {
      updatedTemplate.elements[elementIndex].content = text;
      setCustomizedTemplate(updatedTemplate);
    }
  };
  
  // Update element color
  const updateElementColor = (color: string) => {
    if (!customizedTemplate || !selectedElementId) return;
    
    const updatedTemplate = { ...customizedTemplate };
    const elementIndex = updatedTemplate.elements.findIndex(e => e.id === selectedElementId);
    
    if (elementIndex !== -1) {
      if (updatedTemplate.elements[elementIndex].type === "text") {
        updatedTemplate.elements[elementIndex].color = color;
      } else if (updatedTemplate.elements[elementIndex].type === "shape") {
        updatedTemplate.elements[elementIndex].backgroundColor = color;
      }
      setCustomizedTemplate(updatedTemplate);
    }
  };
  
  // Update element font size
  const updateElementFontSize = (size: number) => {
    if (!customizedTemplate || !selectedElementId) return;
    
    const updatedTemplate = { ...customizedTemplate };
    const elementIndex = updatedTemplate.elements.findIndex(e => e.id === selectedElementId);
    
    if (elementIndex !== -1 && updatedTemplate.elements[elementIndex].type === "text") {
      updatedTemplate.elements[elementIndex].fontSize = size;
      setCustomizedTemplate(updatedTemplate);
    }
  };
  
  // Update element font family
  const updateElementFontFamily = (fontFamily: string) => {
    if (!customizedTemplate || !selectedElementId) return;
    
    const updatedTemplate = { ...customizedTemplate };
    const elementIndex = updatedTemplate.elements.findIndex(e => e.id === selectedElementId);
    
    if (elementIndex !== -1 && updatedTemplate.elements[elementIndex].type === "text") {
      updatedTemplate.elements[elementIndex].fontFamily = fontFamily;
      setCustomizedTemplate(updatedTemplate);
    }
  };
  
  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedElementId) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setUserImages({
          ...userImages,
          [selectedElementId]: event.target.result as string
        });
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Download story as image
  const downloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `instagram-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Download Complete",
        description: "Instagram story template downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download Instagram story template",
        variant: "destructive"
      });
    }
  };
  
  // Get selected element
  const getSelectedElement = (): TemplateElement | null => {
    if (!customizedTemplate || !selectedElementId) return null;
    return customizedTemplate.elements.find(e => e.id === selectedElementId) || null;
  };
  
  const selectedElement = getSelectedElement();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          <span>Instagram Story Templates</span>
        </CardTitle>
        <CardDescription>
          Create beautiful Instagram stories with customizable templates
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="editor">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>
          
          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div 
                  key={template.id} 
                  className={`border rounded-lg p-2 cursor-pointer transition-all ${selectedTemplateId === template.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedTemplateId(template.id)}
                >
                  <div 
                    className="w-full aspect-[9/16] mb-2 rounded overflow-hidden"
                    style={{
                      background: template.background,
                      position: 'relative'
                    }}
                  >
                    {/* Simple template preview */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm font-medium truncate">{template.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{template.category}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          {/* Editor Tab */}
          <TabsContent value="editor" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Canvas Preview */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border rounded-lg p-4 flex justify-center bg-gray-50 dark:bg-gray-900">
                  <div className="relative">
                    <canvas 
                      ref={canvasRef} 
                      onClick={handleCanvasClick}
                      style={{
                        width: `${canvasWidth * scale}px`,
                        height: `${canvasHeight * scale}px`,
                        cursor: 'pointer'
                      }}
                      className="border shadow-sm"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="space-y-2">
                    <Label htmlFor="zoom">Zoom: {Math.round(scale * 100)}%</Label>
                    <Slider
                      id="zoom"
                      min={0.1}
                      max={0.5}
                      step={0.05}
                      value={[scale]}
                      onValueChange={(values) => setScale(values[0])}
                      className="w-[200px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={downloadStory}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Story
                  </Button>
                </div>
              </div>
              
              {/* Element Editor */}
              <div className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <PanelLeft className="h-4 w-4" />
                    Element Editor
                  </h3>
                  
                  {selectedElement ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <p className="font-medium capitalize">{selectedElement.type} Element</p>
                      </div>
                      
                      {selectedElement.type === "text" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="text-content">Text Content</Label>
                            <Textarea
                              id="text-content"
                              value={selectedElement.content || ""}
                              onChange={(e) => updateElementText(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="font-size">Font Size: {selectedElement.fontSize}px</Label>
                            <Slider
                              id="font-size"
                              min={12}
                              max={120}
                              step={1}
                              value={[selectedElement.fontSize || 16]}
                              onValueChange={(values) => updateElementFontSize(values[0])}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="font-family">Font Family</Label>
                            <Select 
                              value={selectedElement.fontFamily || "Arial"} 
                              onValueChange={updateElementFontFamily}
                            >
                              <SelectTrigger id="font-family">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Arial">Arial</SelectItem>
                                <SelectItem value="Verdana">Verdana</SelectItem>
                                <SelectItem value="Helvetica">Helvetica</SelectItem>
                                <SelectItem value="Times New Roman">Times New Roman</SelectItem>
                                <SelectItem value="Courier New">Courier New</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="text-color">Text Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="text-color"
                                type="color"
                                value={selectedElement.color || "#000000"}
                                onChange={(e) => updateElementColor(e.target.value)}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                type="text"
                                value={selectedElement.color || "#000000"}
                                onChange={(e) => updateElementColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {selectedElement.type === "image" && (
                        <div className="space-y-4">
                          <Button 
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            className="w-full flex items-center gap-2"
                          >
                            <Image className="h-4 w-4" />
                            {userImages[selectedElement.id] ? "Change Image" : "Upload Image"}
                          </Button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                      )}
                      
                      {selectedElement.type === "shape" && (
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="shape-color">Shape Color</Label>
                            <div className="flex gap-2">
                              <Input
                                id="shape-color"
                                type="color"
                                value={selectedElement.backgroundColor || "#000000"}
                                onChange={(e) => updateElementColor(e.target.value)}
                                className="w-12 h-10 p-1"
                              />
                              <Input
                                type="text"
                                value={selectedElement.backgroundColor || "#000000"}
                                onChange={(e) => updateElementColor(e.target.value)}
                                className="flex-1"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Select an element on the canvas to edit</p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    Template Settings
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={customizedTemplate?.name || ""}
                        onChange={(e) => {
                          if (customizedTemplate) {
                            setCustomizedTemplate({
                              ...customizedTemplate,
                              name: e.target.value
                            });
                          }
                        }}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="background-color">Background Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="background-color"
                          type="color"
                          value={customizedTemplate?.background || "#ffffff"}
                          onChange={(e) => {
                            if (customizedTemplate) {
                              setCustomizedTemplate({
                                ...customizedTemplate,
                                background: e.target.value
                              });
                            }
                          }}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          type="text"
                          value={customizedTemplate?.background || "#ffffff"}
                          onChange={(e) => {
                            if (customizedTemplate) {
                              setCustomizedTemplate({
                                ...customizedTemplate,
                                background: e.target.value
                              });
                            }
                          }}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InstagramStoryTemplates;