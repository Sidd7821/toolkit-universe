import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Loader2, Link, ExternalLink, Search, TrendingUp, 
  Globe, Shield, AlertTriangle, CheckCircle, Eye,
  Calendar, Hash, BarChart3
} from "lucide-react";

interface BacklinkData {
  url: string;
  anchorText: string;
  domainAuthority: number;
  pageAuthority: number;
  spamScore: number;
  firstSeen: string;
  linkType: 'dofollow' | 'nofollow';
  status: 'active' | 'broken' | 'redirect';
  sourceDomain: string;
  sourceTitle?: string;
  context?: string;
}

interface BacklinkSummary {
  totalBacklinks: number;
  totalDomains: number;
  averageDomainAuthority: number;
  dofollowLinks: number;
  nofollowLinks: number;
  brokenLinks: number;
  topDomains: Array<{ domain: string; count: number; da: number }>;
}

const BacklinkChecker = () => {
  const [domain, setDomain] = useState("");
  const [backlinks, setBacklinks] = useState<BacklinkData[]>([]);
  const [summary, setSummary] = useState<BacklinkSummary | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState("");

  const validateDomain = (inputDomain: string): string | null => {
    try {
      let cleanDomain = inputDomain.trim().toLowerCase();
      
      // Remove protocol if present
      cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
      // Remove www if present
      cleanDomain = cleanDomain.replace(/^www\./, '');
      // Remove trailing slash
      cleanDomain = cleanDomain.replace(/\/$/, '');
      
      // Basic domain validation
      if (!cleanDomain || cleanDomain.length < 3 || !cleanDomain.includes('.')) {
        return "Please enter a valid domain name";
      }
      
      return null;
    } catch {
      return "Please enter a valid domain name";
    }
  };

  const simulateProgress = (steps: string[]) => {
    const stepDuration = 3000 / steps.length;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(step);
        setProgress(20 + (index * 60) / steps.length);
      }, index * stepDuration);
    });
  };

  const generateMockBacklinks = (domain: string): BacklinkData[] => {
    const mockSources = [
      { domain: 'techcrunch.com', da: 92, title: 'Tech News and Reviews' },
      { domain: 'medium.com', da: 88, title: 'Industry Insights' },
      { domain: 'reddit.com', da: 95, title: 'Community Discussion' },
      { domain: 'github.com', da: 85, title: 'Open Source Project' },
      { domain: 'stackoverflow.com', da: 87, title: 'Developer Q&A' },
      { domain: 'linkedin.com', da: 89, title: 'Professional Network' },
      { domain: 'youtube.com', da: 94, title: 'Video Content' },
      { domain: 'facebook.com', da: 91, title: 'Social Media' },
      { domain: 'twitter.com', da: 90, title: 'Social Updates' },
      { domain: 'wikipedia.org', da: 93, title: 'Knowledge Base' },
      { domain: 'forbes.com', da: 91, title: 'Business News' },
      { domain: 'hackernews.com', da: 82, title: 'Tech Community' },
      { domain: 'dev.to', da: 75, title: 'Developer Community' },
      { domain: 'quora.com', da: 84, title: 'Q&A Platform' },
      { domain: 'producthunt.com', da: 78, title: 'Product Discovery' }
    ];

    const anchorTexts = [
      domain,
      `Visit ${domain}`,
      'Click here',
      'Learn more',
      'Official website',
      'Read more',
      'Check it out',
      domain.split('.')[0],
      `${domain.split('.')[0]} platform`,
      'Website link',
      'Source',
      'Reference',
      'Homepage'
    ];

    const linkTypes: Array<'dofollow' | 'nofollow'> = ['dofollow', 'nofollow'];
    const statuses: Array<'active' | 'broken' | 'redirect'> = ['active', 'broken', 'redirect'];

    // Generate 8-15 backlinks
    const numBacklinks = 8 + Math.floor(Math.random() * 8);
    const selectedSources = mockSources
      .sort(() => 0.5 - Math.random())
      .slice(0, numBacklinks);

    return selectedSources.map((source, index) => ({
      url: `https://${source.domain}/article-about-${domain.split('.')[0]}-${index + 1}`,
      anchorText: anchorTexts[Math.floor(Math.random() * anchorTexts.length)],
      domainAuthority: source.da + Math.floor(Math.random() * 10 - 5), // Add some variance
      pageAuthority: Math.max(20, source.da - 15 + Math.floor(Math.random() * 20)),
      spamScore: Math.floor(Math.random() * 30), // 0-30% spam score
      firstSeen: new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      linkType: linkTypes[Math.floor(Math.random() * linkTypes.length)],
      status: index === 0 ? 'broken' : statuses[Math.floor(Math.random() * statuses.length)],
      sourceDomain: source.domain,
      sourceTitle: source.title,
      context: `This link was found in an article about ${domain.split('.')[0]} and related topics.`
    }));
  };

  const calculateSummary = (backlinksData: BacklinkData[]): BacklinkSummary => {
    const domainCounts = new Map<string, { count: number; da: number }>();
    
    backlinksData.forEach(link => {
      const current = domainCounts.get(link.sourceDomain) || { count: 0, da: link.domainAuthority };
      domainCounts.set(link.sourceDomain, { 
        count: current.count + 1, 
        da: Math.max(current.da, link.domainAuthority) 
      });
    });

    const topDomains = Array.from(domainCounts.entries())
      .map(([domain, data]) => ({ domain, count: data.count, da: data.da }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalBacklinks: backlinksData.length,
      totalDomains: domainCounts.size,
      averageDomainAuthority: Math.round(
        backlinksData.reduce((sum, link) => sum + link.domainAuthority, 0) / backlinksData.length
      ),
      dofollowLinks: backlinksData.filter(link => link.linkType === 'dofollow').length,
      nofollowLinks: backlinksData.filter(link => link.linkType === 'nofollow').length,
      brokenLinks: backlinksData.filter(link => link.status === 'broken').length,
      topDomains
    };
  };

  const startBacklinkCheck = async () => {
    setError(null);
    
    const domainError = validateDomain(domain);
    if (domainError) {
      setError(domainError);
      return;
    }

    let cleanDomain = domain.trim().toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');

    setIsChecking(true);
    setProgress(0);
    setBacklinks([]);
    setSummary(null);
    setCurrentStep("Initializing backlink analysis...");

    const steps = [
      "Searching major search engines...",
      "Analyzing link profiles...",
      "Checking domain authorities...",
      "Validating link status...",
      "Calculating metrics...",
      "Finalizing results..."
    ];

    simulateProgress(steps);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 3500));
      
      setProgress(85);
      setCurrentStep("Processing backlink data...");

      // Generate mock data (in real implementation, this would call actual APIs)
      const mockBacklinks = generateMockBacklinks(cleanDomain);
      const summaryData = calculateSummary(mockBacklinks);

      setProgress(100);
      setCurrentStep("Analysis complete!");

      setBacklinks(mockBacklinks);
      setSummary(summaryData);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to analyze backlinks: ${errorMessage}`);
    } finally {
      setTimeout(() => {
        setIsChecking(false);
        setProgress(0);
        setCurrentStep("");
      }, 1000);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'broken':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'redirect':
        return <ExternalLink className="w-4 h-4 text-yellow-600" />;
      default:
        return <Globe className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDABadgeVariant = (da: number) => {
    if (da >= 80) return "default";
    if (da >= 60) return "secondary";
    return "outline";
  };

  const getSpamScoreColor = (score: number) => {
    if (score <= 10) return "text-green-600";
    if (score <= 20) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backlink Checker</h1>
        <p className="text-gray-600">Analyze your website's backlink profile and SEO metrics</p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            Domain Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="domain">Enter Domain (without https://)</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !isChecking && startBacklinkCheck()}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => {
                  if (domain) {
                    const url = domain.startsWith('http') ? domain : `https://${domain}`;
                    window.open(url, '_blank');
                  }
                }}
                disabled={!domain}
                title="Visit website"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <Button 
            onClick={startBacklinkCheck} 
            disabled={isChecking || !domain}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Check Backlinks
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

      {/* Progress Section */}
      {isChecking && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Loader2 className="animate-spin w-5 h-5 text-blue-600" />
              <span className="font-medium">{currentStep}</span>
            </div>
            <Progress value={progress} className="w-full h-2" />
            <div className="text-center text-sm text-gray-500 mt-2">
              {progress < 100 ? `${Math.round(progress)}% complete` : 'Processing results...'}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Section */}
      {summary && (
        <Card>
          <CardHeader>
            <CardTitle>Backlink Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {summary.totalBacklinks}
                </div>
                <div className="text-sm text-gray-600">Total Backlinks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {summary.totalDomains}
                </div>
                <div className="text-sm text-gray-600">Referring Domains</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {summary.averageDomainAuthority}
                </div>
                <div className="text-sm text-gray-600">Avg Domain Authority</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {summary.dofollowLinks}
                </div>
                <div className="text-sm text-gray-600">Dofollow Links</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Link Types</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Dofollow</span>
                    <Badge variant="default">{summary.dofollowLinks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nofollow</span>
                    <Badge variant="secondary">{summary.nofollowLinks}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Broken Links</span>
                    <Badge variant="destructive">{summary.brokenLinks}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3">Top Referring Domains</h4>
                <div className="space-y-2">
                  {summary.topDomains.map((topDomain, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm truncate flex-1">{topDomain.domain}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          DA {topDomain.da}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {topDomain.count}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Backlinks List */}
      {backlinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Backlinks Details</span>
              <Badge variant="outline">{backlinks.length} links found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {backlinks.map((backlink, index) => (
                <div key={index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(backlink.status)}
                        <a
                          href={backlink.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm font-medium truncate"
                          title={backlink.url}
                        >
                          {backlink.sourceDomain}
                        </a>
                        <Badge 
                          variant={backlink.linkType === 'dofollow' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {backlink.linkType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">
                        {backlink.sourceTitle}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-1 ml-4">
                      <Badge variant={getDABadgeVariant(backlink.domainAuthority)}>
                        DA {backlink.domainAuthority}
                      </Badge>
                      <Badge variant="outline">
                        PA {backlink.pageAuthority}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-500">Anchor Text:</span>
                      <p className="font-medium mt-1">"{backlink.anchorText}"</p>
                    </div>
                    <div className="flex justify-between">
                      <div>
                        <span className="text-gray-500">First Seen:</span>
                        <p className="font-medium">{backlink.firstSeen}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-gray-500">Spam Score:</span>
                        <p className={`font-medium ${getSpamScoreColor(backlink.spamScore)}`}>
                          {backlink.spamScore}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {backlink.context && (
                    <div className="mt-3 p-2 bg-gray-100 rounded text-xs">
                      <span className="text-gray-500">Context:</span>
                      <p className="mt-1">{backlink.context}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Disclaimer */}
      <Card className="bg-gray-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Eye className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Demo Version</p>
              <p>This is a demonstration version showing sample backlink data. In a production environment, this would integrate with APIs from Moz, Ahrefs, SEMrush, or other SEO tools to provide real backlink analysis.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BacklinkChecker;