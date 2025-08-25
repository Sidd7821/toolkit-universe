import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  LineChart, 
  PieChart, 
  Download, 
  Upload, 
  Settings, 
  Info,
  CheckCircle,
  AlertCircle,
  Palette,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
  }[];
}

interface ChartOptions {
  type: 'bar' | 'line' | 'pie' | 'doughnut' | 'scatter';
  title: string;
  showLegend: boolean;
  showGrid: boolean;
  responsive: boolean;
  maintainAspectRatio: boolean;
  colors: string[];
}

const DataVisualizer = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rawData, setRawData] = useState("");
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [chartOptions, setChartOptions] = useState<ChartOptions>({
    type: 'bar',
    title: 'Data Visualization',
    showLegend: true,
    showGrid: true,
    responsive: true,
    maintainAspectRatio: false,
    colors: ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']
  });
  const [selectedColumns, setSelectedColumns] = useState<{x: string, y: string}>({ x: '', y: '' });
  const [error, setError] = useState<string>("");
  const [showPreview, setShowPreview] = useState(true);

  const sampleData = `Month,Sales,Profit,Expenses
January,1200,300,900
February,1500,450,1050
March,1800,600,1200
April,1400,350,1050
May,2000,700,1300
June,2200,800,1400`;

  useEffect(() => {
    if (parsedData.length > 0 && selectedColumns.x && selectedColumns.y) {
      generateChart();
    }
  }, [parsedData, selectedColumns, chartOptions]);

  const parseData = (data: string) => {
    try {
      const lines = data.trim().split('\n');
      if (lines.length < 2) {
        throw new Error("Data must have at least a header row and one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          const value = values[index];
          // Try to parse as number, fallback to string
          const numValue = parseFloat(value);
          row[header] = isNaN(numValue) ? value : numValue;
        });
        return row;
      });

      setParsedData(rows);
      setError("");
      
      // Auto-select first two numeric columns
      const numericColumns = headers.filter(header => {
        const firstValue = rows[0]?.[header];
        return typeof firstValue === 'number';
      });
      
      if (numericColumns.length >= 2) {
        setSelectedColumns({ x: numericColumns[0], y: numericColumns[1] });
      } else if (numericColumns.length === 1) {
        setSelectedColumns({ x: headers[0], y: numericColumns[0] });
      } else {
        setSelectedColumns({ x: headers[0], y: headers[1] });
      }

      toast({
        title: "Data Parsed Successfully",
        description: `Parsed ${rows.length} rows with ${headers.length} columns`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to parse data';
      setError(errorMessage);
      setParsedData([]);
      setChartData(null);
      
      toast({
        title: "Parsing Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const generateChart = () => {
    if (!parsedData.length || !selectedColumns.x || !selectedColumns.y) return;

    const xValues = parsedData.map(row => String(row[selectedColumns.x]));
    const yValues = parsedData.map(row => {
      const value = row[selectedColumns.y];
      return typeof value === 'number' ? value : parseFloat(value) || 0;
    });

    const newChartData: ChartData = {
      labels: xValues,
      datasets: [{
        label: selectedColumns.y,
        data: yValues,
        backgroundColor: chartOptions.colors[0] + '80', // Add transparency
        borderColor: chartOptions.colors[0],
        borderWidth: 2
      }]
    };

    setChartData(newChartData);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid File",
        description: "Please select a CSV file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawData(content);
      parseData(content);
    };
    reader.readAsText(file);
  };

  const loadSampleData = () => {
    setRawData(sampleData);
    parseData(sampleData);
  };

  const clearData = () => {
    setRawData("");
    setParsedData([]);
    setChartData(null);
    setError("");
    setSelectedColumns({ x: '', y: '' });
  };

  const downloadChart = () => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const link = document.createElement('a');
    link.download = `${chartOptions.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    link.href = canvas.toDataURL();
    link.click();
    
    toast({
      title: "Chart Downloaded",
      description: "Chart saved as PNG image",
    });
  };

  const renderChart = () => {
    if (!chartData || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const width = canvas.width;
    const height = canvas.height;
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Draw grid
    if (chartOptions.showGrid) {
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      
      // Vertical grid lines
      for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * chartWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, height - padding);
        ctx.stroke();
      }
      
      // Horizontal grid lines
      for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * chartHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
      }
    }

    // Draw chart based on type
    switch (chartOptions.type) {
      case 'bar':
        drawBarChart(ctx, chartData, padding, chartWidth, chartHeight);
        break;
      case 'line':
        drawLineChart(ctx, chartData, padding, chartWidth, chartHeight);
        break;
      case 'pie':
        drawPieChart(ctx, chartData, width / 2, height / 2, Math.min(chartWidth, chartHeight) / 2);
        break;
      case 'scatter':
        drawScatterChart(ctx, chartData, padding, chartWidth, chartHeight);
        break;
    }

    // Draw title
    if (chartOptions.title) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(chartOptions.title, width / 2, 30);
    }

    // Draw legend
    if (chartOptions.showLegend) {
      drawLegend(ctx, chartData, width - 20, 60);
    }
  };

  const drawBarChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, chartWidth: number, chartHeight: number) => {
    const barWidth = chartWidth / data.labels.length * 0.8;
    const barSpacing = chartWidth / data.labels.length * 0.2;
    const canvasHeight = ctx.canvas.height;
    
    data.datasets.forEach((dataset, datasetIndex) => {
      const maxValue = Math.max(...dataset.data);
      const minValue = Math.min(...dataset.data);
      const range = maxValue - minValue;
      
      dataset.data.forEach((value, index) => {
        const x = padding + index * (barWidth + barSpacing) + barSpacing / 2;
        const barHeight = range > 0 ? ((value - minValue) / range) * chartHeight : 0;
        const y = canvasHeight - padding - barHeight;
        
        ctx.fillStyle = dataset.backgroundColor || chartOptions.colors[datasetIndex % chartOptions.colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value label
        ctx.fillStyle = '#374151';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toString(), x + barWidth / 2, y - 5);
      });
    });
  };

  const drawLineChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, chartWidth: number, chartHeight: number) => {
    const canvasHeight = ctx.canvas.height;
    data.datasets.forEach((dataset, datasetIndex) => {
      const maxValue = Math.max(...dataset.data);
      const minValue = Math.min(...dataset.data);
      const range = maxValue - minValue;
      
      ctx.strokeStyle = dataset.borderColor || chartOptions.colors[datasetIndex % chartOptions.colors.length];
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      dataset.data.forEach((value, index) => {
        const x = padding + (index / (data.labels.length - 1)) * chartWidth;
        const y = range > 0 ? canvasHeight - padding - ((value - minValue) / range) * chartHeight : canvasHeight - padding;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    });
  };

  const drawPieChart = (ctx: CanvasRenderingContext2D, data: ChartData, centerX: number, centerY: number, radius: number) => {
    const total = data.datasets[0].data.reduce((sum, value) => sum + value, 0);
    let currentAngle = -Math.PI / 2;
    
    data.datasets[0].data.forEach((value, index) => {
      const sliceAngle = (value / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      
      ctx.fillStyle = chartOptions.colors[index % chartOptions.colors.length];
      ctx.fill();
      
      currentAngle += sliceAngle;
    });
  };

  const drawScatterChart = (ctx: CanvasRenderingContext2D, data: ChartData, padding: number, chartWidth: number, chartHeight: number) => {
    const canvasHeight = ctx.canvas.height;
    data.datasets.forEach((dataset, datasetIndex) => {
      const maxValue = Math.max(...dataset.data);
      const minValue = Math.min(...dataset.data);
      const range = maxValue - minValue;
      
      dataset.data.forEach((value, index) => {
        const x = padding + (index / (data.labels.length - 1)) * chartWidth;
        const y = range > 0 ? canvasHeight - padding - ((value - minValue) / range) * chartHeight : canvasHeight - padding;
        
        ctx.fillStyle = dataset.backgroundColor || chartOptions.colors[datasetIndex % chartOptions.colors.length];
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  };

  const drawLegend = (ctx: CanvasRenderingContext2D, data: ChartData, x: number, y: number) => {
    data.datasets.forEach((dataset, index) => {
      const color = dataset.backgroundColor || chartOptions.colors[index % chartOptions.colors.length];
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y + index * 20, 15, 15);
      
      ctx.fillStyle = '#374151';
      ctx.font = '12px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(dataset.label, x + 20, y + index * 20 + 12);
    });
  };

  useEffect(() => {
    if (chartData) {
      renderChart();
    }
  }, [chartData, chartOptions]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Data Input & Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Input
              </CardTitle>
              <CardDescription>
                Paste your data or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="data-input">Data (CSV format)</Label>
                <Textarea
                  id="data-input"
                  placeholder="Paste your CSV data here...&#10;Column1,Column2,Column3&#10;Value1,Value2,Value3"
                  value={rawData}
                  onChange={(e) => setRawData(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={loadSampleData} variant="outline" size="sm">
                  Load Sample
                </Button>
                <Button onClick={clearData} variant="outline" size="sm">
                  Clear
                </Button>
                <Button onClick={() => parseData(rawData)} size="sm">
                  Parse Data
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file-upload">Or Upload CSV File</Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="cursor-pointer"
                />
              </div>
            </CardContent>
          </Card>

          {parsedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Chart Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Chart Type</Label>
                  <Select value={chartOptions.type} onValueChange={(value: any) => setChartOptions(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="doughnut">Doughnut Chart</SelectItem>
                      <SelectItem value="scatter">Scatter Plot</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>X-Axis Column</Label>
                  <Select value={selectedColumns.x} onValueChange={(value) => setSelectedColumns(prev => ({ ...prev, x: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {parsedData.length > 0 && Object.keys(parsedData[0]).map(column => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Y-Axis Column</Label>
                  <Select value={selectedColumns.y} onValueChange={(value) => setSelectedColumns(prev => ({ ...prev, y: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {parsedData.length > 0 && Object.keys(parsedData[0]).map(column => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Chart Title</Label>
                  <Input
                    value={chartOptions.title}
                    onChange={(e) => setChartOptions(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter chart title"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-legend">Show Legend</Label>
                  <Switch
                    id="show-legend"
                    checked={chartOptions.showLegend}
                    onCheckedChange={(checked) => setChartOptions(prev => ({ ...prev, showLegend: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="show-grid">Show Grid</Label>
                  <Switch
                    id="show-grid"
                    checked={chartOptions.showGrid}
                    onCheckedChange={(checked) => setChartOptions(prev => ({ ...prev, showGrid: checked }))}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Chart Preview */}
        <div className="space-y-6">
          {error && (
            <Card className="border-destructive">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">{error}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {parsedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Data Preview ({parsedData.length} rows)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(parsedData[0] || {}).map((header) => (
                          <th key={header} className="text-left p-2 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedData.slice(0, 5).map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value, cellIndex) => (
                            <td key={cellIndex} className="p-2 text-muted-foreground">
                              {String(value)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {parsedData.length > 5 && (
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Showing first 5 rows of {parsedData.length} total rows
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {chartData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Chart Preview
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPreview(!showPreview)}
                    >
                      {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                      {showPreview ? 'Hide' : 'Show'}
                    </Button>
                    <Button onClick={downloadChart} size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showPreview && (
                  <div className="flex justify-center">
                    <canvas
                      ref={canvasRef}
                      width={600}
                      height={400}
                      className="border rounded-lg shadow-lg bg-white"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How to Use
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Paste CSV data or upload a CSV file</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Select chart type and configure columns</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Customize colors, title, and display options</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Download your chart as an image</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DataVisualizer;
