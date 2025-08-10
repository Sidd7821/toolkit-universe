import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Download, RotateCcw, FileCode, Zap, Info, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MinificationOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  removeEmptyRules: boolean;
  removeEmptySelectors: boolean;
  removeDuplicateProperties: boolean;
  mergeSelectors: boolean;
}

const CssMinifier = () => {
  const [inputCss, setInputCss] = useState("");
  const [minifiedCss, setMinifiedCss] = useState("");
  const [options, setOptions] = useState<MinificationOptions>({
    removeComments: true,
    removeWhitespace: true,
    removeEmptyRules: true,
    removeEmptySelectors: true,
    removeDuplicateProperties: true,
    mergeSelectors: true,
  });
  const [stats, setStats] = useState({ original: 0, minified: 0, reduction: 0 });
  const { toast } = useToast();

  const minifyCss = () => {
    if (!inputCss.trim()) {
      toast({
        title: "No CSS input",
        description: "Please enter some CSS code to minify",
        variant: "destructive",
      });
      return;
    }

    let result = inputCss;

    if (options.removeComments) {
      // Remove CSS comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    if (options.removeWhitespace) {
      // Remove extra whitespace
      result = result.replace(/\s+/g, " ");
      // Remove whitespace around certain characters
      result = result.replace(/\s*([{}:;,>+~])\s*/g, "$1");
      // Remove leading/trailing whitespace
      result = result.replace(/^\s+|\s+$/g, "");
    }

    if (options.removeEmptyRules) {
      // Remove empty CSS rules
      result = result.replace(/[^{}]+\{\s*\}/g, "");
    }

    if (options.removeEmptySelectors) {
      // Remove empty selectors
      result = result.replace(/[^{}]+\{\s*\}/g, "");
    }

    if (options.removeDuplicateProperties) {
      // Remove duplicate properties within the same rule
      const rules = result.split("}");
      const processedRules = rules.map(rule => {
        if (!rule.trim()) return rule;
        
        const parts = rule.split("{");
        if (parts.length !== 2) return rule;
        
        const selector = parts[0];
        const properties = parts[1];
        
        if (!properties) return rule;
        
        const propertyLines = properties.split(";").filter(p => p.trim());
        const uniqueProperties = new Set();
        const finalProperties = [];
        
        for (const prop of propertyLines) {
          const cleanProp = prop.trim();
          if (cleanProp && !uniqueProperties.has(cleanProp)) {
            uniqueProperties.add(cleanProp);
            finalProperties.push(cleanProp);
          }
        }
        
        return `${selector}{${finalProperties.join(";")}}`;
      });
      
      result = processedRules.join("}");
    }

    if (options.mergeSelectors) {
      // Simple selector merging for identical rules
      const rules = result.split("}");
      const ruleMap = new Map();
      
      rules.forEach(rule => {
        if (!rule.trim()) return;
        
        const parts = rule.split("{");
        if (parts.length !== 2) return;
        
        const selector = parts[0].trim();
        const properties = parts[1].trim();
        
        if (ruleMap.has(properties)) {
          const existingSelector = ruleMap.get(properties);
          ruleMap.set(properties, `${existingSelector},${selector}`);
        } else {
          ruleMap.set(properties, selector);
        }
      });
      
      result = Array.from(ruleMap.entries())
        .map(([properties, selector]) => `${selector}{${properties}}`)
        .join("");
    }

    setMinifiedCss(result);

    const originalSize = inputCss.length;
    const minifiedSize = result.length;
    const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction: Math.round(reduction * 100) / 100,
    });

    toast({
      title: "CSS Minified Successfully!",
      description: `Reduced size by ${reduction.toFixed(1)}%`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(minifiedCss);
      toast({
        title: "Copied to clipboard",
        description: "Minified CSS has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadCss = () => {
    const blob = new Blob([minifiedCss], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.css";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setInputCss("");
    setMinifiedCss("");
    setStats({ original: 0, minified: 0, reduction: 0 });
  };

  const loadSampleCss = () => {
    const sample = `/* Sample CSS for demonstration */
body {
    font-family: Arial, sans-serif;
    margin: 0;
    padding: 20px;
    background-color: #f5f5f5;
}

.container {
    max-width: 800px;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
    color: #333;
    margin-bottom: 20px;
    font-size: 2em;
}

p {
    line-height: 1.6;
    color: #666;
    margin-bottom: 15px;
}

.button {
    background-color: #007bff;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
}

.button:hover {
    background-color: #0056b3;
}

.button:active {
    background-color: #004085;
}

/* Media queries */
@media (max-width: 768px) {
    .container {
        margin: 10px;
        padding: 15px;
    }
    
    h1 {
        font-size: 1.5em;
    }
}`;
    setInputCss(sample);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" /> CSS Minifier
          </CardTitle>
          <CardDescription>
            Minify your CSS code by removing unnecessary whitespace, comments, and formatting to reduce file size and improve loading speed.
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
                <Label htmlFor="remove-comments">Remove CSS comments</Label>
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
                  id="remove-empty-rules"
                  checked={options.removeEmptyRules}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeEmptyRules: checked }))}
                />
                <Label htmlFor="remove-empty-rules">Remove empty rules</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-empty-selectors"
                  checked={options.removeEmptySelectors}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeEmptySelectors: checked }))}
                />
                <Label htmlFor="remove-empty-selectors">Remove empty selectors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-duplicate"
                  checked={options.removeDuplicateProperties}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeDuplicateProperties: checked }))}
                />
                <Label htmlFor="remove-duplicate">Remove duplicate properties</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="merge-selectors"
                  checked={options.mergeSelectors}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, mergeSelectors: checked }))}
                />
                <Label htmlFor="merge-selectors">Merge identical selectors</Label>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="css-input" className="text-lg font-medium">
                Input CSS
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadSampleCss}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </div>
            <Textarea
              id="css-input"
              placeholder="Paste your CSS code here..."
              value={inputCss}
              onChange={(e) => setInputCss(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={minifyCss}
              disabled={!inputCss.trim()}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700"
            >
              <Zap className="h-4 w-4 mr-2" /> Minify CSS
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
          {minifiedCss && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Minified CSS</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadCss}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted">
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">{minifiedCss}</pre>
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
              <p className="font-medium">Paste CSS Code</p>
              <p className="text-sm text-muted-foreground">Copy and paste your CSS code into the input field</p>
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
              <p className="text-sm text-muted-foreground">Click minify and download your optimized CSS</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Benefits of CSS Minification
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
                <p className="text-sm text-muted-foreground">Smaller CSS files load faster, improving page performance</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Palette className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Cleaner Stylesheets</h4>
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
                <h4 className="font-medium">Production Ready</h4>
                <p className="text-sm text-muted-foreground">Optimize CSS for production deployment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CssMinifier;
