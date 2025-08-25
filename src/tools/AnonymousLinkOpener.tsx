import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Shield, 
  Eye, 
  EyeOff, 
  Copy,
  Link,
  Lock,
  AlertTriangle,
  CheckCircle,
  Info,
  History,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProxyService {
  name: string;
  url: string;
  description: string;
  features: string[];
  isRecommended: boolean;
  paramMode?: boolean; // if true, append ?u=<url>
}

interface LinkHistory {
  id: string;
  originalUrl: string;
  proxyUrl: string;
  timestamp: string;
  service: string;
}

const STORAGE_KEY = "anon_link_history";

const AnonymousLinkOpener = () => {
  const [url, setUrl] = useState("");
  const [isValidUrl, setIsValidUrl] = useState(false);
  const [linkHistory, setLinkHistory] = useState<LinkHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const proxyServices: ProxyService[] = [
    {
      name: "ProxySite.com",
      url: "https://www.proxysite.com/home.php",
      description: "Fast and reliable web proxy with SSL support",
      features: ["SSL Encryption", "Fast Loading", "No Registration", "Mobile Friendly"],
      isRecommended: true,
      paramMode: true
    },
    {
      name: "Hide.me",
      url: "https://hide.me/en/proxy",
      description: "Secure proxy service with advanced privacy features",
      features: ["Military-grade Encryption", "No Logs", "Multiple Locations", "Ad Blocking"],
      isRecommended: true,
      paramMode: true
    },
    {
      name: "KProxy",
      url: "https://kproxy.com/",
      description: "Free proxy service with browser extension support",
      features: ["Free Service", "Browser Extension", "Multiple Servers", "Easy to Use"],
      isRecommended: false,
    },
    {
      name: "Hidester",
      url: "https://hidester.com/proxy/",
      description: "Simple and fast anonymous browsing proxy",
      features: ["Simple Interface", "Fast Speed", "No Registration", "HTTPS Support"],
      isRecommended: false,
      paramMode: true
    },
    {
      name: "ProxyNova",
      url: "https://www.proxynova.com/proxy/",
      description: "Free proxy list with multiple server locations",
      features: ["Free Service", "Multiple Locations", "Regular Updates", "Speed Testing"],
      isRecommended: false
    },
    {
      name: "Anonymouse",
      url: "https://anonymouse.org/cgi-bin/anon-www.cgi/",
      description: "Anonymous surfing service with email protection",
      features: ["Email Protection", "Anonymous Surfing", "No Registration", "Privacy Focused"],
      isRecommended: false
    }
  ];

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setLinkHistory(JSON.parse(saved));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(linkHistory));
  }, [linkHistory]);

  const normalizeUrl = (inputUrl: string) => {
    try {
      let finalUrl = inputUrl.trim();
      if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = "https://" + finalUrl;
      }
      const urlObj = new URL(finalUrl);
      return urlObj.href;
    } catch {
      return null;
    }
  };

  const handleUrlChange = (inputUrl: string) => {
    setUrl(inputUrl);
    setIsValidUrl(!!normalizeUrl(inputUrl));
  };

  const buildProxyUrl = (service: ProxyService, target: string) => {
    return service.paramMode 
      ? `${service.url}?u=${encodeURIComponent(target)}`
      : `${service.url}${target}`;
  };

  const openWithProxy = (service: ProxyService) => {
    const normalized = normalizeUrl(url);
    if (!normalized) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      return;
    }

    const proxyUrl = buildProxyUrl(service, normalized);

    const newHistory: LinkHistory = {
      id: Date.now().toString(),
      originalUrl: normalized,
      proxyUrl,
      timestamp: new Date().toLocaleString(),
      service: service.name
    };

    setLinkHistory(prev => [newHistory, ...prev.slice(0, 9)]);
    window.open(proxyUrl, "_blank");

    toast({
      title: "Opening anonymously",
      description: `Opening ${normalized} through ${service.name}`,
    });
  };

  const copyProxyUrl = (service: ProxyService) => {
    const normalized = normalizeUrl(url);
    if (!normalized) return;

    const proxyUrl = buildProxyUrl(service, normalized);
    navigator.clipboard.writeText(proxyUrl);

    toast({
      title: "Copied",
      description: "Proxy URL copied to clipboard",
    });
  };

  const removeFromHistory = (id: string) => {
    setLinkHistory(prev => prev.filter(item => item.id !== id));
  };

  const clearHistory = () => {
    setLinkHistory([]);
    toast({
      title: "History cleared",
      description: "All link history has been cleared",
    });
  };

  const getUrlDomain = (link: string) => {
    try {
      return new URL(link).hostname;
    } catch {
      return link;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
    

      {/* URL Input */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="h-5 w-5" /> Enter URL
          </CardTitle>
          <CardDescription>Enter the site you want to visit anonymously</CardDescription>
        </CardHeader>
        <CardContent>
          <Label htmlFor="url">Website URL</Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="url"
              type="text"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="flex-1"
            />
            {url && (
              <Button variant="outline" size="icon" onClick={() => setUrl("")}>
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          {url && (
            <div className="mt-2 flex items-center gap-2">
              {isValidUrl ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">Valid URL</span>
                  <Badge variant="outline">{getUrlDomain(normalizeUrl(url) || url)}</Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-red-600">Invalid URL</span>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Proxy Services */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Choose Proxy Service
          </CardTitle>
          <CardDescription>Select a service to open your link</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {proxyServices.map((service) => (
            <div key={service.name} className="border rounded-lg p-4 flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{service.name}</h3>
                  {service.isRecommended && <Badge>Recommended</Badge>}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                <div className="flex flex-wrap gap-1">
                  {service.features.map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{f}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <Button onClick={() => openWithProxy(service)} disabled={!isValidUrl}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Open
                </Button>
                <Button variant="outline" size="sm" disabled={!isValidUrl} onClick={() => copyProxyUrl(service)}>
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* History */}
      {linkHistory.length > 0 && (
        <Card className="mb-6">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" /> Recent Links
            </CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showHistory ? "Hide" : "Show"}
              </Button>
              <Button size="sm" variant="outline" onClick={clearHistory}>
                <Trash2 className="h-4 w-4" /> Clear
              </Button>
            </div>
          </CardHeader>
          {showHistory && (
            <CardContent className="space-y-3">
              {linkHistory.map(item => (
                <div key={item.id} className="flex justify-between items-center border rounded-lg p-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium truncate">{getUrlDomain(item.originalUrl)}</span>
                      <Badge variant="outline">{item.service}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{item.originalUrl}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button variant="outline" size="sm" onClick={() => window.open(item.proxyUrl, "_blank")}>
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(item.proxyUrl)}>
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => removeFromHistory(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      )}

      {/* Security Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" /> Security Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Use proxies for casual browsing only</li>
            <li>• Avoid logging into accounts via proxies</li>
            <li>• Clear cookies after use</li>
            <li>• For maximum privacy, use VPN or Tor</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnonymousLinkOpener;
