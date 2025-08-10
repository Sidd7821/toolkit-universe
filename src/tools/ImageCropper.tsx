import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Download, Upload, Crop, RotateCcw, Move } from "lucide-react";

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageDimensions {
  width: number;
  height: number;
  naturalWidth: number;
  naturalHeight: number;
}

const ImageCropper = () => {
  const [image, setImage] = useState<string | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [aspectRatio, setAspectRatio] = useState<number | undefined>(undefined);
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize crop area when image loads
  useEffect(() => {
    if (image && imageRef.current) {
      const img = imageRef.current;
      const onImageLoad = () => {
        const dims = {
          width: img.clientWidth,
          height: img.clientHeight,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight
        };
        setImageDimensions(dims);
        
        // Set initial crop area to center of image
        const initialSize = Math.min(dims.width, dims.height) * 0.5;
        const centerX = (dims.width - initialSize) / 2;
        const centerY = (dims.height - initialSize) / 2;
        
        setCropArea({
          x: centerX,
          y: centerY,
          width: initialSize,
          height: initialSize
        });
      };

      if (img.complete) {
        onImageLoad();
      } else {
        img.onload = onImageLoad;
      }
    }
  }, [image]);

  const getMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const constrainCropArea = (area: CropArea): CropArea => {
    if (!imageDimensions) return area;
    
    const maxX = imageDimensions.width - area.width;
    const maxY = imageDimensions.height - area.height;
    
    return {
      x: Math.max(0, Math.min(area.x, maxX)),
      y: Math.max(0, Math.min(area.y, maxY)),
      width: Math.min(area.width, imageDimensions.width),
      height: Math.min(area.height, imageDimensions.height)
    };
  };

  const isPointInCropArea = (x: number, y: number): boolean => {
    return x >= cropArea.x && x <= cropArea.x + cropArea.width &&
           y >= cropArea.y && y <= cropArea.y + cropArea.height;
  };

  const getResizeHandle = (x: number, y: number): string | null => {
    const handleSize = 8;
    const { x: cropX, y: cropY, width, height } = cropArea;
    
    // Check corners first
    if (Math.abs(x - cropX) <= handleSize && Math.abs(y - cropY) <= handleSize) return 'nw';
    if (Math.abs(x - (cropX + width)) <= handleSize && Math.abs(y - cropY) <= handleSize) return 'ne';
    if (Math.abs(x - cropX) <= handleSize && Math.abs(y - (cropY + height)) <= handleSize) return 'sw';
    if (Math.abs(x - (cropX + width)) <= handleSize && Math.abs(y - (cropY + height)) <= handleSize) return 'se';
    
    // Check edges
    if (Math.abs(x - cropX) <= handleSize && y >= cropY && y <= cropY + height) return 'w';
    if (Math.abs(x - (cropX + width)) <= handleSize && y >= cropY && y <= cropY + height) return 'e';
    if (Math.abs(y - cropY) <= handleSize && x >= cropX && x <= cropX + width) return 'n';
    if (Math.abs(y - (cropY + height)) <= handleSize && x >= cropX && x <= cropX + width) return 's';
    
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const { x, y } = getMousePosition(e);
    
    const resizeHandle = getResizeHandle(x, y);
    if (resizeHandle) {
      setIsResizing(resizeHandle);
      setDragStart({ x, y });
    } else if (isPointInCropArea(x, y)) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current || (!isDragging && !isResizing)) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (isDragging) {
      const newX = x - dragStart.x;
      const newY = y - dragStart.y;
      
      setCropArea(prev => constrainCropArea({
        ...prev,
        x: newX,
        y: newY
      }));
    } else if (isResizing && imageDimensions) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      setCropArea(prev => {
        let newArea = { ...prev };
        
        switch (isResizing) {
          case 'se':
            newArea.width = Math.max(50, prev.width + deltaX);
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
            } else {
              newArea.height = Math.max(50, prev.height + deltaY);
            }
            break;
            
          case 'sw':
            const newWidth = Math.max(50, prev.width - deltaX);
            newArea.x = prev.x + (prev.width - newWidth);
            newArea.width = newWidth;
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
            } else {
              newArea.height = Math.max(50, prev.height + deltaY);
            }
            break;
            
          case 'ne':
            newArea.width = Math.max(50, prev.width + deltaX);
            const newHeight = Math.max(50, prev.height - deltaY);
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
              newArea.y = prev.y + prev.height - newArea.height;
            } else {
              newArea.height = newHeight;
              newArea.y = prev.y + (prev.height - newArea.height);
            }
            break;
            
          case 'nw':
            const nwNewWidth = Math.max(50, prev.width - deltaX);
            const nwNewHeight = Math.max(50, prev.height - deltaY);
            newArea.x = prev.x + (prev.width - nwNewWidth);
            newArea.width = nwNewWidth;
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
              newArea.y = prev.y + prev.height - newArea.height;
            } else {
              newArea.y = prev.y + (prev.height - nwNewHeight);
              newArea.height = nwNewHeight;
            }
            break;
            
          case 'n':
            const nNewHeight = Math.max(50, prev.height - deltaY);
            newArea.y = prev.y + (prev.height - nNewHeight);
            newArea.height = nNewHeight;
            if (aspectRatio) {
              newArea.width = newArea.height * aspectRatio;
            }
            break;
            
          case 's':
            newArea.height = Math.max(50, prev.height + deltaY);
            if (aspectRatio) {
              newArea.width = newArea.height * aspectRatio;
            }
            break;
            
          case 'w':
            const wNewWidth = Math.max(50, prev.width - deltaX);
            newArea.x = prev.x + (prev.width - wNewWidth);
            newArea.width = wNewWidth;
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
            }
            break;
            
          case 'e':
            newArea.width = Math.max(50, prev.width + deltaX);
            if (aspectRatio) {
              newArea.height = newArea.width / aspectRatio;
            }
            break;
        }
        
        return constrainCropArea(newArea);
      });
      
      setDragStart({ x, y });
    }
  }, [isDragging, isResizing, dragStart, aspectRatio, imageDimensions]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(null);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const cropImage = useCallback(() => {
    if (!image || !canvasRef.current || !imageRef.current || !imageDimensions) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    
    // Calculate scale factor between displayed image and natural image
    const scaleX = imageDimensions.naturalWidth / imageDimensions.width;
    const scaleY = imageDimensions.naturalHeight / imageDimensions.height;
    
    // Scale crop area to natural image dimensions
    const naturalCropArea = {
      x: cropArea.x * scaleX,
      y: cropArea.y * scaleY,
      width: cropArea.width * scaleX,
      height: cropArea.height * scaleY
    };
    
    canvas.width = naturalCropArea.width;
    canvas.height = naturalCropArea.height;

    ctx.drawImage(
      img,
      naturalCropArea.x, naturalCropArea.y, naturalCropArea.width, naturalCropArea.height,
      0, 0, naturalCropArea.width, naturalCropArea.height
    );
  }, [image, cropArea, imageDimensions]);

  const downloadCroppedImage = () => {
    if (!canvasRef.current) return;
    
    cropImage();
    
    const link = document.createElement('a');
    link.download = 'cropped-image.png';
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const resetCrop = () => {
    if (imageDimensions) {
      const initialSize = Math.min(imageDimensions.width, imageDimensions.height) * 0.5;
      const centerX = (imageDimensions.width - initialSize) / 2;
      const centerY = (imageDimensions.height - initialSize) / 2;
      
      setCropArea({
        x: centerX,
        y: centerY,
        width: initialSize,
        height: initialSize
      });
    }
  };

  const setAspectRatioOption = (ratio: number | undefined) => {
    setAspectRatio(ratio);
    if (ratio) {
      setCropArea(prev => {
        const newHeight = prev.width / ratio;
        const constrainedArea = constrainCropArea({
          ...prev,
          height: newHeight
        });
        
        // If height was constrained, adjust width to maintain aspect ratio
        if (constrainedArea.height !== newHeight) {
          constrainedArea.width = constrainedArea.height * ratio;
        }
        
        return constrainedArea;
      });
    }
  };

  const getCursorStyle = (x: number, y: number): string => {
    const handle = getResizeHandle(x, y);
    if (!handle) return isPointInCropArea(x, y) ? 'move' : 'default';
    
    const cursorMap: Record<string, string> = {
      'nw': 'nw-resize',
      'ne': 'ne-resize',
      'sw': 'sw-resize',
      'se': 'se-resize',
      'n': 'n-resize',
      's': 's-resize',
      'w': 'w-resize',
      'e': 'e-resize'
    };
    
    return cursorMap[handle] || 'default';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crop className="h-5 w-5" />
            Advanced Image Cropper
          </CardTitle>
          <CardDescription>
            Upload an image and crop it with precise control. Drag to move, use handles to resize.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </Label>
            <Input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="cursor-pointer"
            />
          </div>

          {image && (
            <>
              <div className="space-y-2">
                <Label>Aspect Ratio</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={aspectRatio === undefined ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatioOption(undefined)}
                  >
                    Free
                  </Button>
                  <Button
                    variant={aspectRatio === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatioOption(1)}
                  >
                    1:1
                  </Button>
                  <Button
                    variant={aspectRatio === 16/9 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatioOption(16/9)}
                  >
                    16:9
                  </Button>
                  <Button
                    variant={aspectRatio === 4/3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatioOption(4/3)}
                  >
                    4:3
                  </Button>
                  <Button
                    variant={aspectRatio === 3/2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAspectRatioOption(3/2)}
                  >
                    3:2
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Crop Dimensions</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm">Width: {Math.round(cropArea.width)}px</Label>
                    <Slider
                      value={[cropArea.width]}
                      onValueChange={([value]) => {
                        setCropArea(prev => {
                          const newHeight = aspectRatio ? value / aspectRatio : prev.height;
                          return constrainCropArea({
                            ...prev,
                            width: value,
                            height: newHeight
                          });
                        });
                      }}
                      min={50}
                      max={imageDimensions?.width || 800}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Height: {Math.round(cropArea.height)}px</Label>
                    <Slider
                      value={[cropArea.height]}
                      onValueChange={([value]) => {
                        setCropArea(prev => {
                          const newWidth = aspectRatio ? value * aspectRatio : prev.width;
                          return constrainCropArea({
                            ...prev,
                            height: value,
                            width: newWidth
                          });
                        });
                      }}
                      min={50}
                      max={imageDimensions?.height || 800}
                      step={1}
                      className="mt-2"
                      disabled={!!aspectRatio}
                    />
                  </div>
                </div>
              </div>

              <div className="relative border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 select-none">
                <div
                  ref={containerRef}
                  className="relative"
                  onMouseDown={handleMouseDown}
                  style={{
                    cursor: isDragging ? 'grabbing' : isResizing ? 'grabbing' : 'default'
                  }}
                  onMouseMove={(e) => {
                    if (!isDragging && !isResizing && containerRef.current) {
                      const { x, y } = getMousePosition(e);
                      containerRef.current.style.cursor = getCursorStyle(x, y);
                    }
                  }}
                >
                  <img
                    ref={imageRef}
                    src={image}
                    alt="Uploaded image"
                    className="max-w-full h-auto block"
                    draggable={false}
                    style={{ userSelect: 'none' }}
                  />
                  
                  {/* Crop overlay */}
                  <div
                    className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-20"
                    style={{
                      left: cropArea.x,
                      top: cropArea.y,
                      width: cropArea.width,
                      height: cropArea.height,
                    }}
                  >
                    {/* Corner handles */}
                    <div className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full -top-1.5 -left-1.5 cursor-nw-resize" />
                    <div className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full -top-1.5 -right-1.5 cursor-ne-resize" />
                    <div className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full -bottom-1.5 -left-1.5 cursor-sw-resize" />
                    <div className="absolute w-3 h-3 bg-blue-600 border border-white rounded-full -bottom-1.5 -right-1.5 cursor-se-resize" />
                    
                    {/* Edge handles */}
                    <div className="absolute w-2 h-3 bg-blue-600 border border-white rounded-sm -top-1.5 left-1/2 -translate-x-1/2 cursor-n-resize" />
                    <div className="absolute w-2 h-3 bg-blue-600 border border-white rounded-sm -bottom-1.5 left-1/2 -translate-x-1/2 cursor-s-resize" />
                    <div className="absolute w-3 h-2 bg-blue-600 border border-white rounded-sm -left-1.5 top-1/2 -translate-y-1/2 cursor-w-resize" />
                    <div className="absolute w-3 h-2 bg-blue-600 border border-white rounded-sm -right-1.5 top-1/2 -translate-y-1/2 cursor-e-resize" />
                    
                    {/* Move indicator */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Move className="h-5 w-5 text-blue-600 opacity-70" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button onClick={resetCrop} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Crop
                </Button>
                <Button onClick={downloadCroppedImage} className="bg-blue-600 hover:bg-blue-700">
                  <Download className="h-4 w-4 mr-2" />
                  Download Cropped Image
                </Button>
              </div>

              {imageDimensions && (
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Original: {imageDimensions.naturalWidth} × {imageDimensions.naturalHeight}px</p>
                  <p>Displayed: {Math.round(imageDimensions.width)} × {Math.round(imageDimensions.height)}px</p>
                  <p>Crop: {Math.round(cropArea.width)} × {Math.round(cropArea.height)}px</p>
                </div>
              )}

              <canvas
                ref={canvasRef}
                className="hidden"
                style={{ display: 'none' }}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageCropper;