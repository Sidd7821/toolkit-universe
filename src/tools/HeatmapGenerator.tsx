import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, RefreshCw, Grid, Palette } from "lucide-react";

const HeatmapGenerator = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Heatmap data and settings
  const [data, setData] = useState<number[][]>([]);
  const [dataInput, setDataInput] = useState<string>("");
  const [rows, setRows] = useState<number>(10);
  const [columns, setColumns] = useState<number>(10);
  const [colorScheme, setColorScheme] = useState<string>("viridis");
  const [cellSize, setCellSize] = useState<number>(40);
  const [showValues, setShowValues] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("generator");
  
  // Color schemes
  const colorSchemes: Record<string, string[]> = {
    viridis: ["#440154", "#482878", "#3e4989", "#31688e", "#26828e", "#1f9e89", "#35b779", "#6ece58", "#b5de2b", "#fde725"],
    inferno: ["#000004", "#1b0c41", "#4a0c6b", "#781c6d", "#a52c60", "#cf4446", "#ed6925", "#fb9b06", "#f7d13d", "#fcffa4"],
    magma: ["#000004", "#180f3d", "#440f76", "#721f81", "#9e2f7f", "#cd4071", "#f1605d", "#fd9668", "#feca8d", "#fcfdbf"],
    plasma: ["#0d0887", "#41049d", "#6a00a8", "#8f0da4", "#b12a90", "#cc4778", "#e16462", "#f2844b", "#fca636", "#f0f921"],
    blues: ["#f7fbff", "#deebf7", "#c6dbef", "#9ecae1", "#6baed6", "#4292c6", "#2171b5", "#08519c", "#08306b", "#041836"],
    reds: ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d", "#330000"],
    greens: ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b", "#002200"],
    spectral: ["#9e0142", "#d53e4f", "#f46d43", "#fdae61", "#fee08b", "#e6f598", "#abdda4", "#66c2a5", "#3288bd", "#5e4fa2"],
  };
  
  // Initialize with random data
  useEffect(() => {
    generateRandomData();
  }, []);
  
  // Update canvas when data or settings change
  useEffect(() => {
    if (data.length > 0) {
      renderHeatmap();
      updateDataInput();
    }
  }, [data, colorScheme, cellSize, showValues, showGrid]);
  
  // Generate random data
  const generateRandomData = () => {
    const newData: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < columns; j++) {
        row.push(Math.floor(Math.random() * 100));
      }
      newData.push(row);
    }
    
    setData(newData);
  };
  
  // Update text area with current data
  const updateDataInput = () => {
    setDataInput(data.map(row => row.join("\t")).join("\n"));
  };
  
  // Parse data from text input
  const parseDataInput = () => {
    try {
      const lines = dataInput.trim().split("\n");
      const newData: number[][] = [];
      
      for (const line of lines) {
        const values = line.split(/[\t,;\s]+/).map(val => {
          const num = parseFloat(val.trim());
          if (isNaN(num)) throw new Error("Invalid number");
          return num;
        });
        
        if (values.length === 0) continue;
        newData.push(values);
      }
      
      // Validate data structure
      if (newData.length === 0) throw new Error("No data found");
      
      const firstRowLength = newData[0].length;
      if (firstRowLength === 0) throw new Error("No columns found");
      
      // Check if all rows have the same number of columns
      for (let i = 1; i < newData.length; i++) {
        if (newData[i].length !== firstRowLength) {
          throw new Error(`Row ${i + 1} has ${newData[i].length} columns, but should have ${firstRowLength}`);
        }
      }
      
      setRows(newData.length);
      setColumns(firstRowLength);
      setData(newData);
      
      toast({
        title: "Data Parsed Successfully",
        description: `Loaded ${newData.length} rows and ${firstRowLength} columns`
      });
    } catch (error) {
      toast({
        title: "Error Parsing Data",
        description: error instanceof Error ? error.message : "Invalid data format",
        variant: "destructive"
      });
    }
  };
  
  // Get color for a value
  const getColor = (value: number): string => {
    const colors = colorSchemes[colorScheme] || colorSchemes.viridis;
    
    // Find min and max values in data
    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    
    for (const row of data) {
      for (const cell of row) {
        min = Math.min(min, cell);
        max = Math.max(max, cell);
      }
    }
    
    // Normalize value between 0 and 1
    const normalized = max === min ? 0.5 : (value - min) / (max - min);
    
    // Map to color index
    const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
    return colors[index];
  };
  
  // Render heatmap to canvas
  const renderHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions
    const width = columns * cellSize;
    const height = rows * cellSize;
    
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw cells
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[i].length; j++) {
        const value = data[i][j];
        const x = j * cellSize;
        const y = i * cellSize;
        
        // Draw cell background
        ctx.fillStyle = getColor(value);
        ctx.fillRect(x, y, cellSize, cellSize);
        
        // Draw grid lines
        if (showGrid) {
          ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellSize, cellSize);
        }
        
        // Draw value text
        if (showValues) {
          ctx.fillStyle = getBrightness(getColor(value)) < 128 ? "white" : "black";
          ctx.font = `${Math.max(10, Math.min(16, cellSize / 2))}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(value.toString(), x + cellSize / 2, y + cellSize / 2);
        }
      }
    }
  };
  
  // Calculate brightness of a color (for text contrast)
  const getBrightness = (color: string): number => {
    // Remove # if present
    const hex = color.replace("#", "");
    
    // Parse RGB components
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    return 0.299 * r + 0.587 * g + 0.114 * b;
  };
  
  // Download heatmap as image
  const downloadHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `heatmap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Download Complete",
        description: "Heatmap image downloaded successfully"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download heatmap image",
        variant: "destructive"
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        setDataInput(content);
        parseDataInput();
      }
    };
    reader.onerror = () => {
      toast({
        title: "File Read Error",
        description: "Failed to read the uploaded file",
        variant: "destructive"
      });
    };
    reader.readAsText(file);
  };
  
  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  // Update grid dimensions
  const updateGridDimensions = () => {
    const newData: number[][] = [];
    
    for (let i = 0; i < rows; i++) {
      const row: number[] = [];
      for (let j = 0; j < columns; j++) {
        // Preserve existing data if available
        row.push(i < data.length && j < data[i].length ? data[i][j] : 0);
      }
      newData.push(row);
    }
    
    setData(newData);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid className="h-5 w-5" />
          <span>Heatmap Generator</span>
        </CardTitle>
        <CardDescription>
          Create customizable heatmaps from your data
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="generator">Generator</TabsTrigger>
            <TabsTrigger value="data">Data Input</TabsTrigger>
          </TabsList>
          
          {/* Generator Tab */}
          <TabsContent value="generator" className="space-y-6">
            {/* Heatmap Preview */}
            <div className="overflow-auto border rounded-lg p-4">
              <div className="flex justify-center">
                <canvas 
                  ref={canvasRef} 
                  className="max-w-full"
                />
              </div>
            </div>
            
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(colorSchemes).map((scheme) => (
                        <SelectItem key={scheme} value={scheme}>
                          <div className="flex items-center gap-2">
                            <div className="flex h-4 w-20">
                              {colorSchemes[scheme].map((color, i) => (
                                <div 
                                  key={i} 
                                  style={{ backgroundColor: color, width: `${100 / colorSchemes[scheme].length}%` }}
                                  className="h-full"
                                />
                              ))}
                            </div>
                            <span className="capitalize">{scheme}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="cellSize">Cell Size: {cellSize}px</Label>
                  </div>
                  <Slider
                    id="cellSize"
                    min={20}
                    max={100}
                    step={5}
                    value={[cellSize]}
                    onValueChange={(values) => setCellSize(values[0])}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showValues"
                    checked={showValues}
                    onChange={(e) => setShowValues(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="showValues">Show Values</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showGrid"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="showGrid">Show Grid Lines</Label>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rows">Rows</Label>
                    <div className="flex gap-2">
                      <Input
                        id="rows"
                        type="number"
                        min={1}
                        max={50}
                        value={rows}
                        onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="columns">Columns</Label>
                    <div className="flex gap-2">
                      <Input
                        id="columns"
                        type="number"
                        min={1}
                        max={50}
                        value={columns}
                        onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={updateGridDimensions}
                  variant="outline"
                  className="w-full"
                >
                  Update Grid Size
                </Button>
                
                <Button 
                  onClick={generateRandomData}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  Generate Random Data
                </Button>
                
                <Button 
                  onClick={downloadHeatmap}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download as PNG
                </Button>
              </div>
            </div>
          </TabsContent>
          
          {/* Data Input Tab */}
          <TabsContent value="data" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="dataInput">Enter Data (tab, comma, or space separated)</Label>
              <Textarea
                id="dataInput"
                value={dataInput}
                onChange={(e) => setDataInput(e.target.value)}
                rows={10}
                className="font-mono"
                placeholder="10\t15\t20\n25\t30\t35\n40\t45\t50"
              />
              <p className="text-sm text-muted-foreground">
                Enter your data as a grid with values separated by tabs, commas, or spaces.
                Each row should be on a new line.
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={parseDataInput}
                className="flex-1"
              >
                Apply Data
              </Button>
              
              <Button 
                variant="outline" 
                onClick={triggerFileUpload}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload CSV/TSV
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HeatmapGenerator;