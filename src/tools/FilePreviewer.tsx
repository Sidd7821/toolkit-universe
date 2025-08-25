import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Eye, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  File,
  Download,
  RotateCcw,
  Info,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileInfo {
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  extension: string;
}

interface PreviewState {
  zoom: number;
  rotation: number;
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
}

const FilePreviewer = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({
    zoom: 1,
    rotation: 0,
    isPlaying: false,
    volume: 1,
    isMuted: false
  });
  const [previewHistory, setPreviewHistory] = useState<Array<{
    id: string;
    fileName: string;
    fileType: string;
    timestamp: Date;
  }>>([]);

  const fileCategories = {
    image: {
      extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic'],
      icon: <Image className="h-5 w-5" />,
      name: 'Image Files',
      color: 'text-blue-500'
    },
    document: {
      extensions: ['pdf', 'txt', 'md', 'html', 'css', 'js', 'json', 'xml', 'csv'],
      icon: <FileText className="h-5 w-5" />,
      name: 'Document Files',
      color: 'text-green-500'
    },
    video: {
      extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', 'm4v'],
      icon: <Video className="h-5 w-5" />,
      name: 'Video Files',
      color: 'text-purple-500'
    },
    audio: {
      extensions: ['mp3', 'wav', 'aac', 'ogg', 'flac', 'wma', 'm4a'],
      icon: <Music className="h-5 w-5" />,
      name: 'Audio Files',
      color: 'text-orange-500'
    },
    archive: {
      extensions: ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
      icon: <Archive className="h-5 w-5" />,
      name: 'Archive Files',
      color: 'text-red-500'
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create file info
      const info: FileInfo = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: new Date(file.lastModified),
        extension: file.name.split('.').pop()?.toLowerCase() || ''
      };
      setFileInfo(info);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Reset preview state
      setPreviewState({
        zoom: 1,
        rotation: 0,
        isPlaying: false,
        volume: 1,
        isMuted: false
      });

      // Add to history
      const historyItem = {
        id: Date.now().toString(),
        fileName: file.name,
        fileType: file.type || 'Unknown',
        timestamp: new Date()
      };
      setPreviewHistory(prev => [historyItem, ...prev.slice(0, 9)]);

      toast({
        title: "File Loaded!",
        description: `${file.name} is ready for preview`,
      });
    }
  };

  const getFileCategory = (extension: string) => {
    for (const [category, info] of Object.entries(fileCategories)) {
      if (info.extensions.includes(extension)) {
        return { category, ...info };
      }
    }
    return null;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleZoomIn = () => {
    setPreviewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }));
  };

  const handleZoomOut = () => {
    setPreviewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.25) }));
  };

  const handleRotate = () => {
    setPreviewState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  const handleReset = () => {
    setPreviewState({
      zoom: 1,
      rotation: 0,
      isPlaying: false,
      volume: 1,
      isMuted: false
    });
  };

  const togglePlayPause = () => {
    setPreviewState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const toggleMute = () => {
    setPreviewState(prev => ({ ...prev, isMuted: !prev.isMuted }));
  };

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const volume = parseFloat(event.target.value);
    setPreviewState(prev => ({ ...prev, volume, isMuted: volume === 0 }));
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFileInfo(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewState({
      zoom: 1,
      rotation: 0,
      isPlaying: false,
      volume: 1,
      isMuted: false
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderPreview = () => {
    if (!fileInfo || !previewUrl) return null;

    const categoryInfo = getFileCategory(fileInfo.extension);

    switch (categoryInfo?.category) {
             case 'image':
         return (
           <div className="relative overflow-hidden border rounded-lg">
             {fileInfo.extension === 'heic' ? (
               <div className="p-6 bg-muted/50 rounded-lg text-center">
                 <Image className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                 <p className="text-muted-foreground mb-2">
                   HEIC files cannot be previewed directly in the browser
                 </p>
                 <p className="text-sm text-muted-foreground mb-4">
                   HEIC is Apple's High Efficiency Image Format
                 </p>
                 <Button onClick={() => window.open(previewUrl, '_blank')}>
                   Download File
                 </Button>
               </div>
             ) : (
               <img
                 src={previewUrl}
                 alt={fileInfo.name}
                 className="w-full h-auto"
                 style={{
                   transform: `scale(${previewState.zoom}) rotate(${previewState.rotation}deg)`,
                   transition: 'transform 0.3s ease'
                 }}
               />
             )}
             {fileInfo.extension !== 'heic' && (
               <div className="absolute top-2 right-2 flex gap-2">
                 <Button size="sm" variant="secondary" onClick={handleZoomIn}>
                   <ZoomIn className="h-4 w-4" />
                 </Button>
                 <Button size="sm" variant="secondary" onClick={handleZoomOut}>
                   <ZoomOut className="h-4 w-4" />
                 </Button>
                 <Button size="sm" variant="secondary" onClick={handleRotate}>
                   <RotateCw className="h-4 w-4" />
                 </Button>
               </div>
             )}
           </div>
         );

      case 'video':
        return (
          <div className="relative">
            <video
              src={previewUrl}
              controls
              className="w-full h-auto rounded-lg"
              onPlay={() => setPreviewState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPreviewState(prev => ({ ...prev, isPlaying: false }))}
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <Button size="sm" variant="secondary" onClick={togglePlayPause}>
                {previewState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );

      case 'audio':
        return (
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <Music className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <audio
              src={previewUrl}
              controls
              className="w-full"
              onPlay={() => setPreviewState(prev => ({ ...prev, isPlaying: true }))}
              onPause={() => setPreviewState(prev => ({ ...prev, isPlaying: false }))}
            />
            <div className="mt-4 flex items-center justify-center gap-4">
              <Label className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Volume
              </Label>
              <Input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={previewState.volume}
                onChange={handleVolumeChange}
                className="w-24"
              />
              <Button size="sm" variant="outline" onClick={toggleMute}>
                {previewState.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        );

      case 'document':
        if (fileInfo.extension === 'txt' || fileInfo.extension === 'md') {
          return (
            <div className="p-4 bg-muted/50 rounded-lg">
              <div className="bg-background p-4 rounded border max-h-96 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {fileInfo.extension === 'txt' ? 'Text content preview...' : 'Markdown content preview...'}
                </pre>
              </div>
            </div>
          );
        }
        return (
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Preview not available for {fileInfo.extension.toUpperCase()} files
            </p>
            <Button className="mt-4" onClick={() => window.open(previewUrl, '_blank')}>
              Open in New Tab
            </Button>
          </div>
        );

      case 'archive':
        return (
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <Archive className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Archive contents cannot be previewed directly
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Use a file extraction tool to view contents
            </p>
          </div>
        );

      default:
        return (
          <div className="p-6 bg-muted/50 rounded-lg text-center">
            <File className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">
              Preview not available for this file type
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>
                Select a file to preview its contents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="*/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum file size: 100MB
                </p>
              </div>
            </CardContent>
          </Card>

          {/* File Info */}
          {fileInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getFileCategory(fileInfo.extension)?.icon || <File className="h-5 w-5" />}
                    File Information
                  </span>
                  <Button variant="outline" size="sm" onClick={clearFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium">File Name</Label>
                    <p className="text-sm text-muted-foreground">{fileInfo.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">File Size</Label>
                    <p className="text-sm text-muted-foreground">{formatFileSize(fileInfo.size)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">File Type</Label>
                    <p className="text-sm text-muted-foreground">{fileInfo.type || 'Unknown'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Last Modified</Label>
                    <p className="text-sm text-muted-foreground">{formatDate(fileInfo.lastModified)}</p>
                  </div>
                </div>
                {getFileCategory(fileInfo.extension) && (
                  <div className="mt-4">
                    <Badge variant="secondary" className="flex items-center gap-2 w-fit">
                      {getFileCategory(fileInfo.extension)?.icon}
                      {getFileCategory(fileInfo.extension)?.name}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Preview Display */}
          {fileInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={handleReset}>
                      <RotateCcw className="h-4 w-4" />
                      Reset
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => window.open(previewUrl, '_blank')}>
                      <Maximize2 className="h-4 w-4" />
                      Full Screen
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderPreview()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supported Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="image">Media</TabsTrigger>
                  <TabsTrigger value="document">Docs</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="mt-4 space-y-4">
                  {Object.entries(fileCategories).filter(([key]) => 
                    ['image', 'video', 'audio'].includes(key)
                  ).map(([key, info]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={info.color}>{info.icon}</span>
                        <span className="text-sm font-medium">{info.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {info.extensions.map((ext) => (
                          <Badge key={ext} variant="outline" className="text-xs">
                            .{ext}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
                <TabsContent value="document" className="mt-4 space-y-4">
                  {Object.entries(fileCategories).filter(([key]) => 
                    ['document', 'archive'].includes(key)
                  ).map(([key, info]) => (
                    <div key={key} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={info.color}>{info.icon}</span>
                        <span className="text-sm font-medium">{info.name}</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {info.extensions.map((ext) => (
                          <Badge key={ext} variant="outline" className="text-xs">
                            .{ext}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Preview History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Previews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {previewHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No previews yet
                  </p>
                ) : (
                  previewHistory.map((item) => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <File className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium truncate">{item.fileName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="truncate">{item.fileType}</span>
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Preview Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Images support zoom and rotation</p>
              <p>• Videos and audio have playback controls</p>
              <p>• Documents open in new tabs</p>
              <p>• Archives show content info only</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewer;
