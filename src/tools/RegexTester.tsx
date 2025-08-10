import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Copy, RotateCcw, Search, Zap, Info, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RegexOptions {
  global: boolean;
  ignoreCase: boolean;
  multiline: boolean;
  sticky: boolean;
  unicode: boolean;
}

interface MatchResult {
  match: string;
  index: number;
  groups: string[];
  fullMatch: string;
}

const RegexTester = () => {
  const [regexPattern, setRegexPattern] = useState("");
  const [testText, setTestText] = useState("");
  const [options, setOptions] = useState<RegexOptions>({
    global: true,
    ignoreCase: false,
    multiline: false,
    sticky: false,
    unicode: false,
  });
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isValidRegex, setIsValidRegex] = useState(true);
  const [regexError, setRegexError] = useState("");
  const { toast } = useToast();

  const flags = useMemo(() => {
    let flags = "";
    if (options.global) flags += "g";
    if (options.ignoreCase) flags += "i";
    if (options.multiline) flags += "m";
    if (options.sticky) flags += "y";
    if (options.unicode) flags += "u";
    return flags;
  }, [options]);

  const testRegex = () => {
    if (!regexPattern.trim()) {
      toast({
        title: "No regex pattern",
        description: "Please enter a regular expression pattern",
        variant: "destructive",
      });
      return;
    }

    if (!testText.trim()) {
      toast({
        title: "No test text",
        description: "Please enter some text to test against",
        variant: "destructive",
      });
      return;
    }

    try {
      const regex = new RegExp(regexPattern, flags);
      setIsValidRegex(true);
      setRegexError("");

      const results: MatchResult[] = [];
      let match;

      if (options.global) {
        while ((match = regex.exec(testText)) !== null) {
          results.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1),
            fullMatch: match[0],
          });
        }
      } else {
        const singleMatch = regex.exec(testText);
        if (singleMatch) {
          results.push({
            match: singleMatch[0],
            index: singleMatch.index,
            groups: singleMatch.slice(1),
            fullMatch: singleMatch[0],
          });
        }
      }

      setMatches(results);

      if (results.length === 0) {
        toast({
          title: "No matches found",
          description: "The regex pattern didn't match any text",
        });
      } else {
        toast({
          title: "Regex test completed",
          description: `Found ${results.length} match${results.length === 1 ? "" : "es"}`,
        });
      }
    } catch (error) {
      setIsValidRegex(false);
      setRegexError(error instanceof Error ? error.message : "Invalid regex pattern");
      setMatches([]);
      toast({
        title: "Invalid regex pattern",
        description: "Please check your regular expression syntax",
        variant: "destructive",
      });
    }
  };

  const resetAll = () => {
    setRegexPattern("");
    setTestText("");
    setMatches([]);
    setIsValidRegex(true);
    setRegexError("");
  };

  const loadSampleRegex = () => {
    setRegexPattern("\\b\\w+@\\w+\\.\\w+\\b");
    setTestText(`Here are some email addresses to test:
john.doe@example.com
jane_smith@company.org
invalid-email
contact@website.net
test@domain.co.uk

And some other text to test against.`);
    setOptions({
      global: true,
      ignoreCase: false,
      multiline: false,
      sticky: false,
      unicode: false,
    });
  };

  const loadSamplePhone = () => {
    setRegexPattern("\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b");
    setTestText(`Phone numbers to test:
555-123-4567
555.123.4567
5551234567
123-45-6789
555-123-456
555-123-45678`);
    setOptions({
      global: true,
      ignoreCase: false,
      multiline: false,
      sticky: false,
      unicode: false,
    });
  };

  const loadSampleDate = () => {
    setRegexPattern("\\b\\d{1,2}[/-]\\d{1,2}[/-]\\d{2,4}\\b");
    setTestText(`Dates to test:
12/25/2023
1/1/24
12-31-2022
5/15/2024
13/32/2023
2/29/2024`);
    setOptions({
      global: true,
      ignoreCase: false,
      multiline: false,
      sticky: false,
      unicode: false,
    });
  };

  const copyMatches = async () => {
    if (matches.length === 0) return;
    
    const matchesText = matches.map((m, i) => 
      `Match ${i + 1}: "${m.match}" at index ${m.index}`
    ).join("\n");
    
    try {
      await navigator.clipboard.writeText(matchesText);
      toast({
        title: "Copied to clipboard",
        description: "Match results have been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const highlightedText = useMemo(() => {
    if (!isValidRegex || matches.length === 0) return testText;

    let result = testText;
    let offset = 0;

    // Sort matches by index in reverse order to avoid offset issues
    const sortedMatches = [...matches].sort((a, b) => b.index - a.index);

    sortedMatches.forEach((match, index) => {
      const before = result.substring(0, match.index + offset);
      const matched = result.substring(match.index + offset, match.index + offset + match.match.length);
      const after = result.substring(match.index + offset + match.match.length);

      const highlightedMatch = `<span class="bg-yellow-200 dark:bg-yellow-800 px-1 rounded" data-match="${index}">${matched}</span>`;
      
      result = before + highlightedMatch + after;
      offset += highlightedMatch.length - match.match.length;
    });

    return result;
  }, [testText, matches, isValidRegex]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> Regex Tester
          </CardTitle>
          <CardDescription>
            Test and debug regular expressions with real-time matching, highlighting, and comprehensive options.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Regex Pattern Input */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="regex-pattern" className="text-lg font-medium">
                Regular Expression Pattern
              </Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={loadSampleRegex}>
                  Email
                </Button>
                <Button variant="outline" size="sm" onClick={loadSamplePhone}>
                  Phone
                </Button>
                <Button variant="outline" size="sm" onClick={loadSampleDate}>
                  Date
                </Button>
                <Button variant="outline" size="sm" onClick={resetAll}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Reset
                </Button>
              </div>
            </div>
            <div className="relative">
              <Input
                id="regex-pattern"
                placeholder="Enter your regex pattern (e.g., \b\w+@\w+\.\w+\b)"
                value={regexPattern}
                onChange={(e) => setRegexPattern(e.target.value)}
                className={`font-mono ${!isValidRegex ? 'border-red-500' : ''}`}
              />
              {!isValidRegex && (
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              )}
            </div>
            {!isValidRegex && (
              <div className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                <strong>Regex Error:</strong> {regexError}
              </div>
            )}
          </div>

          {/* Regex Options */}
          <div className="border rounded-lg p-4">
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Zap className="h-4 w-4" /> Regex Options
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="global"
                  checked={options.global}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, global: checked }))}
                />
                <Label htmlFor="global">Global (g)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="ignore-case"
                  checked={options.ignoreCase}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, ignoreCase: checked }))}
                />
                <Label htmlFor="ignore-case">Ignore Case (i)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="multiline"
                  checked={options.multiline}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, multiline: checked }))}
                />
                <Label htmlFor="multiline">Multiline (m)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sticky"
                  checked={options.sticky}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, sticky: checked }))}
                />
                <Label htmlFor="sticky">Sticky (y)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="unicode"
                  checked={options.unicode}
                  onCheckedChange={(checked) => setOptions(prev => ({ ...prev, unicode: checked }))}
                />
                <Label htmlFor="unicode">Unicode (u)</Label>
              </div>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Flags: <code className="bg-muted px-2 py-1 rounded">{flags || "none"}</code>
            </div>
          </div>

          {/* Test Text Input */}
          <div className="space-y-4">
            <Label htmlFor="test-text" className="text-lg font-medium">
              Test Text
            </Label>
            <Textarea
              id="test-text"
              placeholder="Enter text to test your regex pattern against..."
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="min-h-[200px]"
            />
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button
              onClick={testRegex}
              disabled={!regexPattern.trim() || !testText.trim()}
              size="lg"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <Search className="h-4 w-4 mr-2" /> Test Regex
            </Button>
          </div>

          {/* Results */}
          {matches.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Label className="text-lg font-medium">
                    Matches Found ({matches.length})
                  </Label>
                </div>
                <Button variant="outline" size="sm" onClick={copyMatches}>
                  <Copy className="h-4 w-4 mr-2" /> Copy Results
                </Button>
              </div>

              {/* Highlighted Text */}
              <div className="border rounded-lg p-4 bg-muted">
                <h4 className="font-medium mb-2">Highlighted Matches:</h4>
                <div 
                  className="whitespace-pre-wrap text-sm"
                  dangerouslySetInnerHTML={{ __html: highlightedText }}
                />
              </div>

              {/* Match Details */}
              <div className="space-y-3">
                <h4 className="font-medium">Match Details:</h4>
                {matches.map((match, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-background">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Match {index + 1}</Badge>
                      <Badge variant="outline">Index: {match.index}</Badge>
                      <Badge variant="outline">Length: {match.match.length}</Badge>
                    </div>
                    <div className="font-mono text-sm bg-muted p-2 rounded">
                      "{match.match}"
                    </div>
                    {match.groups.length > 0 && (
                      <div className="mt-2">
                        <div className="text-sm font-medium mb-1">Capture Groups:</div>
                        <div className="space-y-1">
                          {match.groups.map((group, groupIndex) => (
                            <div key={groupIndex} className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                Group {groupIndex + 1}
                              </Badge>
                              <span className="font-mono text-sm">"{group}"</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Matches Message */}
          {isValidRegex && regexPattern && testText && matches.length === 0 && (
            <div className="text-center p-6 bg-muted rounded-lg">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No matches found for the given pattern and text.</p>
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
              <p className="font-medium">Enter Regex Pattern</p>
              <p className="text-sm text-muted-foreground">Type your regular expression pattern in the input field</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Configure Options</p>
              <p className="text-sm text-muted-foreground">Set regex flags like global, case-insensitive, etc.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Test & Analyze</p>
              <p className="text-sm text-muted-foreground">Enter test text and see real-time matches with highlighting</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Common Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-4 w-4" /> Common Regex Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Email Validation</h4>
              <code className="block bg-muted p-2 rounded text-sm">\b\w+@\w+\.\w+\b</code>
              <p className="text-sm text-muted-foreground">Matches basic email addresses</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Phone Number</h4>
              <code className="block bg-muted p-2 rounded text-sm">\b\d{3}[-.]?\d{3}[-.]?\d{4}\b</code>
              <p className="text-sm text-muted-foreground">Matches US phone number formats</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Date Format</h4>
              <code className="block bg-muted p-2 rounded text-sm">\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b</code>
              <p className="text-sm text-muted-foreground">Matches common date formats</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">URL Pattern</h4>
              <code className="block bg-muted p-2 rounded text-sm">https?://[^\s]+</code>
              <p className="text-sm text-muted-foreground">Matches HTTP/HTTPS URLs</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegexTester;
