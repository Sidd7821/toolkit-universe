import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Download, QrCode, BarChart3 } from "lucide-react";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";

const BarcodeGenerator = () => {
  const [text, setText] = useState("");
  const [barcodeType, setBarcodeType] = useState("CODE128");
  const [barcodeData, setBarcodeData] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const barcodeRef = useRef(null);
  const qrCanvasRef = useRef(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const barcodeTypes = [
    { value: "CODE128", label: "Code 128", description: "Alphanumeric barcode" },
    { value: "CODE39", label: "Code 39", description: "Alphanumeric barcode" },
    { value: "EAN13", label: "EAN-13", description: "13-digit product code" },
    { value: "EAN8", label: "EAN-8", description: "8-digit product code" },
    { value: "UPC", label: "UPC-A", description: "12-digit product code" },
  ];

  const validateInput = () => {
    const input = text.trim();
    switch (barcodeType) {
      case "EAN13":
        if (!/^\d{12,13}$/.test(input)) return showToast("EAN-13 requires 12–13 digits."), false;
        break;
      case "EAN8":
        if (!/^\d{7,8}$/.test(input)) return showToast("EAN-8 requires 7–8 digits."), false;
        break;
      case "UPC":
        if (!/^\d{11,12}$/.test(input)) return showToast("UPC-A requires 11–12 digits."), false;
        break;
      case "CODE39":
        if (!/^[0-9A-Z\-. $/+%]*$/.test(input.toUpperCase())) return showToast("Invalid characters for Code 39."), false;
        break;
      case "CODE128":
        if (!input) return showToast("Code 128 requires non-empty input."), false;
        break;
    }
    return true;
  };

  const generateBarcode = async () => {
    if (!validateInput()) return;
    setBarcodeData(text.trim());

    try {
      if (barcodeRef.current) {
        JsBarcode(barcodeRef.current, text.trim(), {
          format: barcodeType,
          width: 2,
          height: 100,
          displayValue: true,
          font: "monospace",
          fontSize: 14,
          background: "#f8fafc",
          lineColor: "#000000",
        });
      }

      if (qrCanvasRef.current) {
        await QRCode.toCanvas(qrCanvasRef.current, text.trim(), {
          width: 200,
          margin: 2,
          color: { dark: "#000000", light: "#ffffff" },
        });
      }

      showToast(`${barcodeType} generated successfully!`);
    } catch (err) {
      showToast("Error generating code: " + err.message);
    }
  };

  const copyToClipboard = async () => {
    if (!barcodeData) return;
    try {
      await navigator.clipboard.writeText(barcodeData);
      showToast("Data copied to clipboard!");
    } catch {
      showToast("Unable to copy to clipboard.");
    }
  };

  const downloadCode = () => {
    if (!barcodeData) return;
    if (showQR) {
      const link = document.createElement("a");
      link.download = `qr-${barcodeType}-${barcodeData}.png`;
      link.href = qrCanvasRef.current.toDataURL("image/png");
      link.click();
    } else {
      const svgData = new XMLSerializer().serializeToString(barcodeRef.current);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const link = document.createElement("a");
        link.download = `barcode-${barcodeType}-${barcodeData}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(svgData);
    }
  };

  useEffect(() => {
    setBarcodeData("");
    setShowQR(false);
  }, [barcodeType]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-slate-900 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" /> Barcode Generator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label>Barcode Type</Label>
              <Select value={barcodeType} onValueChange={setBarcodeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select barcode type" />
                </SelectTrigger>
                <SelectContent>
                  {barcodeTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label} – <span className="text-slate-500">{type.description}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Barcode Data</Label>
              <Input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter data"
                className="font-mono"
              />
            </div>

            <Button onClick={generateBarcode} className="w-full" size="lg" disabled={!text.trim()}>
              <BarChart3 className="h-4 w-4 mr-2" /> Generate
            </Button>

            {barcodeData && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={copyToClipboard} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button onClick={downloadCode} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
                <Button onClick={() => setShowQR(!showQR)} variant="outline" className="w-full">
                  <QrCode className="h-4 w-4 mr-2" /> {showQR ? "Show Barcode" : "Show QR Code"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {showQR ? <QrCode className="h-5 w-5" /> : <BarChart3 className="h-5 w-5" />}
              {showQR ? "QR Code" : "Generated Barcode"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {barcodeData ? (
              <div className="flex justify-center p-4 bg-slate-50 rounded-lg border border-dashed">
                {showQR ? (
                  <canvas ref={qrCanvasRef} />
                ) : (
                  <svg ref={barcodeRef}></svg>
                )}
              </div>
            ) : (
              <div className="text-center text-slate-500 py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-40" />
                Enter data and click "Generate" to see results.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BarcodeGenerator;
