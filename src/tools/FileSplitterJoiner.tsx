import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Scissors, 
  FileUp, 
  Download, 
  RotateCcw, 
  FileSymlink, 
  FilePlus2,
  FileCheck,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FileSplitterJoiner = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState("split");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [chunkSize, setChunkSize] = useState<number>(1024); // Default 1MB
  const [chunkSizeUnit, setChunkSizeUnit] = useState<string>("KB");
  const [chunks, setChunks] = useState<Blob[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  // For joining
  const [selectedChunks, setSelectedChunks] = useState<File[]>([]);
  const [joinedFile, setJoinedFile] = useState<Blob | null>(null);
  const [joinedFileName, setJoinedFileName] = useState<string>("");
  
  const handleFileSplit = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to split",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    setChunks([]);
    
    try {
      const fileSize = selectedFile.size;
      const actualChunkSize = chunkSizeUnit === "MB" 
        ? chunkSize * 1024 * 1024 
        : chunkSizeUnit === "KB" 
          ? chunkSize * 1024 
          : chunkSize;
      
      const chunkCount = Math.ceil(fileSize / actualChunkSize);
      const newChunks: Blob[] = [];
      
      for (let i = 0; i < chunkCount; i++) {
        const start = i * actualChunkSize;
        const end = Math.min(fileSize, start + actualChunkSize);
        const chunk = selectedFile.slice(start, end);
        newChunks.push(chunk);
        
        setProgress(Math.round(((i + 1) / chunkCount) * 100));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      setChunks(newChunks);
      toast({
        title: "File Split Complete",
        description: `Split into ${newChunks.length} chunks`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to split the file. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };
  
  const handleFileJoin = async () => {
    if (selectedChunks.length === 0) {
      toast({
        title: "No chunks selected",
        description: "Please select file chunks to join",
        variant: "destructive"
      });
      return;
    }
    
    if (!joinedFileName) {
      toast({
        title: "No filename",
        description: "Please enter a name for the joined file",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    setProgress(0);
    
    try {
      // Sort chunks by name if they have numeric suffixes
      const sortedChunks = [...selectedChunks].sort((a, b) => {
        const nameA = a.name.toLowerCase();
        const nameB = b.name.toLowerCase();
        return nameA.localeCompare(nameB, undefined, { numeric: true });
      });
      
      const totalSize = sortedChunks.reduce((acc, chunk) => acc + chunk.size, 0);
      let processedSize = 0;
      const chunks: ArrayBuffer[] = [];
      
      for (let i = 0; i < sortedChunks.length; i++) {
        const chunk = sortedChunks[i];
        const buffer = await chunk.arrayBuffer();
        chunks.push(buffer);
        
        processedSize += chunk.size;
        setProgress(Math.round((processedSize / totalSize) * 100));
        
        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      const joinedBlob = new Blob(chunks);
      setJoinedFile(joinedBlob);
      
      toast({
        title: "File Join Complete",
        description: `${sortedChunks.length} chunks joined successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to join the files. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setChunks([]);
    }
  };
  
  const handleChunksSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedChunks(filesArray);
      
      // Try to determine a good default filename from the first chunk
      if (filesArray.length > 0 && !joinedFileName) {
        const firstName = filesArray[0].name;
        // Remove any numeric suffixes like .001, .part1, etc.
        const baseName = firstName.replace(/\.part\d+$|\.\d+$/, '');
        setJoinedFileName(baseName);
      }
    }
  };
  
  const downloadChunk = (chunk: Blob, index: number) => {
    const url = URL.createObjectURL(chunk);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedFile?.name}.part${index + 1}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const downloadJoinedFile = () => {
    if (!joinedFile) return;
    
    const url = URL.createObjectURL(joinedFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = joinedFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const resetSplit = () => {
    setSelectedFile(null);
    setChunks([]);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const resetJoin = () => {
    setSelectedChunks([]);
    setJoinedFile(null);
    setJoinedFileName("");
    setProgress(0);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scissors className="h-6 w-6" />
          <span>File Splitter & Joiner</span>
        </CardTitle>
        <CardDescription>
          Split large files into smaller chunks or join multiple chunks back into a single file
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="split">Split File</TabsTrigger>
            <TabsTrigger value="join">Join Files</TabsTrigger>
          </TabsList>
          
          <TabsContent value="split" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="file-upload">Select File to Split</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="file-upload" 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileSelect} 
                    className="flex-1"
                  />
                  {selectedFile && (
                    <Button variant="outline" size="icon" onClick={resetSplit}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {selectedFile && (
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Size: {formatFileSize(selectedFile.size)}
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="chunk-size">Chunk Size</Label>
                  <Input 
                    id="chunk-size" 
                    type="number" 
                    min="1"
                    value={chunkSize}
                    onChange={(e) => setChunkSize(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chunk-unit">Unit</Label>
                  <select 
                    id="chunk-unit"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={chunkSizeUnit}
                    onChange={(e) => setChunkSizeUnit(e.target.value)}
                  >
                    <option value="KB">KB</option>
                    <option value="MB">MB</option>
                  </select>
                </div>
              </div>
              
              <Button 
                onClick={handleFileSplit} 
                disabled={!selectedFile || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Split File"}
              </Button>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {chunks.length > 0 && (
                <div className="space-y-3 mt-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">File Chunks</h3>
                    <Badge variant="outline">{chunks.length} chunks</Badge>
                  </div>
                  
                  <div className="border rounded-md divide-y max-h-60 overflow-y-auto">
                    {chunks.map((chunk, index) => (
                      <div key={index} className="p-3 flex items-center justify-between hover:bg-muted/50">
                        <div className="flex items-center gap-2">
                          <FilePlus2 className="h-4 w-4" />
                          <span>
                            Part {index + 1} <span className="text-sm text-muted-foreground">({formatFileSize(chunk.size)})</span>
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => downloadChunk(chunk, index)}>
                          <Download className="h-4 w-4 mr-1" /> Download
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="join" className="space-y-4 mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="chunks-upload">Select File Chunks to Join</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="chunks-upload" 
                    type="file" 
                    multiple
                    onChange={handleChunksSelect} 
                    className="flex-1"
                  />
                  {selectedChunks.length > 0 && (
                    <Button variant="outline" size="icon" onClick={resetJoin}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
              
              {selectedChunks.length > 0 && (
                <div className="p-4 border rounded-md bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-5 w-5 text-green-500" />
                    <span className="font-medium">{selectedChunks.length} chunks selected</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Size: {formatFileSize(selectedChunks.reduce((acc, chunk) => acc + chunk.size, 0))}
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="output-filename">Output Filename</Label>
                <Input 
                  id="output-filename" 
                  type="text" 
                  placeholder="Enter filename for joined file"
                  value={joinedFileName}
                  onChange={(e) => setJoinedFileName(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleFileJoin} 
                disabled={selectedChunks.length === 0 || !joinedFileName || isProcessing}
                className="w-full"
              >
                {isProcessing ? "Processing..." : "Join Files"}
              </Button>
              
              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
              
              {joinedFile && (
                <div className="p-4 border rounded-md bg-green-50 dark:bg-green-950/20 space-y-3">
                  <div className="flex items-center gap-2">
                    <FileSymlink className="h-5 w-5 text-green-500" />
                    <span className="font-medium">File Join Complete</span>
                  </div>
                  <div className="text-sm">
                    <div>Filename: {joinedFileName}</div>
                    <div>Size: {formatFileSize(joinedFile.size)}</div>
                  </div>
                  <Button onClick={downloadJoinedFile} className="w-full">
                    <Download className="h-4 w-4 mr-2" /> Download Joined File
                  </Button>
                </div>
              )}
              
              <div className="p-4 border rounded-md bg-blue-50 dark:bg-blue-950/20">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium">Tips for joining files:</p>
                    <ul className="list-disc list-inside mt-1 space-y-1">
                      <li>Select all chunks in the correct order</li>
                      <li>Files will be automatically sorted if they have numeric suffixes</li>
                      <li>Make sure all chunks are from the same original file</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FileSplitterJoiner;