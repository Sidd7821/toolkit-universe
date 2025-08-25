import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive, 
  Settings, 
  CheckCircle, 
  File,
  RotateCcw,
  Hash,
  Search,
  Trash2,
  Download,
  Package,
  Eye
} from "lucide-react";
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FileItem {
  id: string;
  file: File;
  originalName: string;
  newName: string;
  extension: string;
  size: number;
  isSelected: boolean;
  isRenamed: boolean;
  renamedFile?: File | Blob;
}

const FileRenamer = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedPattern, setSelectedPattern] = useState<string>("");
  const [startNumber, setStartNumber] = useState(1);
  const [prefix, setPrefix] = useState("");
  const [suffix, setSuffix] = useState("");
  const [searchText, setSearchText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [preserveExtension, setPreserveExtension] = useState(true);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    const newFiles: FileItem[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      file,
      originalName: file.name,
      newName: file.name,
      extension: file.name.split('.').pop()?.toLowerCase() || '',
      size: file.size,
      isSelected: true,
      isRenamed: false
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const getFileIcon = (extension: string) => {
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff', 'svg', 'heic'].includes(extension)) {
      return <Image className="h-5 w-5 text-blue-500" />;
    } else if (['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'html'].includes(extension)) {
      return <FileText className="h-5 w-5 text-green-500" />;
    } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
      return <Video className="h-5 w-5 text-purple-500" />;
    } else if (['mp3', 'wav', 'aac', 'ogg', 'flac', 'wma', 'm4a'].includes(extension)) {
      return <Music className="h-5 w-5 text-orange-500" />;
    } else if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(extension)) {
      return <Archive className="h-5 w-5 text-red-500" />;
    } else {
      return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const generateNewNames = () => {
    if (files.length === 0) return;

    const selectedFiles = files.filter(f => f.isSelected);
    if (selectedFiles.length === 0) return;

    let newFiles = [...files];

    switch (selectedPattern) {
      case "sequential":
        selectedFiles.forEach((file, index) => {
          const number = startNumber + index;
          const newName = `${prefix}${number.toString().padStart(3, '0')}${suffix}`;
          const extension = preserveExtension ? `.${file.extension}` : '';
          newFiles = newFiles.map(f => 
            f.id === file.id ? { ...f, newName: newName + extension } : f
          );
        });
        break;

      case "search-replace":
        if (!searchText) return;
        selectedFiles.forEach((file) => {
          let newName = file.originalName;
          newName = newName.replace(new RegExp(searchText, 'gi'), replaceText);
          newFiles = newFiles.map(f => 
            f.id === file.id ? { ...f, newName } : f
          );
        });
        break;
    }

    setFiles(newFiles);
  };

  const createRenamedFile = async (originalFile: File, newName: string): Promise<File | Blob> => {
    try {
      // Create a new Blob with the same content
      const blob = new Blob([await originalFile.arrayBuffer()], { type: originalFile.type });
      
      // Try to create a File object if the File constructor is available
      if (typeof File !== 'undefined') {
        return new File([blob], newName, {
          type: originalFile.type,
          lastModified: originalFile.lastModified
        });
      }
      
      // Fallback to Blob with a name property
      Object.defineProperty(blob, 'name', {
        writable: true,
        value: newName
      });
      
      return blob;
    } catch (error) {
      console.error('Error creating renamed file:', error);
      // Return original file as Blob as a last resort
      return new Blob([await originalFile.arrayBuffer()], { 
        type: originalFile.type 
      });
    }
  };

  const applyRenaming = async () => {
    const selectedFiles = files.filter(f => f.isSelected && f.newName !== f.originalName);
    if (selectedFiles.length === 0) return;

    const updatedFiles = await Promise.all(files.map(async f => {
      if (f.isSelected && f.newName !== f.originalName) {
        const renamedFile = await createRenamedFile(f.file, f.newName);
        return { 
          ...f, 
          originalName: f.newName,
          isRenamed: true,
          renamedFile
        };
      }
      return f;
    }));

    setFiles(updatedFiles);
  };

  const downloadFile = (file: FileItem) => {
    const fileToDownload = file.renamedFile || file.file;
    const url = URL.createObjectURL(fileToDownload);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileToDownload.name || file.newName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const createZipDownload = async () => {
    const renamedFiles = files.filter(f => f.isRenamed);
    if (renamedFiles.length === 0) return;

    setIsGeneratingZip(true);

    try {
      const zip = new JSZip();
      
      for (const file of renamedFiles) {
        const fileToAdd = file.renamedFile || file.file;
        zip.file(file.newName, fileToAdd);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'renamed-files.zip');
    } catch (error) {
      console.error('Error creating ZIP:', error);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  const toggleFileSelection = (fileId: string) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, isSelected: !f.isSelected } : f
    ));
  };

  const selectAllFiles = () => {
    setFiles(prev => prev.map(f => ({ ...f, isSelected: true })));
  };

  const deselectAllFiles = () => {
    setFiles(prev => prev.map(f => ({ ...f, isSelected: false })));
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const clearAll = () => {
    setFiles([]);
    setSelectedPattern("");
    setStartNumber(1);
    setPrefix("");
    setSuffix("");
    setSearchText("");
    setReplaceText("");
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getSelectedCount = () => files.filter(f => f.isSelected).length;
  const getRenamedCount = () => files.filter(f => f.isRenamed).length;

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Files
              </CardTitle>
              <CardDescription>
                Select multiple files to rename in bulk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  multiple
                  accept="*/*"
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  size="lg"
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Choose Files
                </Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Drag and drop files here or click to browse
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum 100 files, 100MB each
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {files.length} files loaded
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {getSelectedCount()} selected
                    </span>
                    {getRenamedCount() > 0 && (
                      <Badge variant="default" className="bg-green-500">
                        {getRenamedCount()} renamed
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={selectAllFiles}>
                      Select All
                    </Button>
                    <Button variant="outline" size="sm" onClick={deselectAllFiles}>
                      Deselect All
                    </Button>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {getRenamedCount() > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <Download className="h-5 w-5" />
                  Download Renamed Files
                </CardTitle>
                <CardDescription className="text-green-600">
                  {getRenamedCount()} files are ready for download
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button 
                    onClick={createZipDownload}
                    disabled={isGeneratingZip}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    {isGeneratingZip ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Package className="h-4 w-4" />
                    )}
                    {isGeneratingZip ? 'Preparing ZIP...' : 'Download as ZIP'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      const renamedFiles = files.filter(f => f.isRenamed);
                      renamedFiles.forEach((file, index) => {
                        setTimeout(() => downloadFile(file), index * 100);
                      });
                    }}
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Individually
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Renaming Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Rename Pattern</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPattern === "sequential"
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPattern("sequential")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Hash className="h-5 w-5 text-primary" />
                        <span className="font-medium">Sequential Numbers</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Add sequential numbers to files
                      </p>
                    </div>
                    <div
                      className={`p-3 border rounded-lg cursor-pointer transition-all ${
                        selectedPattern === "search-replace"
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPattern("search-replace")}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Search className="h-5 w-5 text-primary" />
                        <span className="font-medium">Search & Replace</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Find and replace text in filenames
                      </p>
                    </div>
                  </div>
                </div>

                {selectedPattern === "sequential" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="prefix">Prefix</Label>
                      <Input
                        id="prefix"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        placeholder="e.g., photo_"
                      />
                    </div>
                    <div>
                      <Label htmlFor="startNumber">Start Number</Label>
                      <Input
                        id="startNumber"
                        type="number"
                        value={startNumber}
                        onChange={(e) => setStartNumber(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="suffix">Suffix</Label>
                      <Input
                        id="suffix"
                        value={suffix}
                        onChange={(e) => setSuffix(e.target.value)}
                        placeholder="e.g., _final"
                      />
                    </div>
                  </div>
                )}

                {selectedPattern === "search-replace" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="searchText">Search For</Label>
                      <Input
                        id="searchText"
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Text to find"
                      />
                    </div>
                    <div>
                      <Label htmlFor="replaceText">Replace With</Label>
                      <Input
                        id="replaceText"
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        placeholder="Text to replace with"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="preserveExtension">Preserve File Extensions</Label>
                  <Switch
                    id="preserveExtension"
                    checked={preserveExtension}
                    onCheckedChange={setPreserveExtension}
                  />
                </div>

                <div className="flex gap-3">
                  <Button onClick={generateNewNames} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Names
                  </Button>
                  <Button 
                    onClick={applyRenaming} 
                    variant="outline"
                    className="flex items-center gap-2"
                    disabled={files.filter(f => f.isSelected && f.newName !== f.originalName).length === 0}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Apply Renaming
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Files ({files.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {files.map((file) => (
                    <div
                      key={file.id}
                      className={`p-3 border rounded-lg transition-all ${
                        file.isSelected ? 'border-primary bg-primary/5' : 'border-border'
                      } ${file.isRenamed ? 'border-green-300 bg-green-50' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={file.isSelected}
                          onChange={() => toggleFileSelection(file.id)}
                          className="rounded"
                        />
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.extension)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {file.originalName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {file.extension}
                              </Badge>
                              {file.isRenamed && (
                                <Badge className="text-xs bg-green-500">
                                  Renamed
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {file.isRenamed && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(file)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-100"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(file.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {file.newName !== file.originalName && !file.isRenamed && (
                        <div className="mt-3 p-2 bg-blue-50 rounded border-l-2 border-blue-400">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-blue-600">Preview:</span>
                            <span className="font-medium text-blue-800">{file.newName}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Files:</span>
                <Badge variant="outline">{files.length}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Selected:</span>
                <Badge variant="outline">{getSelectedCount()}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Renamed:</span>
                <Badge className="bg-green-500">{getRenamedCount()}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={selectAllFiles}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Select All Files
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={deselectAllFiles}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Deselect All
              </Button>
              {getRenamedCount() > 0 && (
                <Button 
                  className="w-full justify-start bg-green-600 hover:bg-green-700"
                  onClick={createZipDownload}
                  disabled={isGeneratingZip}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Download as ZIP
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start" onClick={clearAll}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Clear All Files
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>• Preview names before applying changes</p>
              <p>• Download individual files or as a ZIP archive</p>
              <p>• Sequential numbering supports zero padding</p>
              <p>• Search & replace is case-insensitive</p>
              <p>• Extensions are preserved by default</p>
              <p>• Green badges indicate renamed files</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileRenamer;