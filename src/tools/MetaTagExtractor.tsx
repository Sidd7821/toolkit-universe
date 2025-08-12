import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, ExternalLink, Search } from "lucide-react";

const MetaTagExtractor = () => {
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [extractedMeta, setExtractedMeta] = useState<any>(null);
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
      // Encode the URL and fetch via AllOrigins to bypass CORS
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch page");
      const data = await res.json();

      parseHTMLAndExtract(data.contents);
      toast({ title: "Extracted", description: "Meta tags extracted successfully." });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to extract meta tags. Please check the URL.",
        variant: "destructive" as any
      });
    } finally {
      setIsLoading(false);
    }
  };

  const parseHTMLAndExtract = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const extracted = {
      title: doc.querySelector("title")?.textContent || "",
      description: doc.querySelector('meta[name="description"]')?.getAttribute("content") || "",
      keywords: doc.querySelector('meta[name="keywords"]')?.getAttribute("content") || "",
      author: doc.querySelector('meta[name="author"]')?.getAttribute("content") || "",
      ogTitle: doc.querySelector('meta[property="og:title"]')?.getAttribute("content") || "",
      ogDescription: doc.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
      ogImage: doc.querySelector('meta[property="og:image"]')?.getAttribute("content") || "",
      ogType: doc.querySelector('meta[property="og:type"]')?.getAttribute("content") || "",
      ogUrl: doc.querySelector('meta[property="og:url"]')?.getAttribute("content") || "",
      twitterCard: doc.querySelector('meta[name="twitter:card"]')?.getAttribute("content") || "",
      twitterTitle: doc.querySelector('meta[name="twitter:title"]')?.getAttribute("content") || "",
      twitterDescription: doc.querySelector('meta[name="twitter:description"]')?.getAttribute("content") || "",
      twitterImage: doc.querySelector('meta[name="twitter:image"]')?.getAttribute("content") || "",
      viewport: doc.querySelector('meta[name="viewport"]')?.getAttribute("content") || "",
      charset: doc.querySelector("meta[charset]")?.getAttribute("charset") || "",
      robots: doc.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      canonical: doc.querySelector('link[rel="canonical"]')?.getAttribute("href") || ""
    };

    setExtractedMeta(extracted);
  };

  const extractFromHTML = () => {
    if (!htmlContent) {
      toast({
        title: "HTML required",
        description: "Please paste HTML content.",
        variant: "destructive" as any
      });
      return;
    }
    parseHTMLAndExtract(htmlContent);
    toast({ title: "Extracted", description: "Meta tags extracted from HTML successfully." });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const openURL = () => {
    if (url) {
      window.open(url, "_blank");
    }
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
                <Button variant="outline" onClick={openURL} disabled={!url}>
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
              {isLoading ? "Extracting..." : "Extract Meta Tags"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extract from HTML</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="html">HTML Content</Label>
              <Textarea
                id="html"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Paste HTML content here..."
                rows={6}
              />
            </div>
            <Button variant="hero" onClick={extractFromHTML} className="w-full">
              Extract Meta Tags
            </Button>
          </CardContent>
        </Card>
      </div>

      {extractedMeta && (
        <Card>
          <CardHeader>
            <CardTitle>Extracted Meta Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Object.entries(extractedMeta).map(([key, value]) =>
                value ? (
                  <div key={key} className="space-y-2">
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input value={value as string} readOnly className="font-mono text-sm" />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(value as string)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : null
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MetaTagExtractor;
