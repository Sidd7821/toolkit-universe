import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  FileCode, 
  Copy, 
  Download,
  RotateCcw,
  Eye,
  EyeOff,
  GitBranch,
  GitCommit,
  GitCompare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  lineNumber: number;
  content: string;
  originalLineNumber?: number;
}

interface DiffStats {
  added: number;
  removed: number;
  unchanged: number;
  total: number;
}

const CodeDiffChecker = () => {
  const [originalCode, setOriginalCode] = useState("");
  const [modifiedCode, setModifiedCode] = useState("");
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [diffStats, setDiffStats] = useState<DiffStats | null>(null);
  const [language, setLanguage] = useState("text");
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const { toast } = useToast();

  const languages = [
    { value: "text", label: "Plain Text" },
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "xml", label: "XML" },
    { value: "yaml", label: "YAML" },
    { value: "markdown", label: "Markdown" }
  ];

  const generateDiff = () => {
    if (!originalCode.trim() && !modifiedCode.trim()) {
      toast({
        title: "No code to compare",
        description: "Please enter some code in at least one of the text areas",
        variant: "destructive"
      });
      return;
    }

    const originalLines = originalCode.split('\n');
    const modifiedLines = modifiedCode.split('\n');
    
    let processedOriginal = originalLines;
    let processedModified = modifiedLines;

    if (ignoreWhitespace) {
      processedOriginal = originalLines.map(line => line.trimEnd());
      processedModified = modifiedLines.map(line => line.trimEnd());
    }

    if (ignoreCase) {
      processedOriginal = processedOriginal.map(line => line.toLowerCase());
      processedModified = processedModified.map(line => line.toLowerCase());
    }

    const diff = computeDiff(processedOriginal, processedModified);
    setDiffResult(diff);
    
    const stats = calculateStats(diff);
    setDiffStats(stats);

    toast({
      title: "Diff generated",
      description: `Found ${stats.added} additions, ${stats.removed} deletions`,
    });
  };

  const computeDiff = (original: string[], modified: string[]): DiffLine[] => {
    const result: DiffLine[] = [];
    let originalIndex = 0;
    let modifiedIndex = 0;
    let lineNumber = 1;

    while (originalIndex < original.length || modifiedIndex < modified.length) {
      if (originalIndex < original.length && modifiedIndex < modified.length) {
        if (original[originalIndex] === modified[modifiedIndex]) {
          result.push({
            type: 'unchanged',
            lineNumber: lineNumber,
            content: original[originalIndex],
            originalLineNumber: originalIndex + 1
          });
          originalIndex++;
          modifiedIndex++;
        } else {
          // Look ahead to see if we can find a match
          let foundMatch = false;
          let lookAhead = 1;
          
          while (lookAhead <= 3 && !foundMatch) {
            if (originalIndex + lookAhead < original.length && 
                original[originalIndex + lookAhead] === modified[modifiedIndex]) {
              // Add removed lines
              for (let i = 0; i < lookAhead; i++) {
                result.push({
                  type: 'removed',
                  lineNumber: lineNumber + i,
                  content: original[originalIndex + i],
                  originalLineNumber: originalIndex + i + 1
                });
              }
              originalIndex += lookAhead;
              foundMatch = true;
            } else if (modifiedIndex + lookAhead < modified.length && 
                       original[originalIndex] === modified[modifiedIndex + lookAhead]) {
              // Add added lines
              for (let i = 0; i < lookAhead; i++) {
                result.push({
                  type: 'added',
                  lineNumber: lineNumber + i,
                  content: modified[modifiedIndex + i],
                  originalLineNumber: modifiedIndex + i + 1
                });
              }
              modifiedIndex += lookAhead;
              foundMatch = true;
            }
            lookAhead++;
          }
          
          if (!foundMatch) {
            result.push({
              type: 'removed',
              lineNumber: lineNumber,
              content: original[originalIndex],
              originalLineNumber: originalIndex + 1
            });
            result.push({
              type: 'added',
              lineNumber: lineNumber,
              content: modified[modifiedIndex],
              originalLineNumber: modifiedIndex + 1
            });
            originalIndex++;
            modifiedIndex++;
          }
        }
      } else if (originalIndex < original.length) {
        result.push({
          type: 'removed',
          lineNumber: lineNumber,
          content: original[originalIndex],
          originalLineNumber: originalIndex + 1
        });
        originalIndex++;
      } else {
        result.push({
          type: 'added',
          lineNumber: lineNumber,
          content: modified[modifiedIndex],
          originalLineNumber: modifiedIndex + 1
        });
        modifiedIndex++;
      }
      lineNumber++;
    }

    return result;
  };

  const calculateStats = (diff: DiffLine[]): DiffStats => {
    const added = diff.filter(line => line.type === 'added').length;
    const removed = diff.filter(line => line.type === 'removed').length;
    const unchanged = diff.filter(line => line.type === 'unchanged').length;
    
    return {
      added,
      removed,
      unchanged,
      total: diff.length
    };
  };

  const copyDiff = () => {
    const diffText = diffResult.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      return `${prefix} ${line.content}`;
    }).join('\n');
    
    navigator.clipboard.writeText(diffText);
    toast({
      title: "Copied to clipboard",
      description: "Diff result copied to clipboard",
    });
  };

  const downloadDiff = () => {
    const diffText = diffResult.map(line => {
      const prefix = line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' ';
      return `${prefix} ${line.content}`;
    }).join('\n');
    
    const blob = new Blob([diffText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'code-diff.diff';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setOriginalCode("");
    setModifiedCode("");
    setDiffResult([]);
    setDiffStats(null);
    toast({
      title: "Cleared",
      description: "All content has been cleared",
    });
  };

  const getLineClass = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-50 border-l-4 border-green-500 text-green-900';
      case 'removed':
        return 'bg-red-50 border-l-4 border-red-500 text-red-900';
      case 'unchanged':
        return 'bg-gray-50 border-l-4 border-gray-300';
      default:
        return '';
    }
  };

  const getLineIcon = (type: string) => {
    switch (type) {
      case 'added':
        return '+';
      case 'removed':
        return '-';
      case 'unchanged':
        return ' ';
      default:
        return '';
    }
  };

  const getLineIconColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'text-green-600';
      case 'removed':
        return 'text-red-600';
      case 'unchanged':
        return 'text-gray-400';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Original Code
            </CardTitle>
            <CardDescription>
              Enter the original version of your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label>Code</Label>
              <Textarea
                placeholder="Paste your original code here..."
                value={originalCode}
                onChange={(e) => setOriginalCode(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* Modified Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GitCommit className="h-5 w-5" />
              Modified Code
            </CardTitle>
            <CardDescription>
              Enter the modified version of your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="mt-4">
              <Label>Code</Label>
              <Textarea
                placeholder="Paste your modified code here..."
                value={modifiedCode}
                onChange={(e) => setModifiedCode(e.target.value)}
                rows={15}
                className="font-mono text-sm mt-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Options and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            Diff Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ignoreWhitespace"
                checked={ignoreWhitespace}
                onChange={(e) => setIgnoreWhitespace(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="ignoreWhitespace">Ignore whitespace</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="ignoreCase"
                checked={ignoreCase}
                onChange={(e) => setIgnoreCase(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="ignoreCase">Ignore case</Label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="showLineNumbers"
                checked={showLineNumbers}
                onChange={(e) => setShowLineNumbers(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="showLineNumbers">Show line numbers</Label>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={generateDiff} className="flex-1">
              Generate Diff
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Diff Results */}
      {diffResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCode className="h-5 w-5" />
              Diff Results
            </CardTitle>
            {diffStats && (
              <div className="flex gap-4">
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  +{diffStats.added} added
                </Badge>
                <Badge variant="outline" className="bg-red-50 text-red-700">
                  -{diffStats.removed} removed
                </Badge>
                <Badge variant="outline">
                  {diffStats.unchanged} unchanged
                </Badge>
                <Badge variant="outline">
                  {diffStats.total} total
                </Badge>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button variant="outline" size="sm" onClick={copyDiff}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Diff
              </Button>
              <Button variant="outline" size="sm" onClick={downloadDiff}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-2 text-sm font-medium">
                Diff Output
              </div>
              <div className="max-h-96 overflow-y-auto">
                {diffResult.map((line, index) => (
                  <div
                    key={index}
                    className={`p-2 font-mono text-sm ${getLineClass(line.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      {showLineNumbers && (
                        <span className="text-xs text-muted-foreground min-w-[3rem]">
                          {line.lineNumber}
                        </span>
                      )}
                      <span className={`text-lg font-bold ${getLineIconColor(line.type)} min-w-[1rem]`}>
                        {getLineIcon(line.type)}
                      </span>
                      <span className="flex-1 break-all">
                        {line.content || ' '}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CodeDiffChecker;
