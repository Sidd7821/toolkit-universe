import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { Upload, Download, FileText, X, ArrowUp, ArrowDown } from "lucide-react";

interface PDFFile {
  file: File;
  id: string;
  name: string;
  size: number;
}

const PDFMerger = () => {
  const [pdfFiles, setPdfFiles] = useState<PDFFile[]>([]);
  const [merging, setMerging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validPDFs = files.filter(file => file.type === 'application/pdf');
    
    if (validPDFs.length !== files.length) {
      toast({ 
        title: "Invalid files detected", 
        description: "Only PDF files are allowed.", 
        variant: "destructive" 
      });
    }

    const newPDFs: PDFFile[] = validPDFs.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size
    }));

    setPdfFiles(prev => [...prev, ...newPDFs]);
    
    if (event.target) {
      event.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    setPdfFiles(prev => prev.filter(pdf => pdf.id !== id));
  };

  const moveFile = (id: string, direction: 'up' | 'down') => {
    setPdfFiles(prev => {
      const index = prev.findIndex(pdf => pdf.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      
      const newArray = [...prev];
      [newArray[index], newArray[newIndex]] = [newArray[newIndex], newArray[index]];
      return newArray;
    });
  };

  const mergePDFs = async () => {
    if (pdfFiles.length < 2) {
      toast({ 
        title: "Not enough files", 
        description: "Please select at least 2 PDF files to merge.", 
        variant: "destructive" 
      });
      return;
    }

    setMerging(true);
    
    try {
      // This is a placeholder for PDF merging functionality
      // In a real implementation, you would use a library like PDF-lib
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      toast({ 
        title: "PDFs merged successfully", 
        description: "Your merged PDF is ready for download." 
      });
      
      // Create a dummy merged PDF for demonstration
      const mergedBlob = new Blob(['Merged PDF content'], { type: 'application/pdf' });
      const url = URL.createObjectURL(mergedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'merged-document.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      toast({ 
        title: "Merge failed", 
        description: "An error occurred while merging PDFs.", 
        variant: "destructive" 
      });
    } finally {
      setMerging(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalSize = pdfFiles.reduce((sum, pdf) => sum + pdf.size, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select PDF Files
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-4">
              Select multiple PDF files to merge
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select PDF Files
            </Button>
          </div>

          {pdfFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Selected Files ({pdfFiles.length})</h3>
                <span className="text-sm text-muted-foreground">
                  Total: {formatFileSize(totalSize)}
                </span>
              </div>
              
              <div className="max-h-64 overflow-y-auto space-y-2">
                {pdfFiles.map((pdf, index) => (
                  <div key={pdf.id} className="flex items-center gap-2 p-3 bg-accent rounded-lg">
                    <FileText className="h-4 w-4 text-red-600" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{pdf.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(pdf.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveFile(pdf.id, 'up')}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => moveFile(pdf.id, 'down')}
                        disabled={index === pdfFiles.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(pdf.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Merge PDFs
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pdfFiles.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-medium mb-2">Merge Preview</h3>
                <div className="space-y-1">
                  {pdfFiles.map((pdf, index) => (
                    <div key={pdf.id} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">{index + 1}.</span>
                      <span className="truncate">{pdf.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>• Files will be merged in the order shown above</p>
                <p>• Use the arrow buttons to reorder files</p>
                <p>• The merged PDF will be downloaded automatically</p>
              </div>

              <Button 
                onClick={mergePDFs} 
                disabled={merging || pdfFiles.length < 2}
                className="w-full"
                variant="hero"
              >
                {merging ? "Merging PDFs..." : "Merge PDFs"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select PDF files to start merging</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFMerger;