import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldAlert, ShieldCheck, ExternalLink, Copy, Loader2 } from "lucide-react";

interface CheckResult {
  url: string;
  isHttps: boolean;
  redirectsToHttps: boolean;
  hasHsts: boolean;
  certificateInfo?: {
    validFrom: string;
    validTo: string;
    issuer: string;
    daysRemaining: number;
  };
  error?: string;
}

const HttpsChecker = () => {
  const { toast } = useToast();
  const [url, setUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  // Function to validate URL format
  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  // Add protocol if missing
  const normalizeUrl = (urlString: string): string => {
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      return `https://${urlString}`;
    }
    return urlString;
  };

  // Check HTTPS status
  const checkHttps = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a URL to check",
        variant: "destructive"
      });
      return;
    }

    const normalizedUrl = normalizeUrl(url.trim());
    
    if (!isValidUrl(normalizedUrl)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // In a real implementation, this would make a server-side request
      // to check HTTPS status. For this demo, we'll simulate the check.
      await simulateHttpsCheck(normalizedUrl);
    } catch (error) {
      setResult({
        url: normalizedUrl,
        isHttps: false,
        redirectsToHttps: false,
        hasHsts: false,
        error: error instanceof Error ? error.message : "Unknown error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate HTTPS check (in a real app, this would be a server-side API call)
  const simulateHttpsCheck = async (urlToCheck: string): Promise<void> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const urlObj = new URL(urlToCheck);
    const isHttps = urlObj.protocol === 'https:';
    
    // Simulate different results based on the URL
    if (urlToCheck.includes('example.com') || urlToCheck.includes('localhost')) {
      setResult({
        url: urlToCheck,
        isHttps,
        redirectsToHttps: false,
        hasHsts: false,
        error: "This is a simulated result. In a real application, this would perform an actual HTTPS check."
      });
      return;
    }

    // Generate simulated results based on the URL
    const redirectsToHttps = isHttps || Math.random() > 0.3;
    const hasHsts = isHttps && Math.random() > 0.2;
    
    // Generate random certificate info if HTTPS
    let certificateInfo;
    if (isHttps) {
      const now = new Date();
      const validFrom = new Date(now.getTime() - (Math.random() * 180 * 24 * 60 * 60 * 1000)); // Up to 180 days ago
      const validTo = new Date(now.getTime() + (Math.random() * 365 * 24 * 60 * 60 * 1000)); // Up to 365 days in future
      const daysRemaining = Math.floor((validTo.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
      
      const issuers = [
        "Let's Encrypt Authority X3",
        "DigiCert SHA2 Secure Server CA",
        "Sectigo RSA Domain Validation Secure Server CA",
        "Amazon",
        "Google Trust Services"
      ];
      
      certificateInfo = {
        validFrom: validFrom.toLocaleDateString(),
        validTo: validTo.toLocaleDateString(),
        issuer: issuers[Math.floor(Math.random() * issuers.length)],
        daysRemaining
      };
    }

    setResult({
      url: urlToCheck,
      isHttps,
      redirectsToHttps,
      hasHsts,
      certificateInfo,
      error: "This is a simulated result. In a real application, this would perform an actual HTTPS check."
    });
  };

  // Copy result to clipboard
  const copyResult = () => {
    if (!result) return;
    
    const resultText = `
    URL: ${result.url}
    HTTPS: ${result.isHttps ? 'Yes' : 'No'}
    Redirects to HTTPS: ${result.redirectsToHttps ? 'Yes' : 'No'}
    HSTS: ${result.hasHsts ? 'Yes' : 'No'}
    ${result.certificateInfo ? `
    Certificate Info:
    - Valid From: ${result.certificateInfo.validFrom}
    - Valid To: ${result.certificateInfo.validTo}
    - Issuer: ${result.certificateInfo.issuer}
    - Days Remaining: ${result.certificateInfo.daysRemaining}
    ` : ''}
    `;
    
    navigator.clipboard.writeText(resultText);
    toast({
      title: "Copied to Clipboard",
      description: "HTTPS check results copied to clipboard"
    });
  };

  // Calculate security score
  const calculateSecurityScore = (): number => {
    if (!result) return 0;
    
    let score = 0;
    if (result.isHttps) score += 50;
    if (result.redirectsToHttps) score += 20;
    if (result.hasHsts) score += 30;
    
    return score;
  };

  // Get security level based on score
  const getSecurityLevel = (): { level: string; color: string } => {
    const score = calculateSecurityScore();
    
    if (score >= 80) return { level: "High", color: "text-green-500" };
    if (score >= 50) return { level: "Medium", color: "text-yellow-500" };
    return { level: "Low", color: "text-red-500" };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          <span>HTTPS Checker</span>
        </CardTitle>
        <CardDescription>
          Check if a website uses HTTPS, redirects to HTTPS, and has proper security headers
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url">Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              placeholder="example.com or https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && checkHttps()}
              className="flex-1"
            />
            <Button 
              onClick={checkHttps} 
              disabled={isLoading}
              className="min-w-[100px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking
                </>
              ) : (
                "Check"
              )}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Enter a domain name or full URL to check its HTTPS configuration
          </p>
        </div>
        
        {/* Results */}
        {result && (
          <div className="space-y-4">
            <Alert variant={result.isHttps ? "default" : "destructive"}>
              <div className="flex items-start">
                <div className="mr-2">
                  {result.isHttps ? (
                    <ShieldCheck className="h-5 w-5 text-green-500" />
                  ) : (
                    <ShieldAlert className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <AlertTitle>
                    {result.isHttps ? "HTTPS Enabled" : "HTTPS Not Enabled"}
                  </AlertTitle>
                  <AlertDescription>
                    {result.isHttps
                      ? "This website is properly secured with HTTPS."
                      : "This website is not using HTTPS, which means data is not encrypted during transmission."}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
            
            {/* Security Score */}
            <div className="p-4 border rounded-lg">
              <h3 className="text-lg font-medium mb-2">Security Score</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="text-3xl font-bold">{calculateSecurityScore()}/100</div>
                <div className={`text-lg font-medium ${getSecurityLevel().color}`}>
                  {getSecurityLevel().level} Security
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>HTTPS Enabled</span>
                  <span className={result.isHttps ? "text-green-500" : "text-red-500"}>
                    {result.isHttps ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Redirects to HTTPS</span>
                  <span className={result.redirectsToHttps ? "text-green-500" : "text-red-500"}>
                    {result.redirectsToHttps ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>HSTS Enabled</span>
                  <span className={result.hasHsts ? "text-green-500" : "text-red-500"}>
                    {result.hasHsts ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Certificate Info */}
            {result.isHttps && result.certificateInfo && (
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-2">SSL Certificate</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Valid From</p>
                    <p>{result.certificateInfo.validFrom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Valid To</p>
                    <p>{result.certificateInfo.validTo}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Issuer</p>
                    <p>{result.certificateInfo.issuer}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className={result.certificateInfo.daysRemaining < 30 ? "text-red-500" : "text-green-500"}>
                      {result.certificateInfo.daysRemaining} days
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.open(result.url, '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Visit Site
              </Button>
              <Button 
                variant="outline" 
                onClick={copyResult}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy Results
              </Button>
            </div>
            
            {/* Disclaimer */}
            {result.error && (
              <p className="text-sm text-muted-foreground">
                Note: {result.error}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HttpsChecker;