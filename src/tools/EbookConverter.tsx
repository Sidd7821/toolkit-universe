import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  Download, 
  FileText, 
  BookOpen, 
  Settings, 
  CheckCircle,
  AlertCircle,
  Info,
  RotateCcw,
  Trash2,
  Eye,
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ConversionSettings {
  quality: 'low' | 'medium' | 'high';
  includeImages: boolean;
  preserveFormatting: boolean;
  generateTOC: boolean;
  pageSize: 'A4' | 'Letter' | 'Custom';
  customWidth?: number;
  customHeight?: number;
}

interface ConversionJob {
  id: string;
  fileName: string;
  sourceFormat: string;
  targetFormat: string;
  progress: number;
  status: 'pending' | 'converting' | 'completed' | 'failed';
  error?: string;
  downloadUrl?: string;
}

const EbookConverter = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('pdf');
  const [conversionSettings, setConversionSettings] = useState<ConversionSettings>({
    quality: 'medium',
    includeImages: true,
    preserveFormatting: true,
    generateTOC: true,
    pageSize: 'A4'
  });
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionHistory, setConversionHistory] = useState<ConversionJob[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const supportedFormats = [
    { value: 'epub', label: 'EPUB', description: 'Electronic Publication format', icon: '📚' },
    { value: 'mobi', label: 'MOBI', description: 'Mobipocket format for Kindle', icon: '📱' },
    { value: 'pdf', label: 'PDF', description: 'Portable Document Format', icon: '📄' },
    { value: 'txt', label: 'TXT', description: 'Plain text format', icon: '📝' },
    { value: 'html', label: 'HTML', description: 'Web page format', icon: '🌐' }
  ];

  const qualityOptions = [
    { value: 'low', label: 'Low', description: 'Smaller file size, basic formatting' },
    { value: 'medium', label: 'Medium', description: 'Balanced size and quality' },
    { value: 'high', label: 'High', description: 'Best quality, larger file size' }
  ];

  const pageSizeOptions = [
    { value: 'A4', label: 'A4 (210 × 297 mm)', description: 'Standard European size' },
    { value: 'Letter', label: 'Letter (8.5 × 11 in)', description: 'Standard US size' },
    { value: 'Custom', label: 'Custom dimensions', description: 'Set your own size' }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file format is supported
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isSupported = supportedFormats.some(format => format.value === fileExtension);
    
    if (!isSupported) {
      toast({
        title: "Unsupported Format",
        description: "Please select a supported ebook format (EPUB, MOBI, PDF, TXT, HTML)",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    toast({
      title: "File Selected",
      description: `${file.name} is ready for conversion`,
    });
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    const format = supportedFormats.find(f => f.value === extension);
    return format?.icon || '📄';
  };

  const getFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const startConversion = async () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setConversionProgress(0);

    // Create conversion job
    const job: ConversionJob = {
      id: Date.now().toString(),
      fileName: selectedFile.name,
      sourceFormat: selectedFile.name.split('.').pop()?.toLowerCase() || 'unknown',
      targetFormat,
      progress: 0,
      status: 'converting'
    };

    setConversionHistory(prev => [job, ...prev]);

    try {
      // Simulate conversion process
      for (let i = 0; i <= 100; i += 10) {
        setConversionProgress(i);
        job.progress = i;
        
        // Update job in history
        setConversionHistory(prev => 
          prev.map(j => j.id === job.id ? { ...j, progress: i } : j)
        );

        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Mark as completed
      job.status = 'completed';
      job.downloadUrl = `data:text/plain;charset=utf-8,${encodeURIComponent('Converted file content')}`;
      
      setConversionHistory(prev => 
        prev.map(j => j.id === job.id ? job : j)
      );

      toast({
        title: "Conversion Complete!",
        description: `${selectedFile.name} has been converted to ${targetFormat.toUpperCase()}`,
      });

    } catch (error) {
      job.status = 'failed';
      job.error = 'Conversion failed';
      
      setConversionHistory(prev => 
        prev.map(j => j.id === job.id ? job : j)
      );

      toast({
        title: "Conversion Failed",
        description: "An error occurred during conversion",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  const downloadFile = (job: ConversionJob) => {
    if (!job.downloadUrl) return;

    const link = document.createElement('a');
    link.href = job.downloadUrl;
    link.download = `${job.fileName.split('.')[0]}.${job.targetFormat}`;
    link.click();

    toast({
      title: "Download Started",
      description: "Your converted file is downloading",
    });
  };

  const removeJob = (jobId: string) => {
    setConversionHistory(prev => prev.filter(j => j.id !== jobId));
    toast({
      title: "Job Removed",
      description: "Conversion job has been removed from history",
    });
  };

  const clearHistory = () => {
    setConversionHistory([]);
    toast({
      title: "History Cleared",
      description: "All conversion history has been cleared",
    });
  };

  const resetSettings = () => {
    setConversionSettings({
      quality: 'medium',
      includeImages: true,
      preserveFormatting: true,
      generateTOC: true,
      pageSize: 'A4'
    });
    toast({
      title: "Settings Reset",
      description: "All settings have been reset to default",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - File Upload & Conversion */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload eBook
              </CardTitle>
              <CardDescription>
                Select an ebook file to convert to your preferred format
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Select File</Label>
                <Input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept=".epub,.mobi,.pdf,.txt,.html"
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Supported formats: EPUB, MOBI, PDF, TXT, HTML
                </p>
              </div>

              {selectedFile && (
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(selectedFile.name)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{selectedFile.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {getFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="target-format">Convert To</Label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <span>{format.icon}</span>
                          <span>{format.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {format.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={startConversion} 
                disabled={isConverting || !selectedFile}
                className="w-full"
              >
                {isConverting ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Converting... {conversionProgress}%
                  </>
                ) : (
                  <>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Start Conversion
                  </>
                )}
              </Button>

              {isConverting && (
                <div className="space-y-2">
                  <Progress value={conversionProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Converting {selectedFile?.name} to {targetFormat.toUpperCase()}...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion History */}
          {conversionHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Conversion History
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {conversionHistory.map((job) => (
                    <div key={job.id} className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFileIcon(job.fileName)}</span>
                          <span className="font-medium">{job.fileName}</span>
                        </div>
                        <Badge 
                          variant={
                            job.status === 'completed' ? 'default' :
                            job.status === 'failed' ? 'destructive' :
                            job.status === 'converting' ? 'secondary' : 'outline'
                          }
                        >
                          {job.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground mb-2">
                        {job.sourceFormat.toUpperCase()} → {job.targetFormat.toUpperCase()}
                      </div>

                      {job.status === 'converting' && (
                        <Progress value={job.progress} className="w-full mb-2" />
                      )}

                      {job.status === 'completed' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => downloadFile(job)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {job.status === 'failed' && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          <span>{job.error}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeJob(job.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Settings & Info */}
        <div className="space-y-6">
          {/* Conversion Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Conversion Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quality-select">Quality</Label>
                <Select 
                  value={conversionSettings.quality} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setConversionSettings(prev => ({ ...prev, quality: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {qualityOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="page-size-select">Page Size</Label>
                <Select 
                  value={conversionSettings.pageSize} 
                  onValueChange={(value: 'A4' | 'Letter' | 'Custom') => 
                    setConversionSettings(prev => ({ ...prev, pageSize: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <span>{option.label}</span>
                          <span className="text-sm text-muted-foreground">
                            {option.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {conversionSettings.pageSize === 'Custom' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-width">Width (mm)</Label>
                    <Input
                      id="custom-width"
                      type="number"
                      placeholder="210"
                      value={conversionSettings.customWidth || ''}
                      onChange={(e) => setConversionSettings(prev => ({ 
                        ...prev, 
                        customWidth: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="custom-height">Height (mm)</Label>
                    <Input
                      id="custom-height"
                      type="number"
                      placeholder="297"
                      value={conversionSettings.customHeight || ''}
                      onChange={(e) => setConversionSettings(prev => ({ 
                        ...prev, 
                        customHeight: parseFloat(e.target.value) || undefined 
                      }))}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="include-images">Include Images</Label>
                  <input
                    id="include-images"
                    type="checkbox"
                    checked={conversionSettings.includeImages}
                    onChange={(e) => setConversionSettings(prev => ({ 
                      ...prev, 
                      includeImages: e.target.checked 
                    }))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="preserve-formatting">Preserve Formatting</Label>
                  <input
                    id="preserve-formatting"
                    type="checkbox"
                    checked={conversionSettings.preserveFormatting}
                    onChange={(e) => setConversionSettings(prev => ({ 
                      ...prev, 
                      preserveFormatting: e.target.checked 
                    }))}
                    className="rounded"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="generate-toc">Generate Table of Contents</Label>
                  <input
                    id="generate-toc"
                    type="checkbox"
                    checked={conversionSettings.generateTOC}
                    onChange={(e) => setConversionSettings(prev => ({ 
                      ...prev, 
                      generateTOC: e.target.checked 
                    }))}
                    className="rounded"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={resetSettings}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
            </CardContent>
          </Card>

          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {supportedFormats.map((format) => (
                  <div key={format.value} className="flex items-center gap-3 p-2 bg-muted rounded">
                    <span className="text-xl">{format.icon}</span>
                    <div>
                      <div className="font-medium">{format.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {format.description}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Upload your ebook file in any supported format</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Choose your target format and conversion settings</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Click convert and wait for processing to complete</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Download your converted ebook file</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Conversion Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>EPUB to PDF preserves formatting best</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p>High quality setting increases file size</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Custom page sizes work best for PDF output</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <p>Table of Contents improves reading experience</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EbookConverter;
