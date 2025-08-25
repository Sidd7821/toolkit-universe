import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Search,
  Package,
  ExternalLink,
  Copy,
  Info,
  AlertTriangle,
  CheckCircle,
  Star,
  Globe,
  Shield
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppInfo {
  id: string;
  name: string;
  packageName: string;
  version: string;
  size: string;
  rating: number;
  downloads: string;
  description: string;
  developer: string;
  category: string;
}

interface DownloadSource {
  name: string;
  url: string;
  description: string;
  isRecommended: boolean;
}

const APKDownloader = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<AppInfo[]>([]);
  const { toast } = useToast();

  // Trusted APK Sources
  const downloadSources: DownloadSource[] = [
    {
      name: "APKMirror",
      url: "https://apkmirror.com/",
      description: "Trusted source for verified APK files",
      isRecommended: true
    },
    {
      name: "APKPure",
      url: "https://apkpure.com/",
      description: "Popular APK download platform",
      isRecommended: true
    },
    {
      name: "F-Droid",
      url: "https://f-droid.org/",
      description: "Free and open-source app repository",
      isRecommended: false
    }
  ];

  // Fallback mock apps
  const mockApps: AppInfo[] = [
    {
      id: "1",
      name: "WhatsApp Messenger",
      packageName: "com.whatsapp",
      version: "2.24.8.78",
      size: "45.2 MB",
      rating: 4.5,
      downloads: "5B+",
      description:
        "WhatsApp Messenger is a FREE messaging app available for Android and other smartphones.",
      developer: "WhatsApp LLC",
      category: "Communication"
    },
    {
      id: "2",
      name: "Instagram",
      packageName: "com.instagram.android",
      version: "302.0.0.45.119",
      size: "52.8 MB",
      rating: 4.3,
      downloads: "1B+",
      description:
        "Instagram is a free photo and video sharing app available on iPhone and Android.",
      developer: "Meta Platforms, Inc.",
      category: "Social"
    }
  ];

  // API: RapidAPI Google Play Store Scraper
  const searchApps = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Search query required",
        description: "Please enter an app name to search for",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://google-play-scraper.p.rapidapi.com/api/apps?term=${encodeURIComponent(
          searchQuery
        )}&num=5`,
        {
          method: "GET",
          headers: {
            "X-RapidAPI-Key": "YOUR_RAPIDAPI_KEY_HERE", // 🔑 Replace with your key
            "X-RapidAPI-Host": "google-play-scraper.p.rapidapi.com"
          }
        }
      );

      if (!res.ok) throw new Error("API error");

      const data = await res.json();

      if (data && data.length > 0) {
        const formatted: AppInfo[] = data.map((app: any, index: number) => ({
          id: app.appId || index.toString(),
          name: app.title || "Unknown",
          packageName: app.appId || "N/A",
          version: app.version || "Latest",
          size: app.size || "Unknown",
          rating: app.score || 0,
          downloads: app.installs || "N/A",
          description: app.description || "No description available",
          developer: app.developer || "Unknown",
          category: app.genre || "General"
        }));

        setSearchResults(formatted);
      } else {
        setSearchResults([]);
        toast({
          title: "No Results",
          description: "No apps found. Showing mock data instead."
        });
        setSearchResults(mockApps);
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "API Error",
        description: "Failed to fetch apps. Showing mock results.",
        variant: "destructive"
      });
      setSearchResults(mockApps);
    }
    setIsSearching(false);
  };

  const downloadAPK = (app: AppInfo, source: DownloadSource) => {
    window.open(source.url, "_blank");

    toast({
      title: "Download started",
      description: `Opening ${app.name} download page on ${source.name}`
    });
  };

  const copyPackageName = (packageName: string) => {
    navigator.clipboard.writeText(packageName);
    toast({
      title: "Copied",
      description: "Package name copied to clipboard"
    });
  };

  const getRatingStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    }

    const emptyStars = 5 - fullStars;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }

    return stars;
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">   

      <div className="grid gap-6">
        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for Apps
            </CardTitle>
            <CardDescription>
              Search for Android apps by name or package name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for apps (e.g., WhatsApp, Instagram)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && searchApps()}
                  className="flex-1"
                />
                <Button onClick={searchApps} disabled={isSearching}>
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Search Results ({searchResults.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {searchResults.map((app) => (
                  <div
                    key={app.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">📱</div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {app.name}
                            </h3>
                            <p className="text-sm text-muted-foreground font-mono">
                              {app.packageName}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {getRatingStars(app.rating)}
                            <span className="text-sm text-muted-foreground ml-1">
                              ({app.rating})
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Version:
                            </span>
                            <p className="font-medium">{app.version}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Size:</span>
                            <p className="font-medium">{app.size}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Downloads:
                            </span>
                            <p className="font-medium">{app.downloads}</p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Category:
                            </span>
                            <p className="font-medium">{app.category}</p>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">
                          {app.description}
                        </p>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="outline">{app.developer}</Badge>
                          <Badge variant="secondary">{app.category}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyPackageName(app.packageName)}
                          >
                            <Copy className="h-4 w-4 mr-1" />
                            Copy Package
                          </Button>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => downloadAPK(app, downloadSources[0])}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download APK
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Download Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Trusted Download Sources
            </CardTitle>
            <CardDescription>
              These are reliable sources for downloading APK files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {downloadSources.map((source, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{source.name}</h3>
                        {source.isRecommended && (
                          <Badge variant="default" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {source.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.open(source.url, "_blank")}
                      className="ml-4"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Visit
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Safety Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-800">
                    Downloading APKs Safely
                  </h4>
                  <p className="text-sm text-blue-700">
                    Always download APK files from trusted sources and verify
                    the app before installation. Enable "Install from Unknown
                    Sources" in your Android settings to install APK files.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Safe Practices
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Download from trusted sources only</li>
                    <li>• Check app permissions before installing</li>
                    <li>• Verify app developer information</li>
                    <li>• Read user reviews and ratings</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    Warning Signs
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Apps requesting unnecessary permissions</li>
                    <li>• Apps from unknown developers</li>
                    <li>• Apps with poor ratings and reviews</li>
                    <li>• Apps that seem too good to be true</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default APKDownloader;
