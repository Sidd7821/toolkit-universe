import { useState, useEffect } from "react";
import { Copy, RefreshCw, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const NumberConverter = () => {
  const [decimal, setDecimal] = useState<string>("");
  const [binary, setBinary] = useState<string>("");
  const [hex, setHex] = useState<string>("");
  const [octal, setOctal] = useState<string>("");

  const convertFromDecimal = (value: string) => {
    if (!value || isNaN(Number(value))) {
      setBinary("");
      setHex("");
      setOctal("");
      return;
    }

    const num = parseInt(value, 10);
    if (isNaN(num)) return;

    setBinary(num.toString(2));
    setHex(num.toString(16).toUpperCase());
    setOctal(num.toString(8));
  };

  const convertFromBinary = (value: string) => {
    if (!value || !/^[01]+$/.test(value)) {
      setDecimal("");
      setHex("");
      setOctal("");
      return;
    }

    const num = parseInt(value, 2);
    if (isNaN(num)) return;

    setDecimal(num.toString());
    setHex(num.toString(16).toUpperCase());
    setOctal(num.toString(8));
  };

  const convertFromHex = (value: string) => {
    if (!value || !/^[0-9A-Fa-f]+$/.test(value)) {
      setDecimal("");
      setBinary("");
      setOctal("");
      return;
    }

    const num = parseInt(value, 16);
    if (isNaN(num)) return;

    setDecimal(num.toString());
    setBinary(num.toString(2));
    setOctal(num.toString(8));
  };

  const convertFromOctal = (value: string) => {
    if (!value || !/^[0-7]+$/.test(value)) {
      setDecimal("");
      setBinary("");
      setHex("");
      return;
    }

    const num = parseInt(value, 8);
    if (isNaN(num)) return;

    setDecimal(num.toString());
    setBinary(num.toString(2));
    setHex(num.toString(16).toUpperCase());
  };

  const handleDecimalChange = (value: string) => {
    setDecimal(value);
    convertFromDecimal(value);
  };

  const handleBinaryChange = (value: string) => {
    setBinary(value);
    convertFromBinary(value);
  };

  const handleHexChange = (value: string) => {
    setHex(value);
    convertFromHex(value);
  };

  const handleOctalChange = (value: string) => {
    setOctal(value);
    convertFromOctal(value);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const clearAll = () => {
    setDecimal("");
    setBinary("");
    setHex("");
    setOctal("");
  };

  const generateRandomNumber = () => {
    const randomNum = Math.floor(Math.random() * 10000);
    setDecimal(randomNum.toString());
    convertFromDecimal(randomNum.toString());
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Number System Converter</h2>
        <p className="text-muted-foreground">
          Convert between Binary, Decimal, Hexadecimal, and Octal number systems
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button onClick={generateRandomNumber} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Random Number
        </Button>
        <Button onClick={clearAll} variant="outline" size="sm">
          Clear All
        </Button>
      </div>

      <Tabs defaultValue="decimal" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="decimal">Decimal</TabsTrigger>
          <TabsTrigger value="binary">Binary</TabsTrigger>
          <TabsTrigger value="hex">Hexadecimal</TabsTrigger>
          <TabsTrigger value="octal">Octal</TabsTrigger>
        </TabsList>

        <TabsContent value="decimal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Decimal Input
              </CardTitle>
              <CardDescription>
                Enter a decimal number to convert to other number systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="decimal-input">Decimal Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="decimal-input"
                    type="number"
                    placeholder="Enter decimal number (e.g., 255)"
                    value={decimal}
                    onChange={(e) => handleDecimalChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(decimal, "Decimal")}
                    variant="outline"
                    size="icon"
                    disabled={!decimal}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="binary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Binary Input
              </CardTitle>
              <CardDescription>
                Enter a binary number (0s and 1s) to convert to other number systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="binary-input">Binary Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="binary-input"
                    placeholder="Enter binary number (e.g., 11111111)"
                    value={binary}
                    onChange={(e) => handleBinaryChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(binary, "Binary")}
                    variant="outline"
                    size="icon"
                    disabled={!binary}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hex" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Hexadecimal Input
              </CardTitle>
              <CardDescription>
                Enter a hexadecimal number (0-9, A-F) to convert to other number systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hex-input">Hexadecimal Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="hex-input"
                    placeholder="Enter hex number (e.g., FF)"
                    value={hex}
                    onChange={(e) => handleHexChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(hex, "Hexadecimal")}
                    variant="outline"
                    size="icon"
                    disabled={!hex}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="octal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Octal Input
              </CardTitle>
              <CardDescription>
                Enter an octal number (0-7) to convert to other number systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="octal-input">Octal Number</Label>
                <div className="flex gap-2">
                  <Input
                    id="octal-input"
                    placeholder="Enter octal number (e.g., 377)"
                    value={octal}
                    onChange={(e) => handleOctalChange(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => copyToClipboard(octal, "Octal")}
                    variant="outline"
                    size="icon"
                    disabled={!octal}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Decimal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-mono bg-muted p-3 rounded-lg text-center">
              {decimal || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Binary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono bg-muted p-3 rounded-lg text-center break-all">
              {binary || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Hexadecimal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono bg-muted p-3 rounded-lg text-center">
              {hex || "—"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Octal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-mono bg-muted p-3 rounded-lg text-center">
              {octal || "—"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Enter a number in any of the four number systems above</p>
          <p>• The converter will automatically calculate the equivalent values in all other systems</p>
          <p>• Use the copy buttons to copy individual values to your clipboard</p>
          <p>• Click "Random Number" to generate a random decimal number for testing</p>
          <p>• Use "Clear All" to reset all fields</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NumberConverter;
