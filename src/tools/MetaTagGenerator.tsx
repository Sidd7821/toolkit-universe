import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Copy, Download } from "lucide-react";

const escapeHTML = (str: string) =>
  str.replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#039;");

const MetaTagGenerator = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    keywords: "",
    author: "",
    url: "",
    image: "",
    twitterHandle: "",
    themeColor: "#ffffff",
    language: "en"
  });

  const [generatedCode, setGeneratedCode] = useState("");

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateMetaTags = () => {
    if (!formData.title.trim() || !formData.description.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide both Title and Description.",
        variant: "destructive" as any
      });
      return;
    }

    const metaTags = [
      `<meta charset="UTF-8">`,
      `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
      `<title>${escapeHTML(formData.title)}</title>`,
      `<meta name="description" content="${escapeHTML(formData.description)}">`,
      formData.keywords && `<meta name="keywords" content="${escapeHTML(formData.keywords)}">`,
      formData.author && `<meta name="author" content="${escapeHTML(formData.author)}">`,
      `<meta name="robots" content="index, follow">`,
      `<meta name="theme-color" content="${formData.themeColor}">`,
      `<html lang="${formData.language}">`,

      // Open Graph Tags
      `<meta property="og:type" content="website">`,
      `<meta property="og:title" content="${escapeHTML(formData.title)}">`,
      `<meta property="og:description" content="${escapeHTML(formData.description)}">`,
      formData.url && `<meta property="og:url" content="${escapeHTML(formData.url)}">`,
      formData.image && `<meta property="og:image" content="${escapeHTML(formData.image)}">`,

      // Twitter Cards
      `<meta name="twitter:card" content="summary_large_image">`,
      `<meta name="twitter:title" content="${escapeHTML(formData.title)}">`,
      `<meta name="twitter:description" content="${escapeHTML(formData.description)}">`,
      formData.twitterHandle && `<meta name="twitter:site" content="${escapeHTML(formData.twitterHandle)}">`,
      formData.image && `<meta name="twitter:image" content="${escapeHTML(formData.image)}">`
    ]
      .filter(Boolean)
      .join("\n");

    setGeneratedCode(metaTags);
    toast({ title: "Success", description: "Meta tags generated successfully." });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast({ title: "Copied", description: "Meta tags copied to clipboard." });
  };

  const downloadMetaTags = () => {
    const blob = new Blob([generatedCode], { type: "text/html" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "meta-tags.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Downloaded", description: "Meta tags saved as HTML file." });
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Tag Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { id: "title", label: "Page Title *", placeholder: "Enter page title" },
            { id: "description", label: "Description *", placeholder: "Enter page description", textarea: true },
            { id: "keywords", label: "Keywords", placeholder: "keyword1, keyword2" },
            { id: "author", label: "Author", placeholder: "Author Name" },
            { id: "url", label: "URL", placeholder: "https://example.com" },
            { id: "image", label: "Image URL", placeholder: "https://example.com/image.jpg" },
            { id: "twitterHandle", label: "Twitter Handle", placeholder: "@username" }
          ].map(field => (
            <div key={field.id}>
              <Label htmlFor={field.id}>{field.label}</Label>
              {field.textarea ? (
                <Textarea
                  id={field.id}
                  value={(formData as any)[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                />
              ) : (
                <Input
                  id={field.id}
                  value={(formData as any)[field.id]}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                />
              )}
            </div>
          ))}
          <div>
            <Label htmlFor="themeColor">Theme Color</Label>
            <Input
              type="color"
              id="themeColor"
              value={formData.themeColor}
              onChange={(e) => handleInputChange("themeColor", e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="language">Page Language</Label>
            <Input
              id="language"
              value={formData.language}
              onChange={(e) => handleInputChange("language", e.target.value)}
              placeholder="en"
            />
          </div>
          <Button onClick={generateMetaTags} className="w-full">
            Generate Meta Tags
          </Button>
        </CardContent>
      </Card>

      {/* Output */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Meta Tags</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={generatedCode}
            readOnly
            placeholder="Generated meta tags will appear here..."
            className="min-h-[400px] font-mono text-sm"
          />
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyToClipboard} disabled={!generatedCode} className="w-1/2">
              <Copy className="w-4 h-4 mr-2" /> Copy
            </Button>
            <Button variant="outline" onClick={downloadMetaTags} disabled={!generatedCode} className="w-1/2">
              <Download className="w-4 h-4 mr-2" /> Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetaTagGenerator;
