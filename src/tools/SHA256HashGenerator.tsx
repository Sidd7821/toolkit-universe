import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Copy, Hash, RefreshCw, FileText, Shield } from "lucide-react";

const SHA256HashGenerator = () => {
  const [input, setInput] = useState("");
  const [hash, setHash] = useState("");
  const [inputType, setInputType] = useState<"text" | "file">("text");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateSHA256 = async (data: string) => {
    try {
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      
      // Use Web Crypto API for SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      throw new Error("Failed to generate SHA-256 hash");
    }
  };

  const handleGenerateHash = async () => {
    if (!input.trim()) {
      toast({ title: "Error", description: "Please enter some text or select a file.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    try {
      const generatedHash = await generateSHA256(input);
      setHash(generatedHash);
      toast({ title: "Hash generated", description: "SHA-256 hash created successfully!" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate hash.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setInput(content);
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = async () => {
    if (!hash) return;
    
    try {
      await navigator.clipboard.writeText(hash);
      toast({ title: "Copied!", description: "Hash copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Unable to copy to clipboard.", variant: "destructive" });
    }
  };

  const clearAll = () => {
    setInput("");
    setHash("");
    setInputType("text");
  };

  const getHashInfo = () => {
    if (!hash) return null;
    
    return {
      length: hash.length,
      format: "Hexadecimal",
      algorithm: "SHA-256",
      security: "Cryptographically Secure",
      collisionResistance: "Very High"
    };
  };

  const hashInfo = getHashInfo();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            SHA256 Hash Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Input Type</Label>
            <div className="flex gap-4">
              <Button
                variant={inputType === "text" ? "default" : "outline"}
                onClick={() => setInputType("text")}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                Text Input
              </Button>
              <Button
                variant={inputType === "file" ? "default" : "outline"}
                onClick={() => setInputType("file")}
                className="flex-1"
              >
                <FileText className="h-4 w-4 mr-2" />
                File Upload
              </Button>
            </div>
          </div>

          {inputType === "text" ? (
            <div className="space-y-2">
              <Label htmlFor="text-input">Enter Text</Label>
              <Textarea
                id="text-input"
                placeholder="Enter the text you want to hash..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="file-input">Upload File</Label>
              <Input
                id="file-input"
                type="file"
                onChange={handleFileUpload}
                accept=".txt,.md,.js,.ts,.jsx,.tsx,.html,.css,.json,.xml,.csv"
              />
              <p className="text-xs text-muted-foreground">
                Supported formats: Text files, code files, documents
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerateHash} 
              className="flex-1" 
              variant="hero"
              disabled={isGenerating}
            >
              <Hash className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Generate SHA256 Hash"}
            </Button>
            <Button onClick={clearAll} variant="outline">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {input && (
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium mb-1">Input Preview:</p>
              <p className="text-xs text-muted-foreground break-words">
                {input.length > 100 ? `${input.substring(0, 100)}...` : input}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Length: {input.length} characters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated SHA256 Hash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hash ? (
            <>
              <div className="relative">
                <Input
                  value={hash}
                  readOnly
                  className="font-mono pr-20 text-sm"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Hash Length:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {hashInfo?.length} characters
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Algorithm:</span>
                  <span className="text-sm font-bold text-green-600">
                    {hashInfo?.algorithm}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Security Level:</span>
                  <span className="text-sm font-bold text-green-600">
                    {hashInfo?.security}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Collision Resistance:</span>
                  <span className="text-sm font-bold text-green-600">
                    {hashInfo?.collisionResistance}
                  </span>
                </div>

                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-xs text-green-800">
                    <strong>Secure:</strong> SHA-256 is a cryptographically secure hash function 
                    recommended for digital signatures, certificates, and data integrity verification.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter text or upload a file to generate SHA256 hash</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SHA256HashGenerator;
