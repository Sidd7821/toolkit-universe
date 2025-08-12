import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, Plus, Trash2 } from "lucide-react";

const RobotsTxtGenerator = () => {
  const [userAgent, setUserAgent] = useState("*");
  const [allowPaths, setAllowPaths] = useState<string[]>([""]);
  const [disallowPaths, setDisallowPaths] = useState<string[]>([""]);
  const [sitemapUrl, setSitemapUrl] = useState("");
  const [crawlDelay, setCrawlDelay] = useState("");
  const [generatedRobots, setGeneratedRobots] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const addAllowPath = () => setAllowPaths([...allowPaths, ""]);
  const removeAllowPath = (index: number) =>
    setAllowPaths(paths => paths.filter((_, i) => i !== index));

  const updateAllowPath = (index: number, value: string) => {
    const newPaths = [...allowPaths];
    newPaths[index] = value;
    setAllowPaths(newPaths);
  };

  const addDisallowPath = () => setDisallowPaths([...disallowPaths, ""]);
  const removeDisallowPath = (index: number) =>
    setDisallowPaths(paths => paths.filter((_, i) => i !== index));

  const updateDisallowPath = (index: number, value: string) => {
    const newPaths = [...disallowPaths];
    newPaths[index] = value;
    setDisallowPaths(newPaths);
  };

  const generateRobotsTxt = () => {
    if (!userAgent.trim()) {
      toast({
        title: "User Agent required",
        description: "Please enter a valid user agent.",
        variant: "destructive" as any
      });
      return;
    }

    setIsProcessing(true);
    try {
      let lines: string[] = [];
      lines.push(`User-agent: ${userAgent.trim()}`);

      // Add Allow
      [...new Set(allowPaths.map(p => p.trim()).filter(Boolean))].forEach(path =>
        lines.push(`Allow: ${path}`)
      );

      // Add Disallow
      [...new Set(disallowPaths.map(p => p.trim()).filter(Boolean))].forEach(path =>
        lines.push(`Disallow: ${path}`)
      );

      // Add Crawl-delay
      if (crawlDelay.trim()) lines.push(`Crawl-delay: ${crawlDelay.trim()}`);

      // Add Sitemap
      if (sitemapUrl.trim()) lines.push(`Sitemap: ${sitemapUrl.trim()}`);

      setGeneratedRobots(lines.join("\n"));
      toast({ title: "Generated", description: "robots.txt generated successfully." });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = () => {
    if (!generatedRobots) return;
    navigator.clipboard.writeText(generatedRobots);
    toast({ title: "Copied", description: "robots.txt copied to clipboard." });
  };

  const downloadRobotsTxt = () => {
    if (!generatedRobots) return;
    const blob = new Blob([generatedRobots], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "robots.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "robots.txt downloaded successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Robots.txt Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* User Agent */}
            <div>
              <Label htmlFor="userAgent">User Agent *</Label>
              <Input
                id="userAgent"
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                placeholder="* (for all bots)"
              />
            </div>

            {/* Allow Paths */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Allow Paths</Label>
                <Button variant="outline" size="sm" onClick={addAllowPath}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              {allowPaths.map((path, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={path}
                    onChange={(e) => updateAllowPath(index, e.target.value)}
                    placeholder="/public/"
                    className="text-sm"
                  />
                  {allowPaths.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeAllowPath(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Disallow Paths */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Disallow Paths</Label>
                <Button variant="outline" size="sm" onClick={addDisallowPath}>
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </div>
              {disallowPaths.map((path, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={path}
                    onChange={(e) => updateDisallowPath(index, e.target.value)}
                    placeholder="/admin/"
                    className="text-sm"
                  />
                  {disallowPaths.length > 1 && (
                    <Button variant="outline" size="sm" onClick={() => removeDisallowPath(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Crawl Delay */}
            <div>
              <Label htmlFor="crawlDelay">Crawl Delay (seconds)</Label>
              <Input
                id="crawlDelay"
                type="number"
                value={crawlDelay}
                onChange={(e) => setCrawlDelay(e.target.value)}
                placeholder="1"
                min="0"
                step="0.1"
              />
            </div>

            {/* Sitemap */}
            <div>
              <Label htmlFor="sitemapUrl">Sitemap URL</Label>
              <Input
                id="sitemapUrl"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
              />
            </div>

            <Button
              variant="hero"
              onClick={generateRobotsTxt}
              className="w-full"
              disabled={isProcessing}
            >
              {isProcessing ? "Generating..." : "Generate robots.txt"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated robots.txt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedRobots}
              readOnly
              placeholder="Generated robots.txt will appear here..."
              className="min-h-[400px] font-mono text-sm"
            />

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                disabled={!generatedRobots}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
              <Button
                variant="outline"
                onClick={downloadRobotsTxt}
                disabled={!generatedRobots}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RobotsTxtGenerator;
