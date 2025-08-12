import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, AlertCircle, Copy, ExternalLink, Search, Loader2 } from "lucide-react";

interface LinkResult {
  url: string;
  status: number;
  statusText: string;
  isBroken: boolean;
  responseTime: number;
  error?: string;
}

const BrokenLinkChecker = () => {
  const [url, setUrl] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [results, setResults] = useState<LinkResult[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [checkedCount, setCheckedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const extractLinksFromHTML = (html: string): string[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.querySelectorAll("a[href]");
    const urls: string[] = [];

    links.forEach(link => {
      const href = link.getAttribute("href");
      if (href && href.startsWith("http")) {
        urls.push(href);
      }
    });

    return [...new Set(urls)]; // Remove duplicates
  };

  const checkSingleLink = async (linkUrl: string): Promise<LinkResult> => {
    const startTime = Date.now();
    
    try {
      const response = await fetch(linkUrl, {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      const responseTime = Date.now() - startTime;
      
      return {
        url: linkUrl,
        status: response.status,
        statusText: response.statusText,
        isBroken: response.status >= 400,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        url: linkUrl,
        status: 0,
        statusText: "Error",
        isBroken: true,
        responseTime,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  };

  const checkLinksFromURL = async () => {
    if (!url) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL.",
        variant: "destructive" as any
      });
      return;
    }

    setIsChecking(true);
    setResults([]);
    setCheckedCount(0);

    try {
      // Fetch the webpage content
      const apiUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error("Failed to fetch page");
      const data = await res.json();

      const links = extractLinksFromHTML(data.contents);
      setTotalCount(links.length);

      if (links.length === 0) {
        toast({
          title: "No links found",
          description: "No external links were found on this page.",
          variant: "destructive" as any
        });
        return;
      }

      const linkResults: LinkResult[] = [];
      
      // Check links in batches to avoid overwhelming the server
      for (let i = 0; i < links.length; i++) {
        const result = await checkSingleLink(links[i]);
        linkResults.push(result);
        setCheckedCount(i + 1);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(linkResults);
      
      const brokenCount = linkResults.filter(r => r.isBroken).length;
      toast({ 
        title: "Check Complete", 
        description: `Found ${brokenCount} broken links out of ${links.length} total links.` 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check links. Please try again.",
        variant: "destructive" as any
      });
    } finally {
      setIsChecking(false);
    }
  };

  const checkLinksFromHTML = async () => {
    if (!htmlContent) {
      toast({
        title: "HTML required",
        description: "Please paste HTML content.",
        variant: "destructive" as any
      });
      return;
    }

    setIsChecking(true);
    setResults([]);
    setCheckedCount(0);

    try {
      const links = extractLinksFromHTML(htmlContent);
      setTotalCount(links.length);

      if (links.length === 0) {
        toast({
          title: "No links found",
          description: "No external links were found in the HTML.",
          variant: "destructive" as any
        });
        return;
      }

      const linkResults: LinkResult[] = [];
      
      for (let i = 0; i < links.length; i++) {
        const result = await checkSingleLink(links[i]);
        linkResults.push(result);
        setCheckedCount(i + 1);
        
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      setResults(linkResults);
      
      const brokenCount = linkResults.filter(r => r.isBroken).length;
      toast({ 
        title: "Check Complete", 
        description: `Found ${brokenCount} broken links out of ${links.length} total links.` 
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check links. Please try again.",
        variant: "destructive" as any
      });
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const openURL = (url: string) => {
    window.open(url, "_blank");
  };

  const getStatusIcon = (result: LinkResult) => {
    if (result.isBroken) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else if (result.status >= 300 && result.status < 400) {
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusBadge = (result: LinkResult) => {
    if (result.isBroken) {
      return <Badge variant="destructive">{result.status}</Badge>;
    } else if (result.status >= 300 && result.status < 400) {
      return <Badge variant="secondary">{result.status}</Badge>;
    } else {
      return <Badge variant="default">{result.status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Check from URL</CardTitle>
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
              onClick={checkLinksFromURL}
              disabled={isChecking}
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              {isChecking ? "Checking..." : "Check Links"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Check from HTML</CardTitle>
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
            <Button variant="hero" onClick={checkLinksFromHTML} disabled={isChecking} className="w-full">
              Check Links
            </Button>
          </CardContent>
        </Card>
      </div>

      {isChecking && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking links... {checkedCount}/{totalCount}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-4">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Link Check Results</CardTitle>
            <div className="flex gap-2 text-sm text-muted-foreground">
              <span>Total: {results.length}</span>
              <span>•</span>
              <span className="text-green-600">Working: {results.filter(r => !r.isBroken).length}</span>
              <span>•</span>
              <span className="text-red-600">Broken: {results.filter(r => r.isBroken).length}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {getStatusIcon(result)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm truncate">{result.url}</span>
                        {getStatusBadge(result)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.error || `${result.statusText} • ${result.responseTime}ms`}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(result.url)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openURL(result.url)}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BrokenLinkChecker;
