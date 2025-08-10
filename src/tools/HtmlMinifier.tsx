import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Download, RotateCcw, FileCode, Zap, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MinificationOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  removeEmptyAttributes: boolean;
  removeOptionalTags: boolean;
  collapseBooleanAttributes: boolean;
}

const HtmlMinifier = () => {
  const [inputHtml, setInputHtml] = useState("");
  const [minifiedHtml, setMinifiedHtml] = useState("");
  const [options, setOptions] = useState<MinificationOptions>({
    removeComments: true,
    removeWhitespace: true,
    removeEmptyAttributes: true,
    removeOptionalTags: true,
    collapseBooleanAttributes: true,
  });
  const [stats, setStats] = useState({ original: 0, minified: 0, reduction: 0 });
  const { toast } = useToast();

  const minifyHtml = () => {
    if (!inputHtml.trim()) {
      toast({
        title: "No HTML input",
        description: "Please enter some HTML code to minify",
        variant: "destructive",
      });
      return;
    }

    let result = inputHtml;

    if (options.removeComments) {
      result = result.replace(/<!--[\s\S]*?-->/g, "");
    }

    if (options.removeWhitespace) {
      // Remove extra whitespace between tags
      result = result.replace(/>\s+</g, "><");
      // Remove leading/trailing whitespace
      result = result.replace(/^\s+|\s+$/g, "");
      // Remove multiple spaces
      result = result.replace(/\s+/g, " ");
    }

    if (options.removeEmptyAttributes) {
      result = result.replace(/\s+[a-zA-Z-]+=""/g, "");
    }

    if (options.removeOptionalTags) {
      // Remove optional closing tags like </p>, </li>, </td>, </th>, </tr>, </tbody>, </thead>, </tfoot>
      result = result.replace(/<\/(p|li|td|th|tr|tbody|thead|tfoot)>/g, "");
    }

    if (options.collapseBooleanAttributes) {
      // Collapse boolean attributes like checked="checked" to checked
      result = result.replace(/(\s+[a-zA-Z-]+)="[^"]*"/g, (match, attr) => {
        if (match.includes('="true"') || match.includes('="false"') || match.includes('="checked"') || match.includes('="selected"') || match.includes('="disabled"')) {
          return attr;
        }
        return match;
      });
    }

    setMinifiedHtml(result);

    const originalSize = inputHtml.length;
    const minifiedSize = result.length;
    const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction: Math.round(reduction * 100) / 100,
    });

    toast({
      title: "HTML Minified Successfully!",
      description: `Reduced size by ${reduction.toFixed(1)}%`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(minifiedHtml);
      toast({
        title: "Copied to clipboard",
        description: "Minified HTML has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadHtml = () => {
    const blob = new Blob([minifiedHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setInputHtml("");
    setMinifiedHtml("");
    setStats({ original: 0, minified: 0, reduction: 0 });
  };

  const loadSampleHtml = () => {
    const sample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sample HTML Page</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Welcome to Our Website</h1>
        <p>This is a sample HTML page with various elements.</p>
        <ul>
            <li>List item 1</li>
            <li>List item 2</li>
            <li>List item 3</li>
        </ul>
        <button type="button" disabled="disabled">Disabled Button</button>
    </div>
</body>
</html>`;
    setInputHtml(sample);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" /> HTML Minifier
          </CardTitle>
          <CardDescription>
            Minify your HTML code by removing unnecessary whitespace, comments, and formatting to reduce file size and improve loading speed.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Minification Options */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Minification Options
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-comments"
                  checked={options.removeComments}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeComments: checked }))}
                />
                <Label htmlFor="remove-comments">Remove HTML comments</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-whitespace"
                  checked={options.removeWhitespace}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeWhitespace: checked }))}
                />
                <Label htmlFor="remove-whitespace">Remove extra whitespace</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-empty-attributes"
                  checked={options.removeEmptyAttributes}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeEmptyAttributes: checked }))}
                />
                <Label htmlFor="remove-empty-attributes">Remove empty attributes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-optional-tags"
                  checked={options.removeOptionalTags}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeOptionalTags: checked }))}
                />
                <Label htmlFor="remove-optional-tags">Remove optional tags</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="collapse-boolean"
                  checked={options.collapseBooleanAttributes}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, collapseBooleanAttributes: checked }))}
                />
                <Label htmlFor="collapse-boolean">Collapse boolean attributes</Label>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="html-input" className="text-lg font-medium">
                Input HTML
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadSampleHtml}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </div>
            <Textarea
              id="html-input"
              placeholder="Paste your HTML code here..."
              value={inputHtml}
              onChange={(e) => setInputHtml(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={minifyHtml}
              disabled={!inputHtml.trim()}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" /> Minify HTML
            </Button>
          </div>

          {/* Stats */}
          {stats.original > 0 && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.original}</div>
                <div className="text-sm text-muted-foreground">Original (chars)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.minified}</div>
                <div className="text-sm text-muted-foreground">Minified (chars)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.reduction}%</div>
                <div className="text-sm text-muted-foreground">Size Reduction</div>
              </div>
            </div>
          )}

          {/* Output Section */}
          {minifiedHtml && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Minified HTML</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadHtml}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted">
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">{minifiedHtml}</pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Paste HTML Code</p>
              <p className="text-sm text-muted-foreground">Copy and paste your HTML code into the input field</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Configure Options</p>
              <p className="text-sm text-muted-foreground">Choose which elements to remove during minification</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Minify & Download</p>
              <p className="text-sm text-muted-foreground">Click minify and download your optimized HTML</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Benefits of HTML Minification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Faster Loading</h4>
                <p className="text-sm text-muted-foreground">Smaller file sizes mean faster page load times</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <FileCode className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Cleaner Code</h4>
                <p className="text-sm text-muted-foreground">Remove unnecessary formatting and comments</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-purple-100 dark:bg-purple-900/20 p-2 rounded-lg">
                <Download className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Bandwidth Savings</h4>
                <p className="text-sm text-muted-foreground">Reduce bandwidth usage for your users</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-orange-100 dark:bg-orange-900/20 p-2 rounded-lg">
                <Info className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h4 className="font-medium">SEO Benefits</h4>
                <p className="text-sm text-muted-foreground">Faster sites rank better in search engines</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HtmlMinifier;
