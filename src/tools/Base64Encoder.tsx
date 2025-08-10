import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Base64Encoder = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeTab, setActiveTab] = useState("encode");
  const { toast } = useToast();

  const encodeToBase64 = () => {
    try {
      const encoded = btoa(inputText);
      setOutputText(encoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode text to Base64",
        variant: "destructive",
      });
    }
  };

  const decodeFromBase64 = () => {
    try {
      const decoded = atob(inputText);
      setOutputText(decoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid Base64 string",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
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
    setOutputText("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setInputText("");
    setOutputText("");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Base64 Encoder/Decoder</CardTitle>
          <CardDescription>
            Encode text to Base64 or decode Base64 back to readable text
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode to Base64</TabsTrigger>
              <TabsTrigger value="decode">Decode from Base64</TabsTrigger>
            </TabsList>
            
            <TabsContent value="encode" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="encode-input" className="text-sm font-medium">
                  Text to Encode
                </label>
                <Textarea
                  id="encode-input"
                  placeholder="Enter text to encode to Base64..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={encodeToBase64} disabled={!inputText.trim()}>
                  Encode to Base64
                </Button>
                <Button variant="outline" onClick={clearAll}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="decode" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="decode-input" className="text-sm font-medium">
                  Base64 to Decode
                </label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter Base64 string to decode..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={decodeFromBase64} disabled={!inputText.trim()}>
                  Decode from Base64
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

      {outputText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Result
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap break-all text-sm">{outputText}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Base64</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Base64 is a binary-to-text encoding scheme that represents binary data in an ASCII string format.
            It's commonly used for:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Encoding binary data in email messages</li>
            <li>Storing complex data in JSON</li>
            <li>Transmitting binary data over text-based protocols</li>
            <li>Data URLs in web applications</li>
          </ul>
          <p className="pt-2">
            <strong>Note:</strong> Base64 encoding increases the size of data by approximately 33% compared to the original binary data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Base64Encoder;
