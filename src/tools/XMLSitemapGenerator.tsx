import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Download, Plus, Trash2 } from "lucide-react";

interface SitemapURL {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const XMLSitemapGenerator = () => {
  const [baseUrl, setBaseUrl] = useState("");
  const [urls, setUrls] = useState<SitemapURL[]>([
    { url: "", lastmod: new Date().toISOString().split('T')[0], changefreq: "weekly", priority: "0.8" }
  ]);
  const [generatedSitemap, setGeneratedSitemap] = useState("");

  const addURL = () => {
    setUrls([...urls, { 
      url: "", 
      lastmod: new Date().toISOString().split('T')[0], 
      changefreq: "weekly", 
      priority: "0.8" 
    }]);
  };

  const removeURL = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateURL = (index: number, field: keyof SitemapURL, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
  };

  const generateSitemap = () => {
    if (!baseUrl) {
      toast({ 
        title: "Base URL required", 
        description: "Please enter the base URL of your website.", 
        variant: "destructive" as any 
      });
      return;
    }

    const validUrls = urls.filter(url => url.url.trim());
    if (validUrls.length === 0) {
      toast({ 
        title: "URLs required", 
        description: "Please add at least one URL.", 
        variant: "destructive" as any 
      });
      return;
    }

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${validUrls.map(url => `  <url>
    <loc>${baseUrl.replace(/\/$/, '')}${url.url.startsWith('/') ? url.url : '/' + url.url}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    setGeneratedSitemap(sitemap);
    toast({ title: "Generated", description: "XML sitemap generated successfully." });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSitemap);
    toast({ title: "Copied", description: "Sitemap copied to clipboard." });
  };

  const downloadSitemap = () => {
    const blob = new Blob([generatedSitemap], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sitemap.xml";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded", description: "Sitemap downloaded successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sitemap Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="baseUrl">Base URL *</Label>
              <Input
                id="baseUrl"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>URLs</Label>
                <Button variant="outline" size="sm" onClick={addURL}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add URL
                </Button>
              </div>

              {urls.map((url, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">URL {index + 1}</Label>
                    {urls.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeURL(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Path</Label>
                      <Input
                        value={url.url}
                        onChange={(e) => updateURL(index, 'url', e.target.value)}
                        placeholder="/page"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Last Modified</Label>
                      <Input
                        type="date"
                        value={url.lastmod}
                        onChange={(e) => updateURL(index, 'lastmod', e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">Change Frequency</Label>
                      <select
                        value={url.changefreq}
                        onChange={(e) => updateURL(index, 'changefreq', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="always">Always</option>
                        <option value="hourly">Hourly</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                        <option value="never">Never</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">Priority</Label>
                      <select
                        value={url.priority}
                        onChange={(e) => updateURL(index, 'priority', e.target.value)}
                        className="w-full p-2 border rounded text-sm"
                      >
                        <option value="1.0">1.0 (Highest)</option>
                        <option value="0.9">0.9</option>
                        <option value="0.8">0.8</option>
                        <option value="0.7">0.7</option>
                        <option value="0.6">0.6</option>
                        <option value="0.5">0.5</option>
                        <option value="0.4">0.4</option>
                        <option value="0.3">0.3</option>
                        <option value="0.2">0.2</option>
                        <option value="0.1">0.1 (Lowest)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" onClick={generateSitemap} className="w-full">
              Generate Sitemap
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generated XML Sitemap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={generatedSitemap}
              readOnly
              placeholder="Generated XML sitemap will appear here..."
              className="min-h-[400px] font-mono text-sm"
            />
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={copyToClipboard}
                disabled={!generatedSitemap}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button 
                variant="outline" 
                onClick={downloadSitemap}
                disabled={!generatedSitemap}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default XMLSitemapGenerator;
