import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { Loader2, Smartphone, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

interface MobileTestResult {
  url: string;
  isMobileFriendly: boolean;
  issues: string[];
  recommendations: string[];
  score: number;
}

const MobileFriendlyTest = () => {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<MobileTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);

  const API_KEY = "AIzaSyD4mF9lKBwgB5YSsicTaV7sqR7txTzOusA"; // Replace with your Google PageSpeed Insights API key

  const validateUrl = (inputUrl: string): string | null => {
    try {
      let validUrl = inputUrl.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      const urlObj = new URL(validUrl);
      
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return "Please enter a valid domain name";
      }
      
      return null;
    } catch {
      return "Please enter a valid URL starting with http:// or https://";
    }
  };

  const simulateRealisticProgress = () => {
    const intervals = [
      { time: 200, progress: 10 },
      { time: 500, progress: 30 },
      { time: 1000, progress: 50 },
      { time: 2000, progress: 70 },
      { time: 3000, progress: 90 },
      { time: 4000, progress: 100 }
    ];

    intervals.forEach(({ time, progress }) => {
      setTimeout(() => setProgress(progress), time);
    });
  };

  const startTest = async () => {
    const urlError = validateUrl(url);
    if (urlError) {
      toast({
        title: "Invalid URL",
        description: urlError,
        variant: "destructive" as any,
      });
      return;
    }

    // Normalize URL
    let testUrl = url.trim();
    if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
      testUrl = 'https://' + testUrl;
    }

    setIsTesting(true);
    setResults(null);
    setProgress(0);
    simulateRealisticProgress();

    try {
      // Using Google PageSpeed Insights API with mobile strategy
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=mobile&category=accessibility&category=best-practices&key=${API_KEY}`;
      
      const response = await fetch(apiUrl);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("API rate limit exceeded. Please check your API key or try again later.");
        } else if (response.status === 400) {
          throw new Error("Invalid URL or the website is not accessible.");
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid or unauthorized API key. Please check your API key.");
        } else {
          throw new Error(`API error: ${response.status}`);
        }
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message || "Unknown API error");
      }

      const lighthouse = data.lighthouseResult;
      const audits = lighthouse.audits;
      const categories = lighthouse.categories;

      // Check mobile-friendly status
      const mobileFriendlyAudit = audits['is-mobile-friendly'] || audits['mobile-friendly'] || {};
      const isMobileFriendly = mobileFriendlyAudit.score >= 0.9;

      // Extract issues and recommendations
      const issues: string[] = [];
      const recommendations: string[] = [];

      Object.entries(audits).forEach(([key, audit]: [string, any]) => {
        if (audit.score !== null && audit.score < 0.9 && audit.title && audit.description) {
          issues.push(audit.title);
          recommendations.push(audit.description.replace(/<[^>]*>/g, '')); // Remove HTML tags
        }
      });

      // Calculate a mobile-friendly score (based on accessibility and best practices)
      const score = Math.round(
        ((categories.accessibility?.score || 0) * 0.6 + (categories['best-practices']?.score || 0) * 0.4) * 100
      );

      setResults({
        url: testUrl,
        isMobileFriendly,
        issues: isMobileFriendly ? [] : issues.slice(0, 5), // Limit to top 5 issues
        recommendations: recommendations.slice(0, 5), // Limit to top 5 recommendations
        score
      });

      toast({
        title: "Mobile Test Complete",
        description: isMobileFriendly ? "Website is mobile-friendly!" : "Issues found with mobile optimization",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Mobile test failed. Try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive" as any,
      });
    } finally {
      setTimeout(() => {
        setIsTesting(false);
        setProgress(0);
      }, 500);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-5 w-5" />
          Mobile Friendly Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="url">Website URL</Label>
          <Input
            id="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isTesting && startTest()}
          />
        </div>

        <Button onClick={startTest} disabled={isTesting || !url}>
          {isTesting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            "Test Mobile Friendliness"
          )}
        </Button>

        {isTesting && <Progress value={progress} />}

        {results && (
          <div className="space-y-4 mt-6">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-2">
                {results.isMobileFriendly ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Mobile Friendly Status</span>
              </div>
              <Badge variant={results.isMobileFriendly ? "default" : "destructive"}>
                {results.isMobileFriendly ? "PASS" : "FAIL"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <span className="font-medium">Mobile Score</span>
              <div className="flex items-center gap-2">
                <span className={`text-xl font-bold ${getScoreColor(results.score)}`}>
                  {results.score}/100
                </span>
                <Badge variant={getScoreBadge(results.score) as any}>
                  {results.score >= 80 ? "Excellent" : results.score >= 60 ? "Good" : "Needs Improvement"}
                </Badge>
              </div>
            </div>

            {!results.isMobileFriendly && results.issues.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  Issues Found
                </h3>
                <ul className="space-y-1">
                  {results.issues.map((issue, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {results.recommendations.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Recommendations
                </h3>
                <ul className="space-y-1">
                  {results.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-green-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted rounded-lg">
              <strong>Note:</strong> Results are based on Google's Mobile-Friendly Test via PageSpeed Insights. Ensure your API key is valid for accurate results.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MobileFriendlyTest;