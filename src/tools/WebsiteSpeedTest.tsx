import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Timer, ExternalLink, CheckCircle, AlertTriangle, Loader2,
  Clock, Download, Activity, Zap, Globe, Shield
} from "lucide-react";

interface SpeedTestResult {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  recommendations: Array<{
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  loadingExperience: string;
  url: string;
  timestamp: string;
}

const WebsiteSpeedTest = () => {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<SpeedTestResult | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [strategy, setStrategy] = useState<'mobile' | 'desktop'>('mobile');

  const API_KEY = "AIzaSyD4mF9lKBwgB5YSsicTaV7sqR7txTzOusA"; // Replace with your Google PageSpeed Insights API key

  const validateUrl = (inputUrl: string): string | null => {
    try {
      // Add protocol if missing
      let validUrl = inputUrl.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      const urlObj = new URL(validUrl);
      
      // Basic validation
      if (!urlObj.hostname || urlObj.hostname.length < 3) {
        return "Please enter a valid domain name";
      }
      
      return null;
    } catch {
      return "Please enter a valid URL";
    }
  };

  const simulateRealisticProgress = () => {
    const intervals = [
      { time: 200, progress: 10 },
      { time: 500, progress: 25 },
      { time: 1000, progress: 40 },
      { time: 2000, progress: 60 },
      { time: 3000, progress: 80 },
      { time: 4000, progress: 95 },
      { time: 5000, progress: 100 }
    ];

    intervals.forEach(({ time, progress }) => {
      setTimeout(() => setProgress(progress), time);
    });
  };

  const runSpeedTest = async () => {
    setError(null);
    
    const urlError = validateUrl(url);
    if (urlError) {
      setError(urlError);
      return;
    }

    // Normalize URL
    let testUrl = url.trim();
    if (!testUrl.startsWith('http://') && !testUrl.startsWith('https://')) {
      testUrl = 'https://' + testUrl;
    }

    setIsTesting(true);
    setProgress(0);
    setResults(null);
    simulateRealisticProgress();

    try {
      // Using PageSpeed Insights API with API key
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(testUrl)}&strategy=${strategy}&category=performance&category=accessibility&category=best-practices&category=seo&key=${API_KEY}`;
      
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
      
      // Extract recommendations with impact levels
      const recommendations: Array<{title: string, description: string, impact: 'high' | 'medium' | 'low'}> = [];
      
      const criticalAudits = [
        'largest-contentful-paint',
        'first-contentful-paint',
        'speed-index',
        'total-blocking-time',
        'cumulative-layout-shift'
      ];

      Object.entries(audits).forEach(([key, audit]: [string, any]) => {
        if (audit.score !== null && audit.score < 0.9 && audit.title && audit.description) {
          const impact = criticalAudits.includes(key) ? 'high' : 
                        audit.score < 0.5 ? 'medium' : 'low';
          
          recommendations.push({
            title: audit.title,
            description: audit.description.replace(/<[^>]*>/g, ''), // Remove HTML tags
            impact
          });
        }
      });

      // Sort recommendations by impact
      recommendations.sort((a, b) => {
        const impactOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        return impactOrder[b.impact] - impactOrder[a.impact];
      });

      const loadingExperience = data.loadingExperience?.overall_category || 'UNKNOWN';

      setResults({
        performanceScore: Math.round((categories.performance?.score || 0) * 100),
        accessibilityScore: Math.round((categories.accessibility?.score || 0) * 100),
        bestPracticesScore: Math.round((categories['best-practices']?.score || 0) * 100),
        seoScore: Math.round((categories.seo?.score || 0) * 100),
        firstContentfulPaint: audits['first-contentful-paint']?.numericValue || 0,
        largestContentfulPaint: audits['largest-contentful-paint']?.numericValue || 0,
        totalBlockingTime: audits['total-blocking-time']?.numericValue || 0,
        cumulativeLayoutShift: audits['cumulative-layout-shift']?.numericValue || 0,
        speedIndex: audits['speed-index']?.numericValue || 0,
        recommendations: recommendations.slice(0, 8), // Limit to top 8 recommendations
        loadingExperience,
        url: testUrl,
        timestamp: new Date().toLocaleString()
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Speed test error:', error);
    } finally {
      setTimeout(() => {
        setIsTesting(false);
        setProgress(0);
      }, 500);
    }
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { 
      icon: <CheckCircle className="text-green-600 w-4 h-4" />, 
      variant: "default" as const, 
      label: "Good",
      color: "text-green-600"
    };
    if (score >= 50) return { 
      icon: <AlertTriangle className="text-yellow-600 w-4 h-4" />, 
      variant: "secondary" as const, 
      label: "Needs Work",
      color: "text-yellow-600"
    };
    return { 
      icon: <AlertTriangle className="text-red-600 w-4 h-4" />, 
      variant: "destructive" as const, 
      label: "Poor",
      color: "text-red-600"
    };
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatTime = (milliseconds: number) => {
    if (milliseconds >= 1000) {
      return `${(milliseconds / 1000).toFixed(2)}s`;
    }
    return `${Math.round(milliseconds)}ms`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Website Speed Test</h1>
        <p className="text-gray-600">Test your website's performance with Google PageSpeed Insights</p>
      </div>

      {/* Input and Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Test Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">Website URL</Label>
            <div className="flex gap-2 mt-1">
              <Input 
                id="url" 
                value={url} 
                onChange={e => setUrl(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && !isTesting && runSpeedTest()}
                placeholder="example.com or https://example.com" 
                className="flex-1"
              />
              <Button 
                variant="outline" 
                onClick={() => {
                  let openUrl = url;
                  if (!openUrl.startsWith('http')) openUrl = 'https://' + openUrl;
                  window.open(openUrl, "_blank");
                }}
                disabled={!url}
                title="Open in new tab"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label>Test Strategy</Label>
            <div className="flex gap-2 mt-1">
              <Button
                variant={strategy === 'mobile' ? 'default' : 'outline'}
                onClick={() => setStrategy('mobile')}
                disabled={isTesting}
                size="sm"
              >
                📱 Mobile
              </Button>
              <Button
                variant={strategy === 'desktop' ? 'default' : 'outline'}
                onClick={() => setStrategy('desktop')}
                disabled={isTesting}
                size="sm"
              >
                💻 Desktop
              </Button>
            </div>
          </div>

          <Button 
            onClick={runSpeedTest} 
            disabled={isTesting || !url} 
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isTesting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Timer className="w-4 h-4 mr-2" />
                Start Speed Test
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Progress Bar */}
      {isTesting && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="animate-spin w-5 h-5 text-blue-600" />
              <span className="font-medium">Analyzing website performance...</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-center text-sm text-gray-500 mt-2">
              {progress < 100 ? `${progress}% complete` : 'Finalizing results...'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <div className="space-y-6">
          {/* Overall Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Performance Overview</span>
                <div className="text-sm text-gray-500">
                  {results.timestamp} • {strategy === 'mobile' ? '📱' : '💻'} {strategy}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Performance', score: results.performanceScore, icon: <Zap className="w-5 h-5" /> },
                  { label: 'Accessibility', score: results.accessibilityScore, icon: <Shield className="w-5 h-5" /> },
                  { label: 'Best Practices', score: results.bestPracticesScore, icon: <CheckCircle className="w-5 h-5" /> },
                  { label: 'SEO', score: results.seoScore, icon: <Globe className="w-5 h-5" /> }
                ].map((item, index) => {
                  const badge = getScoreBadge(item.score);
                  return (
                    <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        {item.icon}
                      </div>
                      <div className={`text-2xl font-bold mb-1 ${badge.color}`}>
                        {item.score}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">{item.label}</div>
                      <Badge variant={badge.variant} className="text-xs">
                        {badge.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals & Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { 
                    label: 'First Contentful Paint', 
                    value: formatTime(results.firstContentfulPaint), 
                    icon: <Clock className="w-5 h-5 text-blue-600" />,
                    good: results.firstContentfulPaint <= 1800
                  },
                  { 
                    label: 'Largest Contentful Paint', 
                    value: formatTime(results.largestContentfulPaint), 
                    icon: <Download className="w-5 h-5 text-green-600" />,
                    good: results.largestContentfulPaint <= 2500
                  },
                  { 
                    label: 'Total Blocking Time', 
                    value: formatTime(results.totalBlockingTime), 
                    icon: <Activity className="w-5 h-5 text-purple-600" />,
                    good: results.totalBlockingTime <= 200
                  },
                  { 
                    label: 'Cumulative Layout Shift', 
                    value: results.cumulativeLayoutShift.toFixed(3), 
                    icon: <AlertTriangle className="w-5 h-5 text-orange-600" />,
                    good: results.cumulativeLayoutShift <= 0.1
                  },
                  { 
                    label: 'Speed Index', 
                    value: formatTime(results.speedIndex), 
                    icon: <Zap className="w-5 h-5 text-yellow-600" />,
                    good: results.speedIndex <= 3400
                  }
                ].map((metric, index) => (
                  <div key={index} className="text-center p-3 border rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      {metric.icon}
                    </div>
                    <div className={`text-lg font-semibold mb-1 ${metric.good ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.value}
                    </div>
                    <div className="text-xs text-gray-600 leading-tight">{metric.label}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {results.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {results.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getImpactColor(recommendation.impact)} border-0`}
                      >
                        {recommendation.impact.toUpperCase()}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm mb-1">{recommendation.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2">
                          {recommendation.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default WebsiteSpeedTest;