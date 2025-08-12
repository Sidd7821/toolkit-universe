import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Search, Copy, ExternalLink, Eye, Globe } from "lucide-react";

interface SERPData {
  title: string;
  url: string;
  description: string;
  favicon?: string;
}

const GoogleSERPPreview = () => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [serpData, setSerpData] = useState<SERPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const extractFromURL = async () => {
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive" as any
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the webpage content
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch page");
      const data = await res.json();

      // Parse the HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(data.contents, "text/html");

      // Extract meta data
      const extractedTitle = doc.querySelector("title")?.textContent || "";
      const extractedDescription = doc.querySelector('meta[name="description"]')?.getAttribute("content") || "";
      const extractedFavicon = doc.querySelector('link[rel="icon"]')?.getAttribute("href") || 
                              doc.querySelector('link[rel="shortcut icon"]')?.getAttribute("href") || "";

      // Clean up the URL for display
      const displayUrl = new URL(url).hostname + new URL(url).pathname;

      setSerpData({
        title: extractedTitle,
        url: displayUrl,
        description: extractedDescription,
        favicon: extractedFavicon.startsWith("http") ? extractedFavicon : new URL(extractedFavicon, url).href
      });

      toast({ title: "Extracted", description: "SERP data extracted successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract SERP data. Please check the URL.",
        variant: "destructive" as any
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = () => {
    if (!title && !description) {
      toast({
        title: "Content required",
        description: "Please enter a title or description.",
        variant: "destructive" as any
      });
      return;
    }

    const displayUrl = url ? new URL(url).hostname + new URL(url).pathname : "example.com";

    setSerpData({
      title: title || "Page Title",
      url: displayUrl,
      description: description || "Page description will appear here..."
    });

    toast({ title: "Preview Generated", description: "SERP preview created successfully." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const openURL = (url: string) => {
    window.open(url, "_blank");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Extract from URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <div className="flex gap-2">
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                />
                <Button variant="outline" onClick={() => openURL(url)} disabled={!url}>
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button
              variant="hero"
              onClick={extractFromURL}
              disabled={isLoading}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {isLoading ? "Extracting..." : "Extract SERP Data"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manual Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Page Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter page title..."
                maxLength={60}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {title.length}/60 characters
              </div>
            </div>
            <div>
              <Label htmlFor="description">Meta Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter meta description..."
                rows={3}
                maxLength={160}
              />
              <div className="text-xs text-muted-foreground mt-1">
                {description.length}/160 characters
              </div>
            </div>
            <Button variant="hero" onClick={generatePreview} className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              Generate Preview
            </Button>
          </CardContent>
        </Card>
      </div>

      {serpData && (
        <Card>
          <CardHeader>
            <CardTitle>Google SERP Preview</CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                <Globe className="w-3 h-3 mr-1" />
                Google Search
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white max-w-2xl">
              {/* Google-like SERP result */}
              <div className="space-y-2">
                {/* URL and favicon */}
                <div className="flex items-center space-x-2 text-sm text-green-700">
                  {serpData.favicon && (
                    <img 
                      src={serpData.favicon} 
                      alt="Favicon" 
                      className="w-4 h-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                  <span className="font-mono">{serpData.url}</span>
                </div>
                
                {/* Title */}
                <div className="text-xl text-blue-600 hover:underline cursor-pointer font-medium">
                  {truncateText(serpData.title, 60)}
                </div>
                
                {/* Description */}
                <div className="text-sm text-gray-600 leading-relaxed">
                  {truncateText(serpData.description, 160)}
                </div>
              </div>
            </div>

            {/* Copy buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(serpData.title)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Title
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(serpData.description)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Description
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(serpData.url)}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy URL
              </Button>
            </div>

            {/* Character count info */}
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Title:</span> {serpData.title.length}/60 characters
                  {serpData.title.length > 60 && (
                    <span className="text-red-500 ml-2">(Too long)</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Description:</span> {serpData.description.length}/160 characters
                  {serpData.description.length > 160 && (
                    <span className="text-red-500 ml-2">(Too long)</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips card */}
      <Card>
        <CardHeader>
          <CardTitle>SERP Optimization Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Title Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep under 60 characters</li>
                <li>• Include primary keyword</li>
                <li>• Make it compelling and clickable</li>
                <li>• Avoid keyword stuffing</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Description Best Practices</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Keep under 160 characters</li>
                <li>• Include relevant keywords</li>
                <li>• Write compelling call-to-action</li>
                <li>• Match user search intent</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GoogleSERPPreview;
