import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  File, 
  FolderOpen, 
  Trash2, 
  Download, 
  AlertTriangle,
  CheckCircle,
  Info,
  Hash,
  Clock,
  HardDrive,
  Filter,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  lastModified: Date;
  path: string;
  hash?: string;
}

interface DuplicateGroup {
  hash: string;
  files: FileInfo[];
  totalSize: number;
}

const DuplicateFileFinder = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMethod, setScanMethod] = useState<'content' | 'name' | 'size'>('content');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [filterType, setFilterType] = useState<string>('all');

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) return;

    const fileList: FileInfo[] = Array.from(selectedFiles).map((file, index) => ({
      id: `file-${index}`,
      name: file.name,
      size: file.size,
      type: file.type || 'unknown',
      lastModified: new Date(file.lastModified),
      path: file.name,
      hash: undefined
    }));

    setFiles(fileList);
    setDuplicateGroups([]);
    setSelectedFiles(new Set());
    toast({
      title: "Files Selected",
      description: `${fileList.length} files ready for scanning`,
    });
  };

  const generateHash = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const uint8Array = new Uint8Array(arrayBuffer);
        
        // Simple hash function (for demo purposes)
        let hash = 0;
        for (let i = 0; i < uint8Array.length; i++) {
          const char = uint8Array[i];
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        resolve(Math.abs(hash).toString(16));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const findDuplicates = useCallback(async () => {
    if (files.length === 0) return;

    setIsScanning(true);
    setScanProgress(0);
    setDuplicateGroups([]);

    try {
      const fileInput = fileInputRef.current;
      if (!fileInput?.files) return;

      const fileList = Array.from(fileInput.files);
      const fileMap = new Map<string, FileInfo[]>();
      const hashMap = new Map<string, FileInfo[]>();

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];
        const fileInfo = files.find(f => f.name === file.name);
        if (!fileInfo) continue;

        setScanProgress((i / fileList.length) * 100);

        if (scanMethod === 'content') {
          const hash = await generateHash(file);
          fileInfo.hash = hash;
          
          if (!hashMap.has(hash)) {
            hashMap.set(hash, []);
          }
          hashMap.get(hash)!.push(fileInfo);
        } else if (scanMethod === 'name') {
          const name = file.name.toLowerCase();
          if (!fileMap.has(name)) {
            fileMap.set(name, []);
          }
          fileMap.get(name)!.push(fileInfo);
        } else if (scanMethod === 'size') {
          const size = file.size.toString();
          if (!fileMap.has(size)) {
            fileMap.set(size, []);
          }
          fileMap.get(size)!.push(fileInfo);
        }

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Find duplicates
      const duplicates: DuplicateGroup[] = [];
      
      if (scanMethod === 'content') {
        hashMap.forEach((fileList, hash) => {
          if (fileList.length > 1) {
            duplicates.push({
              hash,
              files: fileList,
              totalSize: fileList.reduce((sum, file) => sum + file.size, 0)
            });
          }
        });
      } else {
        fileMap.forEach((fileList, key) => {
          if (fileList.length > 1) {
            duplicates.push({
              hash: key,
              files: fileList,
              totalSize: fileList.reduce((sum, file) => sum + file.size, 0)
            });
          }
        });
      }

      setDuplicateGroups(duplicates);
      setScanProgress(100);

      toast({
        title: "Scan Complete!",
        description: `Found ${duplicates.length} groups of duplicate files`,
      });

    } catch (error) {
      toast({
        title: "Scan Failed",
        description: "An error occurred while scanning files",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  }, [files, scanMethod]);

  const toggleFileSelection = (fileId: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileId)) {
      newSelection.delete(fileId);
    } else {
      newSelection.add(fileId);
    }
    setSelectedFiles(newSelection);
  };

  const selectAllInGroup = (group: DuplicateGroup) => {
    const allFileIds = group.files.map(f => f.id);
    setSelectedFiles(new Set(allFileIds));
  };

  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  const deleteSelectedFiles = () => {
    if (selectedFiles.size === 0) return;

    // Remove selected files from duplicate groups
    const newGroups = duplicateGroups.map(group => ({
      ...group,
      files: group.files.filter(file => !selectedFiles.has(file.id))
    })).filter(group => group.files.length > 1);

    setDuplicateGroups(newGroups);
    setSelectedFiles(new Set());

    toast({
      title: "Files Removed",
      description: `${selectedFiles.size} files have been removed from the list`,
    });
  };

  const exportResults = () => {
    const csvContent = [
      "Group,File Name,Size,Type,Last Modified,Path",
      ...duplicateGroups.flatMap((group, groupIndex) =>
        group.files.map(file =>
          `${groupIndex + 1},"${file.name}",${file.size},"${file.type}","${formatDate(file.lastModified)}","${file.path}"`
        )
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'duplicate-files-report.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Duplicate files report exported to CSV",
    });
  };

  const getFilteredGroups = () => {
    if (filterType === 'all') return duplicateGroups;
    
    return duplicateGroups.filter(group => {
      const firstFile = group.files[0];
      if (filterType === 'images') {
        return firstFile.type.startsWith('image/');
      } else if (filterType === 'documents') {
        return firstFile.type.includes('document') || firstFile.type.includes('pdf') || firstFile.type.includes('text');
      } else if (filterType === 'videos') {
        return firstFile.type.startsWith('video/');
      } else if (filterType === 'audio') {
        return firstFile.type.startsWith('audio/');
      }
      return true;
    });
  };

  const totalDuplicateSize = duplicateGroups.reduce((sum, group) => sum + group.totalSize, 0);
  const potentialSavings = duplicateGroups.reduce((sum, group) => {
    const keepOne = group.files[0].size;
    const totalSize = group.totalSize;
    return sum + (totalSize - keepOne);
  }, 0);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - File Selection & Controls */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Duplicate File Finder
              </CardTitle>
              <CardDescription>
                Detect duplicate files by content, name, or size to free up storage space
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file-input">Select Files</Label>
                <Input
                  id="file-input"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept="*/*"
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Select multiple files to scan for duplicates
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scan-method">Scan Method</Label>
                <Select value={scanMethod} onValueChange={(value: 'content' | 'name' | 'size') => setScanMethod(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="content">
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4" />
                        Content Hash (Most Accurate)
                      </div>
                    </SelectItem>
                    <SelectItem value="name">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        File Name
                      </div>
                    </SelectItem>
                    <SelectItem value="size">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4" />
                        File Size
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={findDuplicates} 
                disabled={isScanning || files.length === 0}
                className="w-full"
              >
                {isScanning ? (
                  <>
                    <Search className="h-4 w-4 mr-2 animate-spin" />
                    Scanning... {Math.round(scanProgress)}%
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Find Duplicates
                  </>
                )}
              </Button>

              {isScanning && (
                <div className="space-y-2">
                  <Progress value={scanProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    Scanning {files.length} files...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Summary */}
          {duplicateGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Scan Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold mb-1 text-blue-600">
                      {duplicateGroups.length}
                    </div>
                    <div className="text-sm text-muted-foreground">Duplicate Groups</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold mb-1 text-orange-600">
                      {formatFileSize(totalDuplicateSize)}
                    </div>
                    <div className="text-sm text-muted-foreground">Total Duplicate Size</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <div className="text-2xl font-bold mb-1 text-green-600">
                      {formatFileSize(potentialSavings)}
                    </div>
                    <div className="text-sm text-muted-foreground">Potential Savings</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Duplicate Groups */}
          {duplicateGroups.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Duplicate Files
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Files</SelectItem>
                        <SelectItem value="images">Images</SelectItem>
                        <SelectItem value="documents">Documents</SelectItem>
                        <SelectItem value="videos">Videos</SelectItem>
                        <SelectItem value="audio">Audio</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={exportResults}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredGroups().map((group, groupIndex) => (
                    <div key={groupIndex} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Group {groupIndex + 1}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {group.files.length} files • {formatFileSize(group.totalSize)}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectAllInGroup(group)}
                        >
                          Select All
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        {group.files.map((file) => (
                          <div key={file.id} className="flex items-center gap-3 p-2 bg-muted rounded">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(file.id)}
                              onChange={() => toggleFileSelection(file.id)}
                              className="rounded"
                            />
                            <File className="h-4 w-4 text-blue-600" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{file.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {formatFileSize(file.size)} • {file.type} • {formatDate(file.lastModified)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Actions & Info */}
        <div className="space-y-6">
          {/* File Info */}
          {files.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5" />
                  File Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Total Files:</span>
                  <Badge variant="secondary">{files.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Size:</span>
                  <span className="font-medium">
                    {formatFileSize(files.reduce((sum, file) => sum + file.size, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Scan Method:</span>
                  <Badge variant="outline">
                    {scanMethod === 'content' ? 'Content Hash' : 
                     scanMethod === 'name' ? 'File Name' : 'File Size'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          {duplicateGroups.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground mb-3">
                  {selectedFiles.size > 0 ? `${selectedFiles.size} files selected` : 'No files selected'}
                </div>
                
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  className="w-full"
                  disabled={selectedFiles.size === 0}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
                
                <Button
                  onClick={deleteSelectedFiles}
                  variant="destructive"
                  className="w-full"
                  disabled={selectedFiles.size === 0}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove Selected
                </Button>
              </CardContent>
            </Card>
          )}

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
                <p>Select multiple files to scan for duplicates</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Choose scan method: content hash, file name, or file size</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Review duplicate groups and select files to remove</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Export results or remove selected duplicates</p>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Content hash is most accurate but slower</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p>File size is fastest but may miss some duplicates</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Review carefully before removing files</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <p>Export results for backup before cleanup</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DuplicateFileFinder;
