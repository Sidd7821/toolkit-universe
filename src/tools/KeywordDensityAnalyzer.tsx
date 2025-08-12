import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { BarChart3, Copy, Filter, Search } from "lucide-react";

interface KeywordData {
  keyword: string;
  count: number;
  density: number;
}

const KeywordDensityAnalyzer = () => {
  const [text, setText] = useState("");
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [minLength, setMinLength] = useState(3);
  const [excludeCommon, setExcludeCommon] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const commonWords = [
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
    'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
    'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over',
    'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these',
    'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'shall', 'am', 'is', 'are', 'was', 'were', 'be', 'being', 'been'
  ];

  const analyzeKeywords = () => {
    if (!text.trim()) {
      toast({
        title: "Text required",
        description: "Please enter some text to analyze.",
        variant: "destructive" as any
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Clean and normalize text
      const cleanText = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      // Split into words
      const words = cleanText.split(/\s+/);
      const totalWords = words.length;

      // Count word frequency
      const wordCount: { [key: string]: number } = {};
      words.forEach(word => {
        if (word.length >= minLength) {
          wordCount[word] = (wordCount[word] || 0) + 1;
        }
      });

      // Filter out common words if enabled
      let filteredWords = wordCount;
      if (excludeCommon) {
        filteredWords = Object.fromEntries(
          Object.entries(wordCount).filter(([word]) => !commonWords.includes(word))
        );
      }

      // Convert to array and calculate density
      const keywordData: KeywordData[] = Object.entries(filteredWords)
        .map(([keyword, count]) => ({
          keyword,
          count,
          density: (count / totalWords) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50); // Top 50 keywords

      setKeywords(keywordData);
      toast({ title: "Analysis Complete", description: `Found ${keywordData.length} unique keywords.` });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to analyze keywords. Please try again.",
        variant: "destructive" as any
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Content copied to clipboard." });
  };

  const exportResults = () => {
    const csvContent = [
      "Keyword,Count,Density (%)",
      ...keywords.map(k => `${k.keyword},${k.count},${k.density.toFixed(2)}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'keyword-density-analysis.csv';
    a.click();
    URL.revokeObjectURL(url);
    
    toast({ title: "Exported", description: "Results exported as CSV file." });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Text Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="text">Content to Analyze</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your text content here to analyze keyword density..."
                rows={12}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minLength">Minimum Word Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={minLength}
                  onChange={(e) => setMinLength(Number(e.target.value))}
                  min={1}
                  max={10}
                />
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <input
                  id="excludeCommon"
                  type="checkbox"
                  checked={excludeCommon}
                  onChange={(e) => setExcludeCommon(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="excludeCommon">Exclude Common Words</Label>
              </div>
            </div>
            <Button
              variant="hero"
              onClick={analyzeKeywords}
              disabled={isAnalyzing}
              className="w-full"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Analyze Keywords"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analysis Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Text Statistics</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{text.split(/\s+/).filter(w => w.length > 0).length}</div>
                  <div className="text-sm text-muted-foreground">Total Words</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{new Set(text.toLowerCase().match(/\b\w+\b/g) || []).size}</div>
                  <div className="text-sm text-muted-foreground">Unique Words</div>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Common Words Excluded</Label>
              <div className="text-sm text-muted-foreground">
                {excludeCommon ? `${commonWords.length} common words will be filtered out` : "No filtering applied"}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Minimum Word Length</Label>
              <div className="text-sm text-muted-foreground">
                Only words with {minLength} or more characters will be analyzed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {keywords.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Keyword Analysis Results</CardTitle>
            <Button variant="outline" onClick={exportResults}>
              <Copy className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {keywords.map((keyword, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{keyword.keyword}</span>
                      <Badge variant="secondary">{index + 1}</Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Count:</span>
                        <span className="font-mono">{keyword.count}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Density:</span>
                        <span className="font-mono">{keyword.density.toFixed(2)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(keyword.density * 10, 100)}%` }}
                      />
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

export default KeywordDensityAnalyzer;
