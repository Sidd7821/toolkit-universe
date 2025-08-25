import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image as ImageIcon, Settings, Eye, EyeOff, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CollageImage {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CollageSettings {
  layout: 'grid' | 'freeform' | 'masonry';
  gridColumns: number;
  spacing: number;
  backgroundColor: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
}

const CollageMaker = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<CollageImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [settings, setSettings] = useState<CollageSettings>({
    layout: 'grid',
    gridColumns: 3,
    spacing: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 8
  });

  const [showPreview, setShowPreview] = useState(true);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const newImage: CollageImage = {
            id: Date.now().toString() + Math.random(),
            src: e.target?.result as string,
            x: Math.random() * 400,
            y: Math.random() * 300,
            width: 150,
            height: 150
          };
          setImages(prev => [...prev, newImage]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleSettingChange = (field: keyof CollageSettings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageSelect = (imageId: string) => {
    setSelectedImage(selectedImage === imageId ? null : imageId);
  };

  const handleImageDelete = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (selectedImage === imageId) {
      setSelectedImage(null);
    }
  };

  const applyGridLayout = () => {
    if (images.length === 0) return;
    
    const cols = settings.gridColumns;
    const rows = Math.ceil(images.length / cols);
    const cellWidth = (600 - (cols + 1) * settings.spacing) / cols;
    const cellHeight = (400 - (rows + 1) * settings.spacing) / rows;

    setImages(prev => prev.map((img, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      return {
        ...img,
        x: col * (cellWidth + settings.spacing) + settings.spacing,
        y: row * (cellHeight + settings.spacing) + settings.spacing,
        width: cellWidth,
        height: cellHeight
      };
    }));
  };

  const downloadCollage = () => {
    if (!canvasRef.current) return;
    
    toast({
      title: "Download Feature",
      description: "Collage download feature will be implemented with html2canvas integration.",
    });
  };

  const getCanvasStyles = () => ({
    width: '600px',
    height: '400px',
    backgroundColor: settings.backgroundColor,
    border: `${settings.borderWidth}px solid ${settings.borderColor}`,
    borderRadius: `${settings.borderRadius}px`,
    position: 'relative' as const,
    overflow: 'hidden'
  });

  const renderImage = (image: CollageImage) => {
    const isSelected = selectedImage === image.id;
    
    return (
      <div
        key={image.id}
        className={`absolute cursor-pointer transition-all duration-200 ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
        style={{
          left: image.x,
          top: image.y,
          width: image.width,
          height: image.height
        }}
        onClick={() => handleImageSelect(image.id)}
      >
        <img
          src={image.src}
          alt="Collage image"
          className="w-full h-full object-cover rounded"
          style={{
            border: `${settings.borderWidth}px solid ${settings.borderColor}`,
            borderRadius: `${settings.borderRadius}px`
          }}
        />
        
        {isSelected && (
          <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
               onClick={(e) => {
                 e.stopPropagation();
                 handleImageDelete(image.id);
               }}>
            <X className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Collage Settings
              </CardTitle>
              <CardDescription>
                Customize your collage layout and design
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div>
                    <Label htmlFor="image-upload">Upload Images</Label>
                    <Input
                      ref={fileInputRef}
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileUpload}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Select multiple images to create your collage
                    </p>
                  </div>
                  
                  {images.length > 0 && (
                    <div>
                      <Label>Uploaded Images ({images.length})</Label>
                      <div className="grid grid-cols-3 gap-2 mt-2 max-h-40 overflow-y-auto">
                        {images.map((image) => (
                          <div
                            key={image.id}
                            className={`relative cursor-pointer border-2 rounded overflow-hidden ${
                              selectedImage === image.id ? 'border-blue-500' : 'border-border'
                            }`}
                            onClick={() => handleImageSelect(image.id)}
                          >
                            <img
                              src={image.src}
                              alt="Thumbnail"
                              className="w-full h-16 object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div>
                    <Label>Layout Style</Label>
                    <Select value={settings.layout} onValueChange={(value: 'grid' | 'freeform' | 'masonry') => handleSettingChange('layout', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grid Layout</SelectItem>
                        <SelectItem value="freeform">Freeform</SelectItem>
                        <SelectItem value="masonry">Masonry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {settings.layout === 'grid' && (
                    <div>
                      <Label>Grid Columns: {settings.gridColumns}</Label>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={settings.gridColumns}
                        onChange={(e) => handleSettingChange('gridColumns', parseInt(e.target.value))}
                        className="w-full mt-2"
                      />
                    </div>
                  )}
                  
                  <Button onClick={applyGridLayout} className="w-full" disabled={images.length === 0}>
                    Apply Grid Layout
                  </Button>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={settings.backgroundColor}
                      onChange={(e) => handleSettingChange('backgroundColor', e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  
                  <div>
                    <Label>Border Width: {settings.borderWidth}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={settings.borderWidth}
                      onChange={(e) => handleSettingChange('borderWidth', parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label>Border Color</Label>
                    <Input
                      type="color"
                      value={settings.borderColor}
                      onChange={(e) => handleSettingChange('borderColor', e.target.value)}
                      className="w-full h-10"
                    />
                  </div>
                  
                  <div>
                    <Label>Border Radius: {settings.borderRadius}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="20"
                      value={settings.borderRadius}
                      onChange={(e) => handleSettingChange('borderRadius', parseInt(e.target.value))}
                      className="w-full mt-2"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadCollage} className="w-full" size="lg" disabled={images.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Download Collage
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Download as PNG image for sharing or printing
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
          
          {showPreview && (
            <div className="flex justify-center">
              <div
                ref={canvasRef}
                className="border rounded-lg shadow-lg overflow-hidden"
                style={getCanvasStyles()}
              >
                {images.map(renderImage)}
                
                {images.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No images uploaded</p>
                      <p className="text-sm">Upload some images to start creating your collage</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Collage Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Use grid layout for organized, professional collages</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Freeform layout allows creative positioning</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Click on images to select and modify properties</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CollageMaker;
