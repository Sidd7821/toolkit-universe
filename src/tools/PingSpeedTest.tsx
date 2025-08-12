import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Wifi, Clock, Download, Upload, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as ndt7 from '@m-lab/ndt7'; // Note: Install with npm install @m-lab/ndt7

interface PingResult {
  host: string;
  time: number;
  status: 'success' | 'timeout' | 'error';
  timestamp: Date;
}

interface SpeedResult {
  download: number;
  upload: number;
  ping: number;
  timestamp: Date;
}

const PingSpeedTest = () => {
  const [host, setHost] = useState("8.8.8.8");
  const [pingCount, setPingCount] = useState(4);
  const [isPinging, setIsPinging] = useState(false);
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [pingResults, setPingResults] = useState<PingResult[]>([]);
  const [speedResult, setSpeedResult] = useState<SpeedResult | null>(null);
  const [pingProgress, setPingProgress] = useState(0);
  const [speedProgress, setSpeedProgress] = useState(0);
  const { toast } = useToast();
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const speedTestRef = useRef<NodeJS.Timeout | null>(null);

  const commonHosts = [
    { value: "8.8.8.8", label: "Google DNS (8.8.8.8)" },
    { value: "1.1.1.1", label: "Cloudflare DNS (1.1.1.1)" },
    { value: "208.67.222.222", label: "OpenDNS (208.67.222.222)" },
    { value: "google.com", label: "Google.com" },
    { value: "github.com", label: "GitHub.com" },
  ];

  const validateHost = (host: string) => {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
    return ipRegex.test(host) || domainRegex.test(host);
  };

  const realPing = async (host: string): Promise<PingResult[]> => {
    try {
      const proxy = 'https://corsproxy.io/?';
      const apiUrl = `https://api.hackertarget.com/ping/?q=${encodeURIComponent(host)}`;
      const url = proxy + encodeURIComponent(apiUrl);
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('API error');
      }
      const text = await response.text();
      const lines = text.split('\n');
      const results: PingResult[] = [];
      lines.forEach((line) => {
        if (line.startsWith('64 bytes from')) {
          const match = line.match(/time=([\d.]+) ms/);
          if (match) {
            results.push({
              host,
              time: parseFloat(match[1]),
              status: 'success',
              timestamp: new Date(),
            });
          }
        } else if (line.includes('Request timed out') || line.includes('timed out')) {
          results.push({
            host,
            time: 0,
            status: 'timeout',
            timestamp: new Date(),
          });
        }
      });
      return results;
    } catch (error) {
      return [];
    }
  };

  const startPingTest = async () => {
    if (!host.trim()) {
      toast({
        title: "Error",
        description: "Please enter a host address",
        variant: "destructive",
      });
      return;
    }

    if (!validateHost(host.trim())) {
      toast({
        title: "Error",
        description: "Please enter a valid host address",
        variant: "destructive",
      });
      return;
    }

    setIsPinging(true);
    setPingResults([]);
    setPingProgress(0);

    const apiResults = await realPing(host.trim());
    const totalPings = Math.min(pingCount, apiResults.length);
    const results = apiResults.slice(0, totalPings);

    for (let i = 0; i < totalPings; i++) {
      setPingResults((prev) => [...prev, results[i]]);
      setPingProgress(((i + 1) / totalPings) * 100);
      if (i < totalPings - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (apiResults.length === 0) {
      toast({
        title: "Ping failed",
        description: "Unable to retrieve ping data",
        variant: "destructive",
      });
    }

    setIsPinging(false);
    setPingProgress(100);
  };

  const startSpeedTest = () => {
    setIsSpeedTesting(true);
    setSpeedResult(null);
    setSpeedProgress(0);

    let currentDirection = '';
    let downloadSpeed = 0;
    let uploadSpeed = 0;
    let minRtt = Infinity;

    const progressInterval = setInterval(() => {
      setSpeedProgress((prev) => Math.min(100, prev + 2.5)); // Gradual progress over ~40 seconds
    }, 1000);

    const callbacks = {
      start: (direction: string) => {
        currentDirection = direction;
      },
      measurement: (data: any) => {
        if (data.Source === 'client') {
          const speed = data.ClientData.MeanClientMbps;
          if (currentDirection === 'download') {
            downloadSpeed = speed;
          } else if (currentDirection === 'upload') {
            uploadSpeed = speed;
          }
        } else if (data.Source === 'server' && data.ServerData.TCPInfo && data.ServerData.TCPInfo.RTT) {
          const rtt = data.ServerData.TCPInfo.RTT;
          if (rtt < minRtt) {
            minRtt = rtt;
          }
        }
      },
      complete: (direction: string) => {
        if (direction === 'upload') {
          clearInterval(progressInterval);
          setSpeedProgress(100);
          setSpeedResult({
            download: Math.round(downloadSpeed * 10) / 10,
            upload: Math.round(uploadSpeed * 10) / 10,
            ping: Math.round(minRtt),
            timestamp: new Date(),
          });
          toast({
            title: "Speed test completed!",
            description: `Download: ${downloadSpeed.toFixed(1)} Mbps, Upload: ${uploadSpeed.toFixed(1)} Mbps`,
          });
          setIsSpeedTesting(false);
        }
      },
      error: (direction: string, error: Error) => {
        clearInterval(progressInterval);
        toast({
          title: "Speed test failed",
          description: error.message || "Please try again later",
          variant: "destructive",
        });
        setIsSpeedTesting(false);
      },
    };

    ndt7.test(
      {
        userAcceptedDataPolicy: true,
      },
      callbacks
    );
  };

  const getPingStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'timeout':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSpeedQuality = (speed: number, type: 'download' | 'upload') => {
    if (type === 'download') {
      if (speed >= 100) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
      if (speed >= 50) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
      if (speed >= 25) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
      return { label: 'Poor', color: 'bg-red-100 text-red-800' };
    } else {
      if (speed >= 50) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
      if (speed >= 25) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
      if (speed >= 10) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
      return { label: 'Poor', color: 'bg-red-100 text-red-800' };
    }
  };

  const getPingQuality = (ping: number) => {
    if (ping < 20) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (ping < 50) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (ping < 100) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Poor', color: 'bg-red-100 text-red-800' };
  };

  const calculatePingStats = () => {
    const successfulPings = pingResults.filter(r => r.status === 'success');
    if (successfulPings.length === 0) return null;

    const times = successfulPings.map(r => r.time);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    const loss = ((pingResults.length - successfulPings.length) / pingResults.length) * 100;

    return { avg: Math.round(avg), min, max, loss: Math.round(loss) };
  };

  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (speedTestRef.current) clearTimeout(speedTestRef.current);
    };
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Ping & Speed Test Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="host">Host Address</Label>
              <Input
                id="host"
                placeholder="8.8.8.8"
                value={host}
                onChange={(e) => setHost(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pingCount">Ping Count</Label>
              <Input
                id="pingCount"
                type="number"
                min="1"
                max="4"
                value={pingCount}
                onChange={(e) => setPingCount(Math.min(4, parseInt(e.target.value) || 4))}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button 
                onClick={startPingTest} 
                disabled={isPinging}
                className="w-full"
              >
                {isPinging ? "Pinging..." : "Start Ping Test"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Quick Test Hosts</Label>
            <div className="flex flex-wrap gap-2">
              {commonHosts.map((commonHost) => (
                <Button
                  key={commonHost.value}
                  variant="outline"
                  size="sm"
                  onClick={() => setHost(commonHost.value)}
                  className="text-xs"
                >
                  {commonHost.label}
                </Button>
              ))}
            </div>
          </div>

          {isPinging && (
            <div className="space-y-2">
              <Label>Ping Progress</Label>
              <Progress value={pingProgress} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ping Results */}
      {pingResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Ping Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pingResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={getPingStatusColor(result.status)}>
                      {result.status === 'success' ? `${result.time}ms` : result.status}
                    </Badge>
                    <span className="font-mono text-sm">{result.host}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {result.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              ))}
              
              {calculatePingStats() && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-semibold mb-2">Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Average:</span>
                      <div className="font-semibold">{calculatePingStats()?.avg}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Minimum:</span>
                      <div className="font-semibold">{calculatePingStats()?.min}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Maximum:</span>
                      <div className="font-semibold">{calculatePingStats()?.max}ms</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Packet Loss:</span>
                      <div className="font-semibold">{calculatePingStats()?.loss}%</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Speed Test */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5" />
            Internet Speed Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={startSpeedTest} 
            disabled={isSpeedTesting}
            className="w-full"
            size="lg"
          >
            {isSpeedTesting ? "Testing Speed..." : "Start Speed Test"}
          </Button>

          {isSpeedTesting && (
            <div className="space-y-2">
              <Label>Test Progress</Label>
              <Progress value={speedProgress} className="w-full" />
            </div>
          )}

          {speedResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Download className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">{speedResult.download}</div>
                  <div className="text-sm text-muted-foreground">Mbps</div>
                  <Badge className={`mt-2 ${getSpeedQuality(speedResult.download, 'download').color}`}>
                    {getSpeedQuality(speedResult.download, 'download').label}
                  </Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">{speedResult.upload}</div>
                  <div className="text-sm text-muted-foreground">Mbps</div>
                  <Badge className={`mt-2 ${getSpeedQuality(speedResult.upload, 'upload').color}`}>
                    {getSpeedQuality(speedResult.upload, 'upload').label}
                  </Badge>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">{speedResult.ping}</div>
                  <div className="text-sm text-muted-foreground">ms</div>
                  <Badge className={`mt-2 ${getPingQuality(speedResult.ping).color}`}>
                    {getPingQuality(speedResult.ping).label}
                  </Badge>
                </div>
              </div>
              
              <div className="text-center text-sm text-muted-foreground">
                Test completed at {speedResult.timestamp.toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Ping & Speed Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Ping Test:</strong> Measures the time it takes for data packets to travel from your device to a server and back. 
            Lower ping times indicate better network responsiveness.
          </p>
          <p>
            <strong>Speed Test:</strong> Measures your internet connection's download and upload speeds. 
            Download speed affects how fast you can stream, download, or browse, while upload speed affects 
            video calls, file sharing, and online gaming.
          </p>
          <p>
            <strong>Quality Ratings:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Excellent:</strong> Ideal for streaming, gaming, and video calls</li>
            <li><strong>Good:</strong> Suitable for most online activities</li>
            <li><strong>Fair:</strong> May experience some buffering or lag</li>
            <li><strong>Poor:</strong> Consider upgrading your internet plan</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PingSpeedTest;