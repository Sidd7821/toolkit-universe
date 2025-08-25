import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileText, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  Info,
  Download,
  Copy,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  name: string;
  description: string;
  protectionLevel: string;
  group: string;
  isDangerous: boolean;
}

interface AppInfo {
  packageName: string;
  appName: string;
  version: string;
  permissions: Permission[];
  requestedPermissions: string[];
}

const AndroidPermissionChecker = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Sample permissions database
  const permissionsDatabase: Record<string, Permission> = {
    "android.permission.INTERNET": {
      name: "Internet",
      description: "Allows the app to access the internet",
      protectionLevel: "normal",
      group: "Network",
      isDangerous: false
    },
    "android.permission.CAMERA": {
      name: "Camera",
      description: "Allows the app to take pictures and record video",
      protectionLevel: "dangerous",
      group: "Hardware",
      isDangerous: true
    },
    "android.permission.READ_CONTACTS": {
      name: "Read Contacts",
      description: "Allows the app to read your contacts",
      protectionLevel: "dangerous",
      group: "Personal",
      isDangerous: true
    },
    "android.permission.WRITE_CONTACTS": {
      name: "Write Contacts",
      description: "Allows the app to write to your contacts",
      protectionLevel: "dangerous",
      group: "Personal",
      isDangerous: true
    },
    "android.permission.READ_CALENDAR": {
      name: "Read Calendar",
      description: "Allows the app to read your calendar events",
      protectionLevel: "dangerous",
      group: "Personal",
      isDangerous: true
    },
    "android.permission.WRITE_CALENDAR": {
      name: "Write Calendar",
      description: "Allows the app to write to your calendar",
      protectionLevel: "dangerous",
      group: "Personal",
      isDangerous: true
    },
    "android.permission.ACCESS_FINE_LOCATION": {
      name: "Precise Location",
      description: "Allows the app to get your precise location",
      protectionLevel: "dangerous",
      group: "Location",
      isDangerous: true
    },
    "android.permission.ACCESS_COARSE_LOCATION": {
      name: "Approximate Location",
      description: "Allows the app to get your approximate location",
      protectionLevel: "dangerous",
      group: "Location",
      isDangerous: true
    },
    "android.permission.RECORD_AUDIO": {
      name: "Record Audio",
      description: "Allows the app to record audio",
      protectionLevel: "dangerous",
      group: "Hardware",
      isDangerous: true
    },
    "android.permission.READ_PHONE_STATE": {
      name: "Read Phone State",
      description: "Allows the app to read phone state information",
      protectionLevel: "dangerous",
      group: "Phone",
      isDangerous: true
    },
    "android.permission.CALL_PHONE": {
      name: "Make Phone Calls",
      description: "Allows the app to make phone calls",
      protectionLevel: "dangerous",
      group: "Phone",
      isDangerous: true
    },
    "android.permission.READ_SMS": {
      name: "Read SMS",
      description: "Allows the app to read your SMS messages",
      protectionLevel: "dangerous",
      group: "SMS",
      isDangerous: true
    },
    "android.permission.SEND_SMS": {
      name: "Send SMS",
      description: "Allows the app to send SMS messages",
      protectionLevel: "dangerous",
      group: "SMS",
      isDangerous: true
    },
    "android.permission.READ_EXTERNAL_STORAGE": {
      name: "Read External Storage",
      description: "Allows the app to read files on your device",
      protectionLevel: "dangerous",
      group: "Storage",
      isDangerous: true
    },
    "android.permission.WRITE_EXTERNAL_STORAGE": {
      name: "Write External Storage",
      description: "Allows the app to write files to your device",
      protectionLevel: "dangerous",
      group: "Storage",
      isDangerous: true
    },
    "android.permission.ACCESS_NETWORK_STATE": {
      name: "Access Network State",
      description: "Allows the app to check network connectivity",
      protectionLevel: "normal",
      group: "Network",
      isDangerous: false
    },
    "android.permission.WAKE_LOCK": {
      name: "Keep Awake",
      description: "Allows the app to keep the device awake",
      protectionLevel: "normal",
      group: "System",
      isDangerous: false
    },
    "android.permission.VIBRATE": {
      name: "Vibrate",
      description: "Allows the app to control vibration",
      protectionLevel: "normal",
      group: "Hardware",
      isDangerous: false
    },
    "android.permission.ACCESS_WIFI_STATE": {
      name: "Access WiFi State",
      description: "Allows the app to view WiFi connections",
      protectionLevel: "normal",
      group: "Network",
      isDangerous: false
    },
    "android.permission.BLUETOOTH": {
      name: "Bluetooth",
      description: "Allows the app to connect to Bluetooth devices",
      protectionLevel: "dangerous",
      group: "Hardware",
      isDangerous: true
    },
    "android.permission.BLUETOOTH_ADMIN": {
      name: "Bluetooth Admin",
      description: "Allows the app to discover and pair Bluetooth devices",
      protectionLevel: "dangerous",
      group: "Hardware",
      isDangerous: true
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.apk')) {
      setFile(selectedFile);
      setAppInfo(null);
    } else {
      toast({
        title: "Invalid file",
        description: "Please select a valid APK file",
        variant: "destructive"
      });
    }
  };

  const analyzeAPK = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    
    // Simulate APK analysis
    setTimeout(() => {
      const mockAppInfo: AppInfo = {
        packageName: "com.example.sampleapp",
        appName: "Sample App",
        version: "1.0.0",
        permissions: [],
        requestedPermissions: [
          "android.permission.INTERNET",
          "android.permission.CAMERA",
          "android.permission.READ_CONTACTS",
          "android.permission.ACCESS_FINE_LOCATION",
          "android.permission.RECORD_AUDIO",
          "android.permission.READ_EXTERNAL_STORAGE",
          "android.permission.ACCESS_NETWORK_STATE",
          "android.permission.WAKE_LOCK"
        ]
      };

      // Map requested permissions to full permission objects
      mockAppInfo.permissions = mockAppInfo.requestedPermissions
        .map(perm => permissionsDatabase[perm])
        .filter(Boolean);

      setAppInfo(mockAppInfo);
      setIsAnalyzing(false);
      
      toast({
        title: "Analysis complete",
        description: `Found ${mockAppInfo.permissions.length} permissions in the APK`,
      });
    }, 2000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Permission information copied to clipboard",
    });
  };

  const getFilteredPermissions = () => {
    if (!appInfo) return [];
    
    let filtered = appInfo.permissions;
    
    if (searchTerm) {
      filtered = filtered.filter(perm => 
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterLevel !== "all") {
      filtered = filtered.filter(perm => 
        filterLevel === "dangerous" ? perm.isDangerous : !perm.isDangerous
      );
    }
    
    return filtered;
  };

  const getPermissionStats = () => {
    if (!appInfo) return { total: 0, dangerous: 0, normal: 0 };
    
    const dangerous = appInfo.permissions.filter(p => p.isDangerous).length;
    const normal = appInfo.permissions.filter(p => !p.isDangerous).length;
    
    return {
      total: appInfo.permissions.length,
      dangerous,
      normal
    };
  };

  const stats = getPermissionStats();
  const filteredPermissions = getFilteredPermissions();

  return (
    <div className="container mx-auto p-6 max-w-6xl">
     

      <div className="grid gap-6">
        {/* File Upload Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload APK File
            </CardTitle>
            <CardDescription>
              Select an APK file to analyze its permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isAnalyzing}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Choose APK File
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".apk"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                {file && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                )}
              </div>
              
              {file && (
                <Button 
                  onClick={analyzeAPK}
                  disabled={isAnalyzing}
                  className="w-full"
                >
                  {isAnalyzing ? "Analyzing..." : "Analyze Permissions"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Section */}
        {appInfo && (
          <>
            {/* App Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  App Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-sm font-medium">App Name</Label>
                    <p className="text-lg font-semibold">{appInfo.appName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Package Name</Label>
                    <p className="text-sm font-mono bg-muted p-2 rounded">{appInfo.packageName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Version</Label>
                    <p className="text-lg">{appInfo.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permission Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Permission Statistics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                    <div className="text-sm text-muted-foreground">Total Permissions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats.dangerous}</div>
                    <div className="text-sm text-muted-foreground">Dangerous Permissions</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats.normal}</div>
                    <div className="text-sm text-muted-foreground">Normal Permissions</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Permissions List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Requested Permissions
                </CardTitle>
                <CardDescription>
                  Detailed list of all permissions requested by this app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <Label htmlFor="search">Search Permissions</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="search"
                          placeholder="Search by name or description..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="sm:w-48">
                      <Label htmlFor="filter">Filter by Level</Label>
                      <select
                        id="filter"
                        value={filterLevel}
                        onChange={(e) => setFilterLevel(e.target.value)}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="all">All Permissions</option>
                        <option value="dangerous">Dangerous Only</option>
                        <option value="normal">Normal Only</option>
                      </select>
                    </div>
                  </div>

                  <Separator />

                  {/* Permissions List */}
                  <div className="space-y-3">
                    {filteredPermissions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No permissions found matching your criteria
                      </div>
                    ) : (
                      filteredPermissions.map((permission, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">{permission.name}</h3>
                                <Badge variant={permission.isDangerous ? "destructive" : "secondary"}>
                                  {permission.protectionLevel}
                                </Badge>
                                {permission.isDangerous && (
                                  <AlertTriangle className="h-4 w-4 text-red-500" />
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {permission.description}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>Group: {permission.group}</span>
                                <span>•</span>
                                <span>Protection: {permission.protectionLevel}</span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(`${permission.name}: ${permission.description}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Security Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.dangerous > 0 ? (
                    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-red-800">High Risk Permissions Detected</h4>
                        <p className="text-sm text-red-700">
                          This app requests {stats.dangerous} dangerous permissions. Review each permission carefully before installing.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Good Security Profile</h4>
                        <p className="text-sm text-green-700">
                          This app only requests normal permissions and poses minimal security risk.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Tip:</strong> Always review app permissions before installation. Only grant permissions that are necessary for the app's core functionality.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default AndroidPermissionChecker;
