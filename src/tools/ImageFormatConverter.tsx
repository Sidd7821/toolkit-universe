import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Upload, Download, Image as ImageIcon, RefreshCw, Settings, FileImage } from "lucide-react";

const ImageFormatConverter = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>("jpeg");
  const [quality, setQuality] = useState([90]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [convertedSize, setConvertedSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [originalFormat, setOriginalFormat] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const supportedFormats = [
    { value: "jpeg", label: "JPEG", mimeType: "image/jpeg", extension: "jpg" },
    { value: "png", label: "PNG", mimeType: "image/png", extension: "png" },
    { value: "webp", label: "WebP", mimeType: "image/webp", extension: "webp" },
    { value: "gif", label: "GIF", mimeType: "image/gif", extension: "gif" },
    { value: "bmp", label: "BMP", mimeType: "image/bmp", extension: "bmp" },
    { value: "tiff", label: "TIFF", mimeType: "image/tiff", extension: "tiff" }
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ 
          title: "Invalid file", 
          description: "Please select an image file.", 
          variant: "destructive" 
        });
        return;
      }
      
      setSelectedFile(file);
      setOriginalSize(file.size);
      setConvertedImage(null);
      setConvertedSize(0);
      
      // Extract original format
      const format = file.type.split('/')[1];
      setOriginalFormat(format);
      
      // Set default target format to something different
      if (format === 'jpeg' || format === 'jpg') {
        setTargetFormat('png');
      } else if (format === 'png') {
        setTargetFormat('jpeg');
      } else {
        setTargetFormat('jpeg');
      }
    }
  };

  const convertImage = async () => {
    if (!selectedFile || !canvasRef.current) return;

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      const img = new Image();
      img.onload = () => {
        // Set canvas dimensions
        canvas.width = img.width;
        canvas.height = img.height;

        // Draw image on canvas
        ctx.drawImage(img, 0, 0);

        // Get target format details
        const targetFormatInfo = supportedFormats.find(f => f.value === targetFormat);
        if (!targetFormatInfo) {
          toast({ 
            title: "Error", 
            description: "Unsupported target format.", 
            variant: "destructive" 
          });
          setLoading(false);
          return;
        }

        // Convert to target format
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setConvertedSize(blob.size);
              const url = URL.createObjectURL(blob);
              setConvertedImage(url);
              toast({ 
                title: "Image converted", 
                description: `Your image has been converted to ${targetFormatInfo.label.toUpperCase()} successfully.` 
              });
            }
            setLoading(false);
          },
          targetFormatInfo.mimeType,
          targetFormat === 'jpeg' ? quality[0] / 100 : 1
        );
      };

      img.onerror = () => {
        toast({ 
          title: "Error", 
          description: "Failed to load image.", 
          variant: "destructive" 
        });
        setLoading(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      toast({ 
        title: "Conversion failed", 
        description: "An error occurred while converting the image.", 
        variant: "destructive" 
      });
      setLoading(false);
    }
  };

  const downloadConverted = () => {
    if (!convertedImage || !selectedFile) return;

    const targetFormatInfo = supportedFormats.find(f => f.value === targetFormat);
    const extension = targetFormatInfo?.extension || 'jpg';
    
    // Generate filename
    const originalName = selectedFile.name.split('.')[0];
    const newFilename = `${originalName}_converted.${extension}`;

    const link = document.createElement('a');
    link.href = convertedImage;
    link.download = newFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetTool = () => {
    setSelectedFile(null);
    setConvertedImage(null);
    setOriginalSize(0);
    setConvertedSize(0);
    setOriginalFormat("");
    setTargetFormat("jpeg");
    setQuality([90]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatIcon = (format: string) => {
    const formatInfo = supportedFormats.find(f => f.value === format);
    return formatInfo?.label || format.toUpperCase();
  };

  const isQualitySupported = targetFormat === 'jpeg' || targetFormat === 'webp';

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload & Convert Image
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Click to select an image or drag and drop
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select Image
            </Button>
          </div>

          {selectedFile && (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  Original size: {formatFileSize(originalSize)} | Format: {originalFormat.toUpperCase()}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Target Format</Label>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {supportedFormats.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        <div className="flex items-center gap-2">
                          <FileImage className="h-4 w-4" />
                          {format.label.toUpperCase()}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isQualitySupported && (
                <div className="space-y-2">
                  <Label>Quality: {quality[0]}%</Label>
                  <Slider
                    value={quality}
                    onValueChange={setQuality}
                    max={100}
                    min={10}
                    step={5}
                    className="w-full"
                  />
                  <p className="text-xs text-muted-foreground">
                    {targetFormat === 'jpeg' ? 'Lower quality = smaller file size' : 'WebP quality setting'}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={convertImage} 
                  disabled={loading}
                  className="flex-1"
                  variant="hero"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Convert Image
                    </>
                  )}
                </Button>
                <Button 
                  onClick={resetTool} 
                  variant="outline"
                  size="icon"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Converted Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          {convertedImage ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={convertedImage} 
                  alt="Converted" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">Original</p>
                  <p className="text-muted-foreground">{formatFileSize(originalSize)}</p>
                  <p className="text-xs text-muted-foreground">{originalFormat.toUpperCase()}</p>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">Converted</p>
                  <p className="text-muted-foreground">{formatFileSize(convertedSize)}</p>
                  <p className="text-xs text-muted-foreground">{getFormatIcon(targetFormat)}</p>
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="font-medium text-primary">
                  {originalSize > 0 && convertedSize > 0 ? (
                    <>
                      {((originalSize - convertedSize) / originalSize * 100).toFixed(1)}% size change
                    </>
                  ) : (
                    "Format converted successfully"
                  )}
                </p>
              </div>

              <Button onClick={downloadConverted} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download {getFormatIcon(targetFormat)} Image
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Converted image will appear here</p>
              <p className="text-xs mt-2">Select an image and choose target format to start</p>
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageFormatConverter;
