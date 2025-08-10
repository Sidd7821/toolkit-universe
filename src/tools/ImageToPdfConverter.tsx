import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileImage, 
  FileText, 
  Download, 
  Trash2, 
  ArrowUpDown,
  Image as ImageIcon,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";

interface ImageFile {
  id: string;
  file: File;
  preview: string;
  name: string;
  size: string;
}

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

const addImageToPdf = (pdf: jsPDF, img: HTMLImageElement, type: string) => {
  let format = type.split("/")[1].toUpperCase();
  if (format === "JPG") format = "JPEG"; // Normalize to JPEG for jsPDF
  if (!["JPEG", "PNG"].includes(format)) {
    format = "JPEG"; // Fallback for unsupported formats like GIF/WebP; could convert via canvas if needed
  }

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = img.width;
  const imgHeight = img.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const width = imgWidth * ratio;
  const height = imgHeight * ratio;
  const x = (pdfWidth - width) / 2;
  const y = (pdfHeight - height) / 2;

  pdf.addImage(img, format, x, y, width, height);
};

const ImageToPdfConverter = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select valid image files (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    const newImages: ImageFile[] = imageFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB'
    }));

    setImages(prev => [...prev, ...newImages]);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  };

  const moveImage = (id: string, direction: 'up' | 'down') => {
    setImages(prev => {
      const index = prev.findIndex(img => img.id === id);
      if (index === -1) return prev;
      
      const newImages = [...prev];
      if (direction === 'up' && index > 0) {
        [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
      } else if (direction === 'down' && index < newImages.length - 1) {
        [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
      }
      
      return newImages;
    });
  };

  const convertToPdf = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please add at least one image to convert",
        variant: "destructive",
      });
      return;
    }

    setIsConverting(true);
    
    try {
      const firstImage = images[0];
      const firstImg = await loadImage(firstImage.preview);
      const firstOrientation = firstImg.width > firstImg.height ? "landscape" : "portrait";
      const pdf = new jsPDF({ orientation: firstOrientation, unit: "pt", format: "a4" });

      addImageToPdf(pdf, firstImg, firstImage.file.type);

      for (let i = 1; i < images.length; i++) {
        const image = images[i];
        const img = await loadImage(image.preview);
        const orientation = img.width > img.height ? "landscape" : "portrait";
        pdf.addPage("a4", orientation);
        addImageToPdf(pdf, img, image.file.type);
      }

      const pdfBlob = pdf.output("blob");
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      toast({
        title: "Conversion successful!",
        description: `Converted ${images.length} images to PDF`,
      });
    } catch (error) {
      console.error('Conversion error:', error);
      toast({
        title: "Conversion failed",
        description: "An error occurred while converting images to PDF",
        variant: "destructive",
      });
    } finally {
      setIsConverting(false);
    }
  };

  const downloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'converted-images.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const clearAll = () => {
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
    setPdfUrl(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileImage className="h-5 w-5" />
            Image to PDF Converter
          </CardTitle>
          <CardDescription>
            Convert multiple images into a single PDF document. Supports JPG, PNG, GIF, and WebP formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Upload */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <Label htmlFor="image-upload" className="cursor-pointer">
              <div className="text-lg font-medium mb-2">
                Click to upload images or drag and drop
              </div>
              <div className="text-sm text-muted-foreground mb-4">
                Supports JPG, PNG, GIF, WebP • Max 10MB per image
              </div>
              <Button variant="outline" size="lg">
                <FileImage className="h-4 w-4 mr-2" />
                Select Images
              </Button>
            </Label>
            <Input
              id="image-upload"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Image Preview */}
          {images.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">
                  Selected Images ({images.length})
                </h3>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                  <Button
                    onClick={convertToPdf}
                    disabled={isConverting}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isConverting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Converting...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4 mr-2" />
                        Convert to PDF
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group border rounded-lg overflow-hidden">
                    <img
                      src={image.preview}
                      alt={image.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="flex gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, 'up')}
                          disabled={index === 0}
                        >
                          <ArrowUpDown className="h-4 w-4 rotate-180" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => moveImage(image.id, 'down')}
                          disabled={index === images.length - 1}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(image.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-background">
                      <div className="text-sm font-medium truncate">{image.name}</div>
                      <div className="text-xs text-muted-foreground">{image.size}</div>
                      <Badge variant="secondary" className="mt-1">
                        Position {index + 1}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PDF Download */}
          {pdfUrl && (
            <div className="border rounded-lg p-4 bg-green-50 dark:bg-green-950/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-600" />
                  <div>
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      PDF Created Successfully!
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your images have been converted to PDF format
                    </p>
                  </div>
                </div>
                <Button onClick={downloadPdf} className="bg-green-600 hover:bg-green-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Upload Images</p>
              <p className="text-sm text-muted-foreground">
                Select multiple image files (JPG, PNG, GIF, WebP) from your device
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Arrange Order</p>
              <p className="text-sm text-muted-foreground">
                Use the up/down arrows to arrange images in the desired order
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Convert & Download</p>
              <p className="text-sm text-muted-foreground">
                Click "Convert to PDF" and download your combined PDF file
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageToPdfConverter;