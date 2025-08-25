import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, RefreshCw, Palette, Layers, ArrowRight, Plus, Minus, Trash2 } from "lucide-react";

const GradientGenerator = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeTab, setActiveTab] = useState<string>("linear");
  
  // Gradient colors
  const [colors, setColors] = useState<{color: string, position: number}[]>([
    { color: "#ff5f6d", position: 0 },
    { color: "#ffc371", position: 100 }
  ]);
  
  // Gradient properties
  const [angle, setAngle] = useState<number>(90);
  const [centerX, setCenterX] = useState<number>(50);
  const [centerY, setCenterY] = useState<number>(50);
  const [shape, setShape] = useState<"circle" | "ellipse">("circle");
  const [cssCode, setCssCode] = useState<string>("");
  
  // Add a new color stop
  const addColorStop = () => {
    if (colors.length >= 10) {
      toast({
        title: "Maximum colors reached",
        description: "You can add up to 10 color stops",
        variant: "destructive"
      });
      return;
    }
    
    // Find a position between existing colors
    const positions = colors.map(c => c.position).sort((a, b) => a - b);
    let newPosition = 50;
    
    if (positions.length >= 2) {
      // Find the largest gap between positions
      let maxGap = 0;
      let gapPosition = 50;
      
      for (let i = 0; i < positions.length - 1; i++) {
        const gap = positions[i + 1] - positions[i];
        if (gap > maxGap) {
          maxGap = gap;
          gapPosition = positions[i] + gap / 2;
        }
      }
      
      newPosition = Math.round(gapPosition);
    }
    
    // Generate a random color
    const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
    
    setColors([...colors, { color: randomColor, position: newPosition }]);
  };
  
  // Remove a color stop
  const removeColorStop = (index: number) => {
    if (colors.length <= 2) {
      toast({
        title: "Minimum colors required",
        description: "You need at least 2 color stops",
        variant: "destructive"
      });
      return;
    }
    
    const newColors = [...colors];
    newColors.splice(index, 1);
    setColors(newColors);
  };
  
  // Update color
  const updateColor = (index: number, newColor: string) => {
    const newColors = [...colors];
    newColors[index].color = newColor;
    setColors(newColors);
  };
  
  // Update position
  const updatePosition = (index: number, newPosition: number) => {
    const newColors = [...colors];
    newColors[index].position = newPosition;
    setColors(newColors);
  };
  
  // Generate random gradient
  const generateRandomGradient = () => {
    // Generate 2-4 random colors
    const numColors = Math.floor(Math.random() * 3) + 2; // 2 to 4 colors
    const newColors = [];
    
    for (let i = 0; i < numColors; i++) {
      const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
      const position = i === 0 ? 0 : i === numColors - 1 ? 100 : Math.floor(Math.random() * 80) + 10;
      newColors.push({ color: randomColor, position });
    }
    
    // Sort by position
    newColors.sort((a, b) => a.position - b.position);
    
    // Random angle for linear gradient
    const randomAngle = Math.floor(Math.random() * 360);
    
    // Random center for radial gradient
    const randomCenterX = Math.floor(Math.random() * 100);
    const randomCenterY = Math.floor(Math.random() * 100);
    
    setColors(newColors);
    setAngle(randomAngle);
    setCenterX(randomCenterX);
    setCenterY(randomCenterY);
    setShape(Math.random() > 0.5 ? "circle" : "ellipse");
  };
  
  // Generate CSS code
  const generateCssCode = () => {
    // Sort colors by position
    const sortedColors = [...colors].sort((a, b) => a.position - b.position);
    
    let gradientString = "";
    
    if (activeTab === "linear") {
      gradientString = `background: linear-gradient(${angle}deg, ${sortedColors.map(c => `${c.color} ${c.position}%`).join(', ')});`;
    } else {
      gradientString = `background: radial-gradient(${shape} at ${centerX}% ${centerY}%, ${sortedColors.map(c => `${c.color} ${c.position}%`).join(', ')});`;
    }
    
    setCssCode(gradientString);
    return gradientString;
  };
  
  // Copy CSS code to clipboard
  const copyCssCode = () => {
    const code = generateCssCode();
    navigator.clipboard.writeText(code);
    toast({
      title: "CSS Copied",
      description: "CSS code copied to clipboard"
    });
  };
  
  // Download gradient as image
  const downloadGradient = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `gradient-${activeTab}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Download Complete",
        description: "Gradient image downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download gradient image",
        variant: "destructive"
      });
    }
  };
  
  // Render gradient to canvas
  const renderGradient = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Sort colors by position
    const sortedColors = [...colors].sort((a, b) => a.position - b.position);
    
    // Create gradient
    let gradient;
    
    if (activeTab === "linear") {
      // Convert angle to radians and calculate start/end points
      const angleRad = (angle - 90) * (Math.PI / 180);
      const startX = canvas.width / 2 - Math.cos(angleRad) * canvas.width;
      const startY = canvas.height / 2 - Math.sin(angleRad) * canvas.height;
      const endX = canvas.width / 2 + Math.cos(angleRad) * canvas.width;
      const endY = canvas.height / 2 + Math.sin(angleRad) * canvas.height;
      
      gradient = ctx.createLinearGradient(startX, startY, endX, endY);
    } else {
      // Radial gradient
      const x = (centerX / 100) * canvas.width;
      const y = (centerY / 100) * canvas.height;
      
      let radiusX, radiusY;
      
      if (shape === "circle") {
        const maxRadius = Math.max(canvas.width, canvas.height);
        radiusX = radiusY = maxRadius;
      } else {
        radiusX = canvas.width;
        radiusY = canvas.height;
      }
      
      gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(radiusX, radiusY));
    }
    
    // Add color stops
    sortedColors.forEach(colorStop => {
      gradient.addColorStop(colorStop.position / 100, colorStop.color);
    });
    
    // Fill canvas with gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Generate CSS code
    generateCssCode();
  };
  
  // Update canvas size on window resize
  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas size to match its display size
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      renderGradient();
    };
    
    window.addEventListener("resize", updateCanvasSize);
    updateCanvasSize();
    
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);
  
  // Re-render gradient when parameters change
  useEffect(() => {
    renderGradient();
  }, [colors, angle, centerX, centerY, shape, activeTab]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          <span>Gradient Generator</span>
        </CardTitle>
        <CardDescription>
          Create beautiful CSS gradients for your web projects
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Gradient Preview */}
        <div className="relative w-full h-64 rounded-lg overflow-hidden border">
          <canvas 
            ref={canvasRef} 
            className="w-full h-full"
          />
          
          <div className="absolute top-2 right-2 flex gap-2">
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={copyCssCode}
              className="bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button 
              variant="secondary" 
              size="icon" 
              onClick={downloadGradient}
              className="bg-white/80 hover:bg-white/90 dark:bg-gray-800/80 dark:hover:bg-gray-800/90"
            >
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* CSS Code */}
        <div className="p-3 bg-muted rounded-md font-mono text-sm overflow-x-auto">
          {cssCode}
        </div>
        
        {/* Gradient Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="linear" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              Linear Gradient
            </TabsTrigger>
            <TabsTrigger value="radial" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Radial Gradient
            </TabsTrigger>
          </TabsList>
          
          {/* Linear Gradient Controls */}
          <TabsContent value="linear" className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="angle">Angle: {angle}°</Label>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setAngle(90)}
                >
                  Reset
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <Slider
                  id="angle"
                  min={0}
                  max={360}
                  step={1}
                  value={[angle]}
                  onValueChange={(values) => setAngle(values[0])}
                />
                <Input 
                  type="number" 
                  value={angle} 
                  onChange={(e) => setAngle(Number(e.target.value))} 
                  min={0} 
                  max={360}
                  className="w-20"
                />
              </div>
            </div>
          </TabsContent>
          
          {/* Radial Gradient Controls */}
          <TabsContent value="radial" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="centerX">Center X: {centerX}%</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="centerX"
                    min={0}
                    max={100}
                    step={1}
                    value={[centerX]}
                    onValueChange={(values) => setCenterX(values[0])}
                  />
                  <Input 
                    type="number" 
                    value={centerX} 
                    onChange={(e) => setCenterX(Number(e.target.value))} 
                    min={0} 
                    max={100}
                    className="w-20"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="centerY">Center Y: {centerY}%</Label>
                <div className="flex items-center gap-4">
                  <Slider
                    id="centerY"
                    min={0}
                    max={100}
                    step={1}
                    value={[centerY]}
                    onValueChange={(values) => setCenterY(values[0])}
                  />
                  <Input 
                    type="number" 
                    value={centerY} 
                    onChange={(e) => setCenterY(Number(e.target.value))} 
                    min={0} 
                    max={100}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Label htmlFor="shape">Shape:</Label>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="circle"
                    value="circle"
                    checked={shape === "circle"}
                    onChange={() => setShape("circle")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="circle">Circle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="ellipse"
                    value="ellipse"
                    checked={shape === "ellipse"}
                    onChange={() => setShape("ellipse")}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="ellipse">Ellipse</Label>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Color Stops */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Color Stops</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addColorStop}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Color
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateRandomGradient}
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Random
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {colors.map((colorStop, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-md border flex-shrink-0"
                  style={{ backgroundColor: colorStop.color }}
                />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={colorStop.color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="w-16 h-8"
                    />
                    <Input
                      type="text"
                      value={colorStop.color}
                      onChange={(e) => updateColor(index, e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="w-16">Position:</Label>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[colorStop.position]}
                      onValueChange={(values) => updatePosition(index, values[0])}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      value={colorStop.position}
                      onChange={(e) => updatePosition(index, Number(e.target.value))}
                      min={0}
                      max={100}
                      className="w-16"
                    />
                    <span className="text-sm">%</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeColorStop(index)}
                  disabled={colors.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GradientGenerator;