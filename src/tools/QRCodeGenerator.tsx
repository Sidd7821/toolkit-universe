import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRCodeGenerator = () => {
  const [inputText, setInputText] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [activeTab, setActiveTab] = useState("text");
  const [qrSize, setQrSize] = useState("256");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [errorCorrection, setErrorCorrection] = useState("M");
  const { toast } = useToast();

  useEffect(() => {
    if (inputText.trim()) {
      generateQRCode();
    }
  }, [inputText, qrSize, foregroundColor, backgroundColor, errorCorrection]);

  const generateQRCode = async () => {
    if (!inputText.trim()) return;

    try {
      // Using a simple QR code generation approach
      // In a real app, you'd use a library like qrcode.js
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(inputText)}&color=${foregroundColor.replace('#', '')}&bgcolor=${backgroundColor.replace('#', '')}&ecc=${errorCorrection}`;
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeDataUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Downloaded!",
        description: "QR code saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download QR code",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(inputText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setInputText("");
    setQrCodeDataUrl("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setInputText("");
    setQrCodeDataUrl("");
  };

  const getPlaceholder = () => {
    switch (activeTab) {
      case "url":
        return "Enter website URL (e.g., https://example.com)...";
      case "email":
        return "Enter email address...";
      case "phone":
        return "Enter phone number...";
      case "wifi":
        return "Enter WiFi network name...";
      case "vcard":
        return "Enter contact information...";
      default:
        return "Enter text to generate QR code...";
    }
  };

  const getTabDescription = () => {
    switch (activeTab) {
      case "url":
        return "Generate QR codes for websites and links";
      case "email":
        return "Create QR codes for email addresses";
      case "phone":
        return "Generate QR codes for phone numbers";
      case "wifi":
        return "Create QR codes for WiFi network credentials";
      case "vcard":
        return "Generate QR codes for contact information";
      default:
        return "Generate QR codes from any text content";
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Generator</CardTitle>
          <CardDescription>
            Create custom QR codes for text, URLs, contact info, and more
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="text">Text</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="phone">Phone</TabsTrigger>
              <TabsTrigger value="wifi">WiFi</TabsTrigger>
              <TabsTrigger value="vcard">vCard</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-input" className="text-sm font-medium">
                  {getTabDescription()}
                </Label>
                <Textarea
                  id="qr-input"
                  placeholder={getPlaceholder()}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-size">QR Code Size</Label>
                <Select value={qrSize} onValueChange={setQrSize}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128x128</SelectItem>
                    <SelectItem value="256">256x256</SelectItem>
                    <SelectItem value="512">512x512</SelectItem>
                    <SelectItem value="1024">1024x1024</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="foreground-color">Foreground Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="foreground-color"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="background-color"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="error-correction">Error Correction</Label>
                <Select value={errorCorrection} onValueChange={setErrorCorrection}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="L">Low (7%)</SelectItem>
                    <SelectItem value="M">Medium (15%)</SelectItem>
                    <SelectItem value="Q">Quartile (25%)</SelectItem>
                    <SelectItem value="H">High (30%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={copyToClipboard} disabled={!inputText.trim()}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4">
              {qrCodeDataUrl ? (
                <>
                  <div className="border rounded-lg p-4 bg-white">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="Generated QR Code" 
                      className="max-w-full h-auto"
                    />
                  </div>
                  <Button onClick={downloadQRCode} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download QR Code
                  </Button>
                </>
              ) : (
                <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p>Enter text to generate</p>
                    <p className="text-sm">QR code will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>About QR Codes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            QR (Quick Response) codes are two-dimensional barcodes that can store various types of information.
            They're widely used for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Website links and URLs</li>
            <li>Contact information (vCards)</li>
            <li>WiFi network credentials</li>
            <li>Phone numbers and email addresses</li>
            <li>Text messages and notes</li>
            <li>Product information and tracking</li>
          </ul>
          <p className="pt-2">
            <strong>Error Correction:</strong> Higher error correction levels allow the QR code to remain readable even if partially damaged or obscured.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeGenerator;
