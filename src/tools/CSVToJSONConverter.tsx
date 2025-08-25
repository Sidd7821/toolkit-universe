import { useState } from "react";
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
  FileText, 
  Download, 
  Upload, 
  Copy, 
  Settings, 
  Info,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CSVOptions {
  delimiter: string;
  hasHeader: boolean;
  trimWhitespace: boolean;
  removeEmptyRows: boolean;
  prettyPrint: boolean;
}

const CSVToJSONConverter = () => {
  const { toast } = useToast();
  const [csvInput, setCsvInput] = useState("");
  const [jsonOutput, setJsonOutput] = useState("");
  const [fileName, setFileName] = useState("converted-data");
  const [options, setOptions] = useState<CSVOptions>({
    delimiter: ",",
    hasHeader: true,
    trimWhitespace: true,
    removeEmptyRows: true,
    prettyPrint: true
  });
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [error, setError] = useState<string>("");

  const parseCSV = (csv: string, options: CSVOptions) => {
    try {
      const lines = csv.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error("No data found in CSV");
      }

      let data: any[] = [];
      let headers: string[] = [];

      if (options.hasHeader) {
        headers = lines[0].split(options.delimiter).map(h => 
          options.trimWhitespace ? h.trim() : h
        );
        lines.shift();
      } else {
        // Generate headers if none provided
        const firstLine = lines[0].split(options.delimiter);
        headers = firstLine.map((_, index) => `Column${index + 1}`);
      }

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (options.removeEmptyRows && line.trim() === '') continue;
        
        const values = line.split(options.delimiter).map(v => 
          options.trimWhitespace ? v.trim() : v
        );
        
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });
        
        data.push(row);
      }

      return data;
    } catch (err) {
      throw new Error(`Error parsing CSV: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const convertCSVToJSON = () => {
    if (!csvInput.trim()) {
      setError("Please enter CSV data");
      return;
    }

    try {
      setError("");
      const data = parseCSV(csvInput, options);
      setPreviewData(data.slice(0, 5)); // Show first 5 rows for preview
      
      const jsonString = options.prettyPrint 
        ? JSON.stringify(data, null, 2)
        : JSON.stringify(data);
      
      setJsonOutput(jsonString);
      
      toast({
        title: "Conversion Successful",
        description: `Converted ${data.length} rows from CSV to JSON`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversion failed';
      setError(errorMessage);
      setJsonOutput("");
      setPreviewData([]);
      
      toast({
        title: "Conversion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
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
      setCsvInput(content);
      setFileName(file.name.replace('.csv', ''));
    };
    reader.readAsText(file);
  };

  const copyToClipboard = () => {
    if (jsonOutput) {
      navigator.clipboard.writeText(jsonOutput);
      toast({
        title: "Copied!",
        description: "JSON data copied to clipboard",
      });
    }
  };

  const downloadJSON = () => {
    if (!jsonOutput) return;
    
    const blob = new Blob([jsonOutput], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded!",
      description: "JSON file saved successfully",
    });
  };

  const clearData = () => {
    setCsvInput("");
    setJsonOutput("");
    setPreviewData([]);
    setError("");
    setFileName("converted-data");
  };

  const getSampleCSV = () => {
    const sample = `Name,Age,City,Occupation
John Doe,30,New York,Engineer
Jane Smith,25,Los Angeles,Designer
Mike Johnson,35,Chicago,Manager
Sarah Wilson,28,Boston,Developer
David Brown,32,Seattle,Analyst`;
    setCsvInput(sample);
    setFileName("sample-data");
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input & Options */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                CSV Input
              </CardTitle>
              <CardDescription>
                Paste your CSV data or upload a CSV file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-input">CSV Data</Label>
                <Textarea
                  id="csv-input"
                  placeholder="Paste your CSV data here...&#10;Name,Age,City&#10;John,30,NYC&#10;Jane,25,LA"
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={getSampleCSV} variant="outline" size="sm">
                  Load Sample
                </Button>
                <Button onClick={clearData} variant="outline" size="sm">
                  Clear
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Conversion Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Delimiter</Label>
                <Select value={options.delimiter} onValueChange={(value) => setOptions(prev => ({ ...prev, delimiter: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=",">Comma (,)</SelectItem>
                    <SelectItem value=";">Semicolon (;)</SelectItem>
                    <SelectItem value="\t">Tab (\t)</SelectItem>
                    <SelectItem value="|">Pipe (|)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="has-header">Has Header Row</Label>
                <Switch
                  id="has-header"
                  checked={options.hasHeader}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, hasHeader: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="trim-whitespace">Trim Whitespace</Label>
                <Switch
                  id="trim-whitespace"
                  checked={options.trimWhitespace}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, trimWhitespace: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="remove-empty">Remove Empty Rows</Label>
                <Switch
                  id="remove-empty"
                  checked={options.removeEmptyRows}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeEmptyRows: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pretty-print">Pretty Print JSON</Label>
                <Switch
                  id="pretty-print"
                  checked={options.prettyPrint}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, prettyPrint: checked }))}
                />
              </div>

              <Button onClick={convertCSVToJSON} className="w-full" size="lg">
                Convert to JSON
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Output & Preview */}
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

          {previewData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Preview ({previewData.length} rows)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0] || {}).map((header) => (
                          <th key={header} className="text-left p-2 font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
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
                </div>
              </CardContent>
            </Card>
          )}

          {jsonOutput && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  JSON Output
                </CardTitle>
                <CardDescription>
                  Your converted JSON data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Output Filename</Label>
                    <Input
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      className="w-32"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>JSON Data</Label>
                  <Textarea
                    value={jsonOutput}
                    readOnly
                    className="min-h-[300px] font-mono text-sm bg-muted"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                  <Button onClick={downloadJSON} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
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
                <p>Paste your CSV data or upload a CSV file</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Configure conversion options like delimiter and headers</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Click convert and preview the results</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Download or copy the JSON output</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CSVToJSONConverter;
