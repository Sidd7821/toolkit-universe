import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, Download, RotateCcw, FileCode, Zap, Info, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MinificationOptions {
  removeComments: boolean;
  removeWhitespace: boolean;
  removeConsoleLogs: boolean;
  removeDebugger: boolean;
  mangleVariables: boolean;
  preserveFunctionNames: boolean;
}

const JavaScriptMinifier = () => {
  const [inputJs, setInputJs] = useState("");
  const [minifiedJs, setMinifiedJs] = useState("");
  const [options, setOptions] = useState<MinificationOptions>({
    removeComments: true,
    removeWhitespace: true,
    removeConsoleLogs: true,
    removeDebugger: true,
    mangleVariables: false,
    preserveFunctionNames: true,
  });
  const [stats, setStats] = useState({ original: 0, minified: 0, reduction: 0 });
  const { toast } = useToast();

  const minifyJavaScript = () => {
    if (!inputJs.trim()) {
      toast({
        title: "No JavaScript input",
        description: "Please enter some JavaScript code to minify",
        variant: "destructive",
      });
      return;
    }

    let result = inputJs;

    if (options.removeComments) {
      // Remove single-line comments
      result = result.replace(/\/\/.*$/gm, "");
      // Remove multi-line comments
      result = result.replace(/\/\*[\s\S]*?\*\//g, "");
    }

    if (options.removeConsoleLogs) {
      // Remove console.log statements
      result = result.replace(/console\.(log|warn|error|info|debug)\([^)]*\);?\s*/g, "");
    }

    if (options.removeDebugger) {
      // Remove debugger statements
      result = result.replace(/debugger;?\s*/g, "");
    }

    if (options.removeWhitespace) {
      // Remove extra whitespace
      result = result.replace(/\s+/g, " ");
      // Remove whitespace around operators and punctuation
      result = result.replace(/\s*([{}();,=+\-*/<>!&|?:])\s*/g, "$1");
      // Remove leading/trailing whitespace
      result = result.replace(/^\s+|\s+$/g, "");
      // Remove unnecessary semicolons
      result = result.replace(/;+/g, ";");
    }

    if (options.mangleVariables && !options.preserveFunctionNames) {
      // Simple variable mangling (basic implementation)
      const variableMap = new Map();
      let counter = 0;
      
      // Find variable declarations and function parameters
      const varRegex = /\b(?:var|let|const)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\b/g;
      const paramRegex = /function\s*\(([^)]*)\)/g;
      const funcRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
      
      let match;
      while ((match = varRegex.exec(result)) !== null) {
        const varName = match[1];
        if (!variableMap.has(varName)) {
          variableMap.set(varName, `_${counter++}`);
        }
      }
      
      // Replace variable names
      variableMap.forEach((mangledName, originalName) => {
        const regex = new RegExp(`\\b${originalName}\\b`, 'g');
        result = result.replace(regex, mangledName);
      });
    }

    setMinifiedJs(result);

    const originalSize = inputJs.length;
    const minifiedSize = result.length;
    const reduction = ((originalSize - minifiedSize) / originalSize) * 100;

    setStats({
      original: originalSize,
      minified: minifiedSize,
      reduction: Math.round(reduction * 100) / 100,
    });

    toast({
      title: "JavaScript Minified Successfully!",
      description: `Reduced size by ${reduction.toFixed(1)}%`,
    });
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(minifiedJs);
      toast({
        title: "Copied to clipboard",
        description: "Minified JavaScript has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const downloadJs = () => {
    const blob = new Blob([minifiedJs], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "minified.js";
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAll = () => {
    setInputJs("");
    setMinifiedJs("");
    setStats({ original: 0, minified: 0, reduction: 0 });
  };

  const loadSampleJs = () => {
    const sample = `// Sample JavaScript for demonstration
function calculateTotal(items) {
    let total = 0;
    
    // Loop through all items
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        total += item.price * item.quantity;
        
        // Apply discount if applicable
        if (item.discount > 0) {
            total -= (item.price * item.quantity * item.discount) / 100;
        }
    }
    
    // Add tax
    const taxRate = 0.08; // 8% tax
    const taxAmount = total * taxRate;
    total += taxAmount;
    
    // Log the calculation for debugging
    console.log('Items processed:', items.length);
    console.log('Subtotal:', total - taxAmount);
    console.log('Tax amount:', taxAmount);
    console.log('Final total:', total);
    
    return total;
}

// Example usage
const shoppingCart = [
    { name: 'Laptop', price: 999.99, quantity: 1, discount: 10 },
    { name: 'Mouse', price: 29.99, quantity: 2, discount: 0 },
    { name: 'Keyboard', price: 79.99, quantity: 1, discount: 5 }
];

// Calculate and display total
const finalTotal = calculateTotal(shoppingCart);
console.log('Shopping cart total: $' + finalTotal.toFixed(2));

// Debug information
debugger;

// Export function for use in other modules
export { calculateTotal };`;
    setInputJs(sample);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" /> JavaScript Minifier
          </CardTitle>
          <CardDescription>
            Minify your JavaScript code by removing unnecessary whitespace, comments, and debugging statements to reduce file size and improve loading speed.
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
                <Label htmlFor="remove-comments">Remove comments</Label>
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
                  id="remove-console"
                  checked={options.removeConsoleLogs}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeConsoleLogs: checked }))}
                />
                <Label htmlFor="remove-console">Remove console statements</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="remove-debugger"
                  checked={options.removeDebugger}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, removeDebugger: checked }))}
                />
                <Label htmlFor="remove-debugger">Remove debugger statements</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="mangle-variables"
                  checked={options.mangleVariables}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, mangleVariables: checked }))}
                />
                <Label htmlFor="mangle-variables">Mangle variable names</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="preserve-functions"
                  checked={options.preserveFunctionNames}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, preserveFunctionNames: checked }))}
                />
                <Label htmlFor="preserve-functions">Preserve function names</Label>
              </div>
            </div>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="js-input" className="text-lg font-medium">
                Input JavaScript
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadSampleJs}>
                  Load Sample
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </div>
            <Textarea
              id="js-input"
              placeholder="Paste your JavaScript code here..."
              value={inputJs}
              onChange={(e) => setInputJs(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={minifyJavaScript}
              disabled={!inputJs.trim()}
              size="lg"
              className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
            >
              <Zap className="h-4 w-4 mr-2" /> Minify JavaScript
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
          {minifiedJs && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-medium">Minified JavaScript</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" /> Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadJs}>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </Button>
                </div>
              </div>
              <div className="border rounded-lg p-4 bg-muted">
                <pre className="text-sm font-mono whitespace-pre-wrap break-all">{minifiedJs}</pre>
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
              <p className="font-medium">Paste JavaScript Code</p>
              <p className="text-sm text-muted-foreground">Copy and paste your JavaScript code into the input field</p>
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
              <p className="text-sm text-muted-foreground">Click minify and download your optimized JavaScript</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Benefits of JavaScript Minification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="bg-green-100 dark:bg-green-900/20 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Faster Execution</h4>
                <p className="text-sm text-muted-foreground">Smaller files load and execute faster</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/20 p-2 rounded-lg">
                <Code className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Cleaner Code</h4>
                <p className="text-sm text-muted-foreground">Remove debugging code and comments</p>
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
                <p className="text-sm text-muted-foreground">Optimize JavaScript for production deployment</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JavaScriptMinifier;
