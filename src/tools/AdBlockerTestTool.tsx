import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  ShieldCheck, 
  ShieldX, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AdBlockerTest {
  name: string;
  description: string;
  method: string;
  isBlocked: boolean;
  details?: string;
}

const AdBlockerTestTool = () => {
  const [tests, setTests] = useState<AdBlockerTest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallResult, setOverallResult] = useState<'blocked' | 'not-blocked' | 'partial' | 'unknown'>('unknown');
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null);

  const runTests = async () => {
    setIsRunning(true);
    setTests([]);
    
    const newTests: AdBlockerTest[] = [];
    
    // Test 1: Common ad script detection
    try {
      const adScriptTest = await testAdScript();
      newTests.push({
        name: "Ad Script Detection",
        description: "Tests if common ad scripts are blocked",
        method: "Script loading test",
        isBlocked: adScriptTest.blocked,
        details: adScriptTest.details
      });
    } catch (error) {
      newTests.push({
        name: "Ad Script Detection",
        description: "Tests if common ad scripts are blocked",
        method: "Script loading test",
        isBlocked: false,
        details: "Test failed to execute"
      });
    }

    // Test 2: Ad element detection
    const adElementTest = testAdElements();
    newTests.push({
      name: "Ad Element Detection",
      description: "Tests if ad-related DOM elements are hidden",
      method: "DOM element visibility test",
      isBlocked: adElementTest.blocked,
      details: adElementTest.details
    });

    // Test 3: CSS class detection
    const cssTest = testCSSClasses();
    newTests.push({
      name: "CSS Class Detection",
      description: "Tests if ad-related CSS classes are modified",
      method: "CSS class modification test",
      isBlocked: cssTest.blocked,
      details: cssTest.details
    });

    // Test 4: Network request detection
    const networkTest = await testNetworkRequests();
    newTests.push({
      name: "Network Request Detection",
      description: "Tests if ad-related network requests are blocked",
      method: "Network request test",
      isBlocked: networkTest.blocked,
      details: networkTest.details
    });

    // Test 5: Timing-based detection
    const timingTest = await testTiming();
    newTests.push({
      name: "Timing-based Detection",
      description: "Tests for timing anomalies that indicate ad blocking",
      method: "Performance timing test",
      isBlocked: timingTest.blocked,
      details: timingTest.details
    });

    setTests(newTests);
    setLastTestTime(new Date());
    setIsRunning(false);

    // Determine overall result
    const blockedCount = newTests.filter(test => test.isBlocked).length;
    if (blockedCount === 0) {
      setOverallResult('not-blocked');
    } else if (blockedCount === newTests.length) {
      setOverallResult('blocked');
    } else {
      setOverallResult('partial');
    }

    toast({
      title: "Tests completed",
      description: `Ad blocker detection tests completed. ${blockedCount} out of ${newTests.length} tests detected blocking.`,
    });
  };

  const testAdScript = async (): Promise<{ blocked: boolean; details: string }> => {
    return new Promise((resolve) => {
      const testScripts = [
        'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
        'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
        'https://www.googletagmanager.com/gtag/js'
      ];

      let blockedCount = 0;
      let totalTests = testScripts.length;

      testScripts.forEach((scriptUrl) => {
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
          totalTests--;
          if (totalTests === 0) {
            resolve({
              blocked: blockedCount > 0,
              details: `${blockedCount} out of ${testScripts.length} ad scripts were blocked`
            });
          }
        };
        script.onerror = () => {
          blockedCount++;
          totalTests--;
          if (totalTests === 0) {
            resolve({
              blocked: blockedCount > 0,
              details: `${blockedCount} out of ${testScripts.length} ad scripts were blocked`
            });
          }
        };
        document.head.appendChild(script);
        
        // Clean up after a short delay
        setTimeout(() => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        }, 2000);
      });
    });
  };

  const testAdElements = (): { blocked: boolean; details: string } => {
    // Create test ad elements
    const testElements = [
      { id: 'test-ad-1', className: 'advertisement' },
      { id: 'test-ad-2', className: 'adsbygoogle' },
      { id: 'test-ad-3', className: 'google-ad' }
    ];

    let hiddenCount = 0;
    const details: string[] = [];

    testElements.forEach(({ id, className }) => {
      const element = document.createElement('div');
      element.id = id;
      element.className = className;
      element.style.width = '100px';
      element.style.height = '100px';
      element.style.backgroundColor = 'red';
      element.textContent = 'Test Ad';
      document.body.appendChild(element);

      // Check if element is hidden
      const rect = element.getBoundingClientRect();
      const isHidden = rect.width === 0 || rect.height === 0 || 
                      window.getComputedStyle(element).display === 'none' ||
                      window.getComputedStyle(element).visibility === 'hidden';

      if (isHidden) {
        hiddenCount++;
        details.push(`${className} element was hidden`);
      }

      // Clean up
      document.body.removeChild(element);
    });

    return {
      blocked: hiddenCount > 0,
      details: hiddenCount > 0 ? `${hiddenCount} ad elements were hidden: ${details.join(', ')}` : 'No ad elements were hidden'
    };
  };

  const testCSSClasses = (): { blocked: boolean; details: string } => {
    // Test if common ad-blocking CSS is applied
    const testElement = document.createElement('div');
    testElement.className = 'adsbygoogle';
    testElement.style.cssText = 'width: 100px; height: 100px; background: red;';
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const isHidden = computedStyle.display === 'none' || 
                    computedStyle.visibility === 'hidden' ||
                    computedStyle.opacity === '0';

    document.body.removeChild(testElement);

    return {
      blocked: isHidden,
      details: isHidden ? 'Ad-related CSS classes are being modified' : 'No CSS modifications detected'
    };
  };

  const testNetworkRequests = async (): Promise<{ blocked: boolean; details: string }> => {
    const testUrls = [
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      'https://securepubads.g.doubleclick.net/tag/js/gpt.js'
    ];

    let blockedCount = 0;
    const details: string[] = [];

    for (const url of testUrls) {
      try {
        const response = await fetch(url, { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        // If we get here, the request wasn't blocked
      } catch (error) {
        blockedCount++;
        details.push(`Request to ${url} was blocked`);
      }
    }

    return {
      blocked: blockedCount > 0,
      details: blockedCount > 0 ? `${blockedCount} network requests were blocked: ${details.join(', ')}` : 'No network requests were blocked'
    };
  };

  const testTiming = async (): Promise<{ blocked: boolean; details: string }> => {
    const startTime = performance.now();
    
    // Try to load a known ad script
    const script = document.createElement('script');
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
    
    return new Promise((resolve) => {
      script.onload = () => {
        const loadTime = performance.now() - startTime;
        document.head.removeChild(script);
        
        // If load time is very fast, it might be blocked
        const isBlocked = loadTime < 10; // Less than 10ms is suspicious
        
        resolve({
          blocked: isBlocked,
          details: isBlocked ? `Script loaded too quickly (${loadTime.toFixed(2)}ms), likely blocked` : `Script loaded normally (${loadTime.toFixed(2)}ms)`
        });
      };
      
      script.onerror = () => {
        const loadTime = performance.now() - startTime;
        resolve({
          blocked: true,
          details: `Script failed to load after ${loadTime.toFixed(2)}ms`
        });
      };
      
      document.head.appendChild(script);
      
      // Timeout after 5 seconds
      setTimeout(() => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
          resolve({
            blocked: true,
            details: 'Script load timed out after 5 seconds'
          });
        }
      }, 5000);
    });
  };

  const getOverallResultIcon = () => {
    switch (overallResult) {
      case 'blocked':
        return <ShieldX className="h-6 w-6 text-red-500" />;
      case 'not-blocked':
        return <ShieldCheck className="h-6 w-6 text-green-500" />;
      case 'partial':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      default:
        return <Shield className="h-6 w-6 text-gray-500" />;
    }
  };

  const getOverallResultText = () => {
    switch (overallResult) {
      case 'blocked':
        return 'Ad Blocker Detected';
      case 'not-blocked':
        return 'No Ad Blocker Detected';
      case 'partial':
        return 'Partial Ad Blocking Detected';
      default:
        return 'Test Not Run';
    }
  };

  const getOverallResultColor = () => {
    switch (overallResult) {
      case 'blocked':
        return 'text-red-600';
      case 'not-blocked':
        return 'text-green-600';
      case 'partial':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">

      {/* Overall Result */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getOverallResultIcon()}
            Overall Result
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className={`text-xl font-semibold ${getOverallResultColor()}`}>
                {getOverallResultText()}
              </h3>
              {lastTestTime && (
                <p className="text-sm text-muted-foreground">
                  Last tested: {lastTestTime.toLocaleString()}
                </p>
              )}
            </div>
            <Button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center gap-2"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Test Results */}
      {tests.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          {tests.map((test, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{test.name}</CardTitle>
                  <Badge variant={test.isBlocked ? "destructive" : "default"}>
                    {test.isBlocked ? (
                      <ShieldX className="h-3 w-3 mr-1" />
                    ) : (
                      <ShieldCheck className="h-3 w-3 mr-1" />
                    )}
                    {test.isBlocked ? "Blocked" : "Not Blocked"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{test.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Method:</span>
                    <span>{test.method}</span>
                  </div>
                  {test.details && (
                    <Alert>
                      <AlertDescription>{test.details}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            How It Works
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <p>
              This tool uses multiple detection methods to identify if an ad blocker is active:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Script Detection:</strong> Attempts to load common ad scripts</li>
              <li><strong>Element Detection:</strong> Checks if ad-related DOM elements are hidden</li>
              <li><strong>CSS Detection:</strong> Tests for ad-blocking CSS modifications</li>
              <li><strong>Network Detection:</strong> Monitors network requests to ad servers</li>
              <li><strong>Timing Detection:</strong> Analyzes load times for suspicious patterns</li>
            </ul>
            <p className="text-muted-foreground">
              Note: Ad blockers are constantly evolving, so results may vary. Some legitimate privacy tools may also trigger these tests.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdBlockerTestTool;
