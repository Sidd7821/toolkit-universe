import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Camera, CameraOff, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QRCodeScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState("");
  const [activeTab, setActiveTab] = useState("camera");
  const [manualInput, setManualInput] = useState("");
  const [cameraPermission, setCameraPermission] = useState<"granted" | "denied" | "prompt">("prompt");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsScanning(true);
        setCameraPermission("granted");
        
        // Start QR code detection
        startQRDetection();
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      setCameraPermission("denied");
      toast({
        title: "Camera Access Denied",
        description: "Please allow camera access to scan QR codes",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    // In a real implementation, you would use a QR code detection library
    // For now, we'll simulate the scanning process
    const checkForQRCode = () => {
      if (!isScanning) return;
      
      // Simulate QR code detection
      // In practice, you'd use a library like jsQR or ZXing
      setTimeout(() => {
        if (isScanning) {
          // Simulate finding a QR code
          const mockData = "https://example.com/scanned-qr-code";
          handleQRCodeDetected(mockData);
        }
      }, 3000);
    };

    checkForQRCode();
  };

  const handleQRCodeDetected = (data: string) => {
    setScannedData(data);
    stopCamera();
    toast({
      title: "QR Code Detected!",
      description: "Successfully scanned QR code",
    });
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      setScannedData(manualInput.trim());
      setManualInput("");
      toast({
        title: "QR Code Data Added",
        description: "Manual input processed successfully",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(scannedData);
      toast({
        title: "Copied!",
        description: "Data copied to clipboard",
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
    setScannedData("");
    setManualInput("");
    stopCamera();
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "camera") {
      setScannedData("");
    } else {
      stopCamera();
    }
  };

  const openURL = () => {
    try {
      const url = scannedData.startsWith('http') ? scannedData : `https://${scannedData}`;
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid URL format",
        variant: "destructive",
      });
    }
  };

  const isValidURL = (string: string) => {
    try {
      new URL(string.startsWith('http') ? string : `https://${string}`);
      return true;
    } catch (_) {
      return false;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>QR Code Scanner</CardTitle>
          <CardDescription>
            Scan QR codes using your camera or manually input QR code data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="camera">Camera Scanner</TabsTrigger>
              <TabsTrigger value="manual">Manual Input</TabsTrigger>
            </TabsList>
            
            <TabsContent value="camera" className="space-y-4">
              <div className="space-y-4">
                {!isScanning ? (
                  <div className="flex flex-col items-center justify-center space-y-4 py-8">
                    <div className="w-64 h-64 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <Camera className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                        <p>Camera not active</p>
                        <p className="text-sm">Click start to begin scanning</p>
                      </div>
                    </div>
                    <Button onClick={startCamera} disabled={cameraPermission === "denied"}>
                      <Camera className="w-4 h-4 mr-2" />
                      Start Camera
                    </Button>
                    {cameraPermission === "denied" && (
                      <p className="text-sm text-red-600">
                        Camera access denied. Please enable camera permissions in your browser.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full max-w-md mx-auto border rounded-lg"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-white rounded-lg shadow-lg">
                          <div className="w-full h-full border-2 border-dashed border-white opacity-50"></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Button onClick={stopCamera} variant="destructive">
                        <CameraOff className="w-4 h-4 mr-2" />
                        Stop Camera
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-input">QR Code Data</Label>
                <Input
                  id="manual-input"
                  placeholder="Enter or paste QR code data here..."
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={handleManualSubmit} disabled={!manualInput.trim()}>
                  Process Data
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {scannedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Scanned Result
              <div className="flex gap-2">
                {isValidURL(scannedData) && (
                  <Button variant="outline" size="sm" onClick={openURL}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open URL
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap break-all text-sm">{scannedData}</pre>
            </div>
            {isValidURL(scannedData) && (
              <p className="text-xs text-green-600 mt-2">✓ Valid URL detected</p>
            )}
            <div className="mt-4 text-sm text-muted-foreground">
              <p><strong>Data Type:</strong> {isValidURL(scannedData) ? "URL/Link" : "Text/Data"}</p>
              <p><strong>Length:</strong> {scannedData.length} characters</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <p><strong>Camera Scanner:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Allow camera access when prompted</li>
              <li>Point your camera at a QR code</li>
              <li>Hold steady until the code is detected</li>
              <li>The scanned data will appear automatically</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p><strong>Manual Input:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Type or paste QR code data manually</li>
              <li>Useful when you can't scan with camera</li>
              <li>Supports URLs, text, and other data formats</li>
            </ul>
          </div>
          <p className="pt-2">
            <strong>Tip:</strong> Make sure the QR code is well-lit and clearly visible for best scanning results.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeScanner;
