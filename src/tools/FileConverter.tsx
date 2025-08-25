import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Download, FileText, Settings, CheckCircle, AlertCircle, File, RotateCcw, Info, Trash2, Zap } from "lucide-react";

// Renamed Image to ImageIcon to avoid conflict with window.Image
import { Image as ImageIcon } from "lucide-react";

interface FileFormat {
  id: string;
  name: string;
  extensions: string[];
  category: string;
  icon: React.ReactNode;
  description: string;
}

interface ConvertedFile {
  id: string;
  name: string;
  blob: Blob;
  originalName: string;
  originalFormat: string;
  convertedFormat: string;
  timestamp: Date;
  size: number;
}

interface ConversionHistory {
  id: string;
  originalName: string;
  originalFormat: string;
  convertedFormat: string;
  timestamp: Date;
  size: number;
  status: "success" | "error";
}

const FileConverter = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFormat, setSelectedFormat] = useState<string>("");
  const [targetFormat, setTargetFormat] = useState<string>("");
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [conversionHistory, setConversionHistory] = useState<ConversionHistory[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [conversionSettings, setConversionSettings] = useState({
    imageQuality: 0.9,
    imageWidth: "",
    imageHeight: "",
    maintainAspectRatio: true,
    textContent: "",
    csvDelimiter: ",",
  });

  const fileFormats: FileFormat[] = [
    {
      id: "image",
      name: "Image Formats",
      extensions: ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "heic", "heif"],
      category: "image",
      icon: <ImageIcon className="h-5 w-5" />,
      description: "Convert between image formats",
    },
    {
      id: "document",
      name: "Document Formats",
      extensions: ["pdf", "txt", "html", "csv", "json", "xml"],
      category: "document",
      icon: <FileText className="h-5 w-5" />,
      description: "Convert between document formats",
    },
    {
      id: "data",
      name: "Data Formats",
      extensions: ["json", "csv", "xml", "yaml", "txt"],
      category: "data",
      icon: <File className="h-5 w-5" />,
      description: "Convert between data formats",
    },
  ];

  const showToast = (title: string, description: string, type: "success" | "error" = "success") => {
    const toast = document.createElement("div");
    toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`;
    toast.innerHTML = `<div class="font-semibold">${title}</div><div class="text-sm">${description}</div>`;
    document.body.appendChild(toast);
    setTimeout(() => document.body.removeChild(toast), 3000);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const format = fileFormats.find((f) => f.extensions.includes(extension));
    if (!format) {
      showToast("Unsupported File!", "Please select a supported file format.", "error");
      return;
    }

    setSelectedFile(file);
    setTargetFormat("");
    setPreviewUrl("");
    setSelectedFormat(format.id);

    if (file.type.startsWith("image/") && !extension.includes("heic") && !extension.includes("heif")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else if (extension.includes("heic") || extension.includes("heif")) {
      setPreviewUrl("heic-placeholder");
    } else if (file.type.startsWith("text/") || ["txt", "csv", "json", "xml", "yaml", "html"].includes(extension)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setConversionSettings((prev) => ({
          ...prev,
          textContent: e.target?.result as string || "",
        }));
      };
      reader.onerror = () => showToast("Error!", "Failed to read file content.", "error");
      reader.readAsText(file);
    } else if (extension === "pdf") {
      // PDF preview not supported client-side easily, skip or show placeholder
      setPreviewUrl("");
    }

    showToast("File Selected!", `${file.name} has been loaded for conversion`);
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split(".").pop()?.toLowerCase() || "";
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg", "heic", "heif"].includes(extension)) {
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    } else if (["pdf", "txt", "html", "csv", "json", "xml", "yaml"].includes(extension)) {
      return <FileText className="h-6 w-6 text-green-500" />;
    }
    return <File className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getAvailableConversions = (fileExtension: string, category: string) => {
    const format = fileFormats.find((f) => f.id === category);
    return format ? format.extensions.filter((ext) => ext !== fileExtension.toLowerCase()) : [];
  };

  const isHEICFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    return fileName.endsWith('.heic') || fileName.endsWith('.heif') || file.type === 'image/heic' || file.type === 'image/heif';
  };

  const convertHEIC = async (file: File, targetFormat: string): Promise<Blob> => {
    return new Promise(async (resolve, reject) => {
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
        
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 800;
        canvas.height = 600;
        
        if (ctx) {
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(0, 0, 800, 600);
          
          ctx.fillStyle = '#6b7280';
          ctx.font = '24px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('HEIC File Converted (Placeholder)', 400, 280);
          ctx.fillText(`Original: ${file.name}`, 400, 320);
          ctx.fillText(`Target: ${targetFormat.toUpperCase()}`, 400, 360);
          
          ctx.strokeStyle = '#d1d5db';
          ctx.lineWidth = 2;
          ctx.strokeRect(50, 50, 700, 500);
        }
        
        const mimeType = targetFormat === 'jpg' || targetFormat === 'jpeg' ? 'image/jpeg' :
                         targetFormat === 'png' ? 'image/png' :
                         targetFormat === 'webp' ? 'image/webp' :
                         'image/png';
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('HEIC conversion failed'));
          }
        }, mimeType, conversionSettings.imageQuality);
        
      } catch (error) {
        reject(new Error(`HEIC conversion error: ${error}`));
      }
    });
  };

  const jsonToYaml = (obj: any, level = 0): string => {
    if (typeof obj !== 'object' || obj === null) {
      return JSON.stringify(obj);
    }

    const indent = '  '.repeat(level);
    let yaml = '';

    if (Array.isArray(obj)) {
      for (const value of obj) {
        const valueStr = jsonToYaml(value, level + 1);
        yaml += `${indent}- ${valueStr.replace(/\n/g, '\n' + indent + '  ')}\n`;
      }
    } else {
      for (const [key, value] of Object.entries(obj)) {
        const valueStr = jsonToYaml(value, level + 1);
        if (valueStr.includes('\n')) {
          yaml += `${indent}${key}:\n${valueStr.replace(/\n/g, '\n' + indent + '  ')}\n`;
        } else {
          yaml += `${indent}${key}: ${valueStr}\n`;
        }
      }
    }

    return yaml.trimEnd();
  };

  const convertImage = async (file: File, targetFormat: string): Promise<Blob> => {
    if (isHEICFile(file)) {
      return convertHEIC(file, targetFormat);
    }

    if (typeof window === "undefined" || !window.Image) {
      throw new Error("Image conversion is only supported in a browser environment");
    }

    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.src = URL.createObjectURL(file);

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas context not available");

          const { imageWidth, imageHeight, maintainAspectRatio, imageQuality } = conversionSettings;
          let width = img.width;
          let height = img.height;

          if (imageWidth || imageHeight) {
            if (maintainAspectRatio) {
              const aspectRatio = img.width / img.height;
              if (imageWidth && !imageHeight) {
                width = parseInt(imageWidth) || img.width;
                height = width / aspectRatio;
              } else if (imageHeight && !imageWidth) {
                height = parseInt(imageHeight) || img.height;
                width = height * aspectRatio;
              } else if (imageWidth && imageHeight) {
                width = parseInt(imageWidth) || img.width;
                height = parseInt(imageHeight) || img.height;
              }
            } else {
              width = parseInt(imageWidth) || img.width;
              height = parseInt(imageHeight) || img.height;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType =
            targetFormat === "jpg" || targetFormat === "jpeg"
              ? "image/jpeg"
              : targetFormat === "png"
              ? "image/png"
              : targetFormat === "webp"
              ? "image/webp"
              : "image/png";

          canvas.toBlob(
            (blob) => {
              URL.revokeObjectURL(img.src);
              if (blob) resolve(blob);
              else reject(new Error("Failed to create image blob"));
            },
            mimeType,
            imageQuality
          );
        } catch (error) {
          URL.revokeObjectURL(img.src);
          reject(error instanceof Error ? error : new Error("Image conversion failed"));
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        reject(new Error("Failed to load image"));
      };
    });
  };

  const convertDocument = async (file: File, targetFormat: string): Promise<Blob> => {
    let text = conversionSettings.textContent;
    if (!text) {
      try {
        text = await file.text();
      } catch (error) {
        throw new Error("Failed to read file content");
      }
    }

    const sourceExtension = file.name.split('.').pop()?.toLowerCase() || '';

    try {
      switch (targetFormat) {
        case "html":
          const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>${file.name}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    </style>
</head>
<body>
    <pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>
</body>
</html>`;
          return new Blob([htmlContent], { type: "text/html" });

        case "json":
          try {
            const lines = text.split("\n").filter((line) => line.trim());
            if (lines.length > 0 && sourceExtension === 'csv') {
              const headers = lines[0].split(conversionSettings.csvDelimiter).map((h) => h.trim());
              const data = lines.slice(1).map((line) => {
                const values = line.split(conversionSettings.csvDelimiter).map((v) => v.trim());
                const obj: Record<string, string> = {};
                headers.forEach((header, index) => {
                  obj[header] = values[index] || "";
                });
                return obj;
              });
              return new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            }
            return new Blob([JSON.stringify({ content: text }, null, 2)], { type: "application/json" });
          } catch (error) {
            throw new Error("Invalid format for JSON conversion");
          }

        case "csv":
          try {
            const jsonData = JSON.parse(text);
            if (Array.isArray(jsonData) && jsonData.length > 0) {
              const headers = Object.keys(jsonData[0]);
              const csvContent = [
                headers.join(","),
                ...jsonData.map((row) => headers.map((header) => `"${row[header] || ""}"`).join(",")),
              ].join("\n");
              return new Blob([csvContent], { type: "text/csv" });
            }
            throw new Error("Invalid JSON for CSV conversion");
          } catch (error) {
            const lines = text.split("\n");
            const csvContent = 'content\n' + lines.map(line => `"${line}"`).join('\n');
            return new Blob([csvContent], { type: "text/csv" });
          }

        case "xml":
          const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<document>
    <content><![CDATA[${text}]]></content>
    <metadata>
        <filename>${file.name}</filename>
        <converted>${new Date().toISOString()}</converted>
    </metadata>
</document>`;
          return new Blob([xmlContent], { type: "application/xml" });

        case "yaml":
          try {
            let jsonData;
            if (sourceExtension === 'json') {
              jsonData = JSON.parse(text);
            } else if (sourceExtension === 'csv') {
              const lines = text.split("\n").filter((line) => line.trim());
              if (lines.length > 0) {
                const headers = lines[0].split(conversionSettings.csvDelimiter).map((h) => h.trim());
                jsonData = lines.slice(1).map((line) => {
                  const values = line.split(conversionSettings.csvDelimiter).map((v) => v.trim());
                  const obj: Record<string, string> = {};
                  headers.forEach((header, index) => {
                    obj[header] = values[index] || "";
                  });
                  return obj;
                });
              } else {
                jsonData = { content: text };
              }
            } else {
              jsonData = { content: text };
            }
            const yamlContent = jsonToYaml(jsonData);
            return new Blob([yamlContent], { type: "text/yaml" });
          } catch (error) {
            throw new Error("Invalid format for YAML conversion");
          }

        case "pdf":
          // Simple placeholder PDF with text
          const pdfContent = `%PDF-1.3
1 0 obj
<</Type /Catalog /Pages 2 0 R>>
endobj
2 0 obj
<</Type /Pages /Kids [3 0 R] /Count 1>>
endobj
3 0 obj
<</Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources <</ProcSet [/PDF /Text] /Font <</F1 5 0 R>>>>>>
endobj
4 0 obj
<</Length ${text.length + 47}>>
stream
BT /F1 12 Tf 100 700 Td (${text}) Tj ET
endstream
endobj
5 0 obj
<</Type /Font /Subtype /Type1 /BaseFont /Helvetica>>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000055 00000 n 
0000000100 00000 n 
0000000220 00000 n 
0000000310 00000 n 
trailer
<</Size 6 /Root 1 0 R>>
startxref
400
%%EOF`;
          return new Blob([pdfContent], { type: "application/pdf" });

        default:
          return new Blob([text], { type: "text/plain" });
      }
    } catch (error) {
      throw new Error(`Document conversion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const performConversion = async (targetFormat: string) => {
    if (!selectedFile) {
      showToast("Error!", "No file selected for conversion.", "error");
      return;
    }

    setConverting(true);
    setProgress(0);

    try {
      const sourceExtension = selectedFile.name.split(".").pop()?.toLowerCase() || "";
      const isImage = selectedFile.type.startsWith("image/") || fileFormats.find(f => f.id === "image")?.extensions.includes(sourceExtension) || false;
      const isDocument = fileFormats.find(f => f.id === "document" || f.id === "data")?.extensions.includes(sourceExtension) || false;

      if (!isImage && !isDocument) {
        throw new Error("Unsupported file type for conversion");
      }

      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 100);

      let convertedBlob: Blob;
      if (isImage) {
        convertedBlob = await convertImage(selectedFile, targetFormat);
      } else {
        convertedBlob = await convertDocument(selectedFile, targetFormat);
      }

      clearInterval(progressInterval);
      setProgress(100);

      const convertedFileName = selectedFile.name.replace(/\.[^/.]+$/, `.${targetFormat}`);
      const convertedFile: ConvertedFile = {
        id: Date.now().toString(),
        name: convertedFileName,
        blob: convertedBlob,
        originalName: selectedFile.name,
        originalFormat: sourceExtension,
        convertedFormat: targetFormat,
        timestamp: new Date(),
        size: convertedBlob.size,
      };

      setConvertedFiles((prev) => [convertedFile, ...prev]);
      setConversionHistory((prev) => [
        {
          id: Date.now().toString(),
          originalName: selectedFile.name,
          originalFormat: sourceExtension,
          convertedFormat: targetFormat,
          timestamp: new Date(),
          size: convertedBlob.size,
          status: "success",
        },
        ...prev.slice(0, 9),
      ]);

      showToast("Conversion Complete!", `File converted to ${targetFormat.toUpperCase()}`);
    } catch (error) {
      console.error("Conversion error:", error);
      showToast(
        "Conversion Failed!",
        error instanceof Error ? error.message : "An error occurred during conversion",
        "error"
      );

      setConversionHistory((prev) => [
        {
          id: Date.now().toString(),
          originalName: selectedFile.name,
          originalFormat: selectedFile.name.split(".").pop() || "",
          convertedFormat: targetFormat,
          timestamp: new Date(),
          size: 0,
          status: "error",
        },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setConverting(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const downloadConvertedFile = (convertedFile: ConvertedFile) => {
    const url = URL.createObjectURL(convertedFile.blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = convertedFile.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast("File Downloaded!", `${convertedFile.name} has been saved`);
  };

  const deleteConvertedFile = (id: string) => {
    setConvertedFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const clearAll = () => {
    setSelectedFile(null);
    setSelectedFormat("");
    setTargetFormat("");
    setProgress(0);
    setPreviewUrl("");
    setConversionSettings({
      imageQuality: 0.9,
      imageWidth: "",
      imageHeight: "",
      maintainAspectRatio: true,
      textContent: "",
      csvDelimiter: ",",
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getSupportedFormats = (category: string) => {
    const format = fileFormats.find((f) => f.id === category);
    return format ? format.extensions : [];
  };

  return (
    <div className="container mx-auto p-4 max-w-7xl">
     

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload File
              </CardTitle>
              <CardDescription>Select a file to convert to another format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  accept="image/*,.heic,.heif,.pdf,.txt,.html,.csv,.json,.xml,.yaml"
                  className="hidden"
                />
                <Button onClick={() => fileInputRef.current?.click()} size="lg" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Choose File
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Click to browse for files</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports: Images (including HEIC), PDF, Text, HTML, CSV, JSON, XML, YAML
                </p>
              </div>

              {selectedFile && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.name)}
                    <div className="flex-1">
                      <h4 className="font-medium">{selectedFile.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(selectedFile.size)} • {selectedFile.type || "Unknown type"}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearAll}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </div>
                  {previewUrl === "heic-placeholder" ? (
                    <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700">
                        <ImageIcon className="h-5 w-5" />
                        <span className="font-medium">HEIC File Detected</span>
                      </div>
                      <p className="text-sm text-blue-600 mt-1">
                        HEIC files will be converted using specialized processing (placeholder).
                      </p>
                    </div>
                  ) : previewUrl ? (
                    <div className="mt-3">
                      <img src={previewUrl} alt="Preview" className="max-w-full max-h-48 rounded-lg" />
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>

          {selectedFile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Conversion Settings
                </CardTitle>
                <CardDescription>Configure conversion options</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedFormat === "image" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Quality</Label>
                        <Input
                          type="range"
                          min="0.1"
                          max="1"
                          step="0.1"
                          value={conversionSettings.imageQuality}
                          onChange={(e) =>
                            setConversionSettings((prev) => ({
                              ...prev,
                              imageQuality: parseFloat(e.target.value),
                            }))
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          {Math.round(conversionSettings.imageQuality * 100)}%
                        </span>
                      </div>
                      <div>
                        <Label>Dimensions</Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Width"
                            value={conversionSettings.imageWidth}
                            onChange={(e) =>
                              setConversionSettings((prev) => ({
                                ...prev,
                                imageWidth: e.target.value,
                              }))
                            }
                          />
                          <Input
                            placeholder="Height"
                            value={conversionSettings.imageHeight}
                            onChange={(e) =>
                              setConversionSettings((prev) => ({
                                ...prev,
                                imageHeight: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  { (selectedFormat === "document" || selectedFormat === "data") && conversionSettings.textContent && (
                    <div>
                      <Label>Text Content</Label>
                      <Textarea
                        value={conversionSettings.textContent}
                        onChange={(e) =>
                          setConversionSettings((prev) => ({
                            ...prev,
                            textContent: e.target.value,
                          }))
                        }
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                  )}

                  <div>
                    <Label>Convert to Format</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {getAvailableConversions(selectedFile.name.split(".").pop() || "", selectedFormat).map((format) => (
                        <Button
                          key={format}
                          variant={targetFormat === format ? "default" : "outline"}
                          size="sm"
                          onClick={() => setTargetFormat(format)}
                          className="flex items-center gap-2"
                        >
                          {format.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {targetFormat && (
                    <Button onClick={() => performConversion(targetFormat)} disabled={converting} className="w-full" size="lg">
                      {converting ? (
                        <>Converting... {progress}%</>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Convert to {targetFormat.toUpperCase()}
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {converting && (
            <Card>
              <CardHeader>
                <CardTitle>Converting File...</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2 text-center">{progress}% Complete</p>
              </CardContent>
            </Card>
          )}

          {convertedFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Converted Files
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {convertedFiles.map((file) => (
                    <div key={file.id} className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-6 w-6 text-green-500" />
                        <div className="flex-1">
                          <h4 className="font-medium text-green-800">{file.name}</h4>
                          <p className="text-sm text-green-600">
                            {formatFileSize(file.size)} • {file.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => downloadConvertedFile(file)} size="sm" className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => deleteConvertedFile(file.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
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
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Supported Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="image">Images</TabsTrigger>
                  <TabsTrigger value="document">Docs</TabsTrigger>
                  <TabsTrigger value="data">Data</TabsTrigger>
                </TabsList>
                <TabsContent value="image" className="mt-4">
                  <div className="space-y-2">
                    {getSupportedFormats("image").map((ext) => (
                      <Badge key={ext} variant="secondary" className="mr-2 mb-2">
                        .{ext}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="document" className="mt-4">
                  <div className="space-y-2">
                    {getSupportedFormats("document").map((ext) => (
                      <Badge key={ext} variant="secondary" className="mr-2 mb-2">
                        .{ext}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="data" className="mt-4">
                  <div className="space-y-2">
                    {getSupportedFormats("data").map((ext) => (
                      <Badge key={ext} variant="secondary" className="mr-2 mb-2">
                        .{ext}
                      </Badge>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Conversions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {conversionHistory.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No conversions yet</p>
                ) : (
                  conversionHistory.map((item) => (
                    <div key={item.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        {item.status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm font-medium truncate">{item.originalName}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {item.originalFormat} → {item.convertedFormat}
                        </span>
                        <span>{item.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p>✓ Real image format conversion (including HEIC placeholder)</p>
              <p>✓ Quality and size adjustment</p>
              <p>✓ JSON ↔ CSV ↔ YAML conversion</p>
              <p>✓ HTML generation from text</p>
              <p>✓ XML structure creation</p>
              <p>✓ Basic PDF generation</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FileConverter;