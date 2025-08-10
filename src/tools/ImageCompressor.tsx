import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Upload, Download, Image as ImageIcon } from "lucide-react";

const ImageCompressor = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [compressedImage, setCompressedImage] = useState<string | null>(null);
  const [quality, setQuality] = useState([80]);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [compressedSize, setCompressedSize] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({ title: "Invalid file", description: "Please select an image file.", variant: "destructive" });
        return;
      }
      setSelectedFile(file);
      setOriginalSize(file.size);
      setCompressedImage(null);
      setCompressedSize(0);
    }
  };

  const compressImage = async () => {
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

        // Convert to compressed blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              setCompressedSize(blob.size);
              const url = URL.createObjectURL(blob);
              setCompressedImage(url);
              toast({ title: "Image compressed", description: "Your image has been compressed successfully." });
            }
            setLoading(false);
          },
          'image/jpeg',
          quality[0] / 100
        );
      };

      img.onerror = () => {
        toast({ title: "Error", description: "Failed to load image.", variant: "destructive" });
        setLoading(false);
      };

      img.src = URL.createObjectURL(selectedFile);
    } catch (error) {
      toast({ title: "Compression failed", description: "An error occurred while compressing the image.", variant: "destructive" });
      setLoading(false);
    }
  };

  const downloadCompressed = () => {
    if (!compressedImage) return;

    const link = document.createElement('a');
    link.href = compressedImage;
    link.download = `compressed_${selectedFile?.name || 'image.jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const compressionRatio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize * 100).toFixed(1) : 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Upload Image
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
                  Original size: {formatFileSize(originalSize)}
                </p>
              </div>

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
                  Lower quality = smaller file size
                </p>
              </div>

              <Button 
                onClick={compressImage} 
                disabled={loading}
                className="w-full"
                variant="hero"
              >
                {loading ? "Compressing..." : "Compress Image"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Compressed Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          {compressedImage ? (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <img 
                  src={compressedImage} 
                  alt="Compressed" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">Original</p>
                  <p className="text-muted-foreground">{formatFileSize(originalSize)}</p>
                </div>
                <div className="p-3 bg-accent rounded-lg">
                  <p className="font-medium">Compressed</p>
                  <p className="text-muted-foreground">{formatFileSize(compressedSize)}</p>
                </div>
              </div>

              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <p className="font-medium text-primary">
                  {compressionRatio}% size reduction
                </p>
              </div>

              <Button onClick={downloadCompressed} className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Compressed Image
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Compressed image will appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default ImageCompressor;