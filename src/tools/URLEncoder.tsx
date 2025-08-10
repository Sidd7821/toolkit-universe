import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RotateCcw, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const URLEncoder = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [activeTab, setActiveTab] = useState("encode");
  const { toast } = useToast();

  const encodeURL = () => {
    try {
      const encoded = encodeURIComponent(inputText);
      setOutputText(encoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encode URL",
        variant: "destructive",
      });
    }
  };

  const decodeURL = () => {
    try {
      const decoded = decodeURIComponent(inputText);
      setOutputText(decoded);
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid encoded URL",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "URL copied to clipboard",
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

  const openURL = () => {
    try {
      const url = outputText.startsWith('http') ? outputText : `https://${outputText}`;
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
          <CardTitle>URL Encoder/Decoder</CardTitle>
          <CardDescription>
            Encode URLs to safe format or decode encoded URLs back to readable format
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encode">Encode URL</TabsTrigger>
              <TabsTrigger value="decode">Decode URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="encode" className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="encode-input" className="text-sm font-medium">
                  URL to Encode
                </label>
                <Textarea
                  id="encode-input"
                  placeholder="Enter URL to encode (e.g., https://example.com/path with spaces)..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={encodeURL} disabled={!inputText.trim()}>
                  Encode URL
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
                  Encoded URL to Decode
                </label>
                <Textarea
                  id="decode-input"
                  placeholder="Enter encoded URL to decode..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={decodeURL} disabled={!inputText.trim()}>
                  Decode URL
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
              <div className="flex gap-2">
                {activeTab === "decode" && isValidURL(outputText) && (
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
              <pre className="whitespace-pre-wrap break-all text-sm">{outputText}</pre>
            </div>
            {activeTab === "decode" && isValidURL(outputText) && (
              <p className="text-xs text-green-600 mt-2">✓ Valid URL format detected</p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About URL Encoding</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            URL encoding (also called percent-encoding) converts special characters in URLs to a format that can be safely transmitted over the internet.
          </p>
          <div className="space-y-2">
            <p><strong>Common characters that get encoded:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Space → %20</li>
              <li>! → %21</li>
              <li>" → %22</li>
              <li># → %23</li>
              <li>$ → %24</li>
              <li>% → %25</li>
              <li>& → %26</li>
              <li>' → %27</li>
              <li>( → %28</li>
              <li>) → %29</li>
            </ul>
          </div>
          <p className="pt-2">
            <strong>Use cases:</strong> URLs with spaces, special characters, non-ASCII characters, or when embedding URLs in other documents.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default URLEncoder;
