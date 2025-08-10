import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { 
  Send, 
  Clock, 
  Code, 
  Copy, 
  Download,
  Settings,
  Eye,
  EyeOff,
  History,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface RequestHistory {
  id: string;
  method: string;
  url: string;
  timestamp: Date;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: string;
}

const APITester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState<Record<string, string>>({});
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [showHeaders, setShowHeaders] = useState(false);
  const [history, setHistory] = useState<RequestHistory[]>([]);
  const [activeTab, setActiveTab] = useState("params");
  const { toast } = useToast();

  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"];

  const addHeader = () => {
    const key = prompt("Enter header key:");
    const value = prompt("Enter header value:");
    if (key && value) {
      setHeaders(prev => ({ ...prev, [key]: value }));
    }
  };

  const removeHeader = (key: string) => {
    setHeaders(prev => {
      const newHeaders = { ...prev };
      delete newHeaders[key];
      return newHeaders;
    });
  };

  const addToHistory = (method: string, url: string) => {
    const newHistory: RequestHistory = {
      id: Date.now().toString(),
      method,
      url,
      timestamp: new Date()
    };
    setHistory(prev => [newHistory, ...prev.slice(0, 9)]); // Keep last 10
  };

  const loadFromHistory = (item: RequestHistory) => {
    setMethod(item.method);
    setUrl(item.url);
    toast({
      title: "Request loaded",
      description: `Loaded ${item.method} ${item.url}`,
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "History cleared",
      description: "All request history has been cleared",
    });
  };

  const sendRequest = async () => {
    if (!url.trim()) {
      toast({
        title: "URL required",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const requestOptions: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers
        }
      };

      if (["POST", "PUT", "PATCH"].includes(method) && body.trim()) {
        try {
          requestOptions.body = body;
        } catch (error) {
          toast({
            title: "Invalid JSON",
            description: "Please check your request body format",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }
      }

      const response = await fetch(url, requestOptions);
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      let responseData;
      const contentType = response.headers.get("content-type");
      
      if (contentType?.includes("application/json")) {
        responseData = await response.json();
      } else if (contentType?.includes("text/")) {
        responseData = await response.text();
      } else {
        responseData = await response.blob();
      }

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const responseSize = JSON.stringify(responseData).length;

      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: responseData,
        time: responseTime,
        size: `${(responseSize / 1024).toFixed(2)} KB`
      });

      addToHistory(method, url);
      
      toast({
        title: "Request completed",
        description: `${method} ${url} - ${response.status} ${response.statusText}`,
      });

    } catch (error) {
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyResponse = () => {
    if (response) {
      const responseText = JSON.stringify(response.data, null, 2);
      navigator.clipboard.writeText(responseText);
      toast({
        title: "Copied to clipboard",
        description: "Response data copied to clipboard",
      });
    }
  };

  const downloadResponse = () => {
    if (response) {
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "api-response.json";
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "bg-green-100 text-green-800";
    if (status >= 300 && status < 400) return "bg-blue-100 text-blue-800";
    if (status >= 400 && status < 500) return "bg-yellow-100 text-yellow-800";
    if (status >= 500) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Request Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            API Request
          </CardTitle>
          <CardDescription>
            Test REST API endpoints with custom headers and body
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Method and URL */}
          <div className="flex gap-2">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {methods.map(m => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="https://api.example.com/endpoint"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button onClick={sendRequest} disabled={isLoading}>
              {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send
            </Button>
          </div>

          {/* Tabs for Headers, Body, etc. */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="params">Headers</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="params" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Request Headers</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    Add Header
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowHeaders(!showHeaders)}
                  >
                    {showHeaders ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {showHeaders ? "Hide" : "Show"}
                  </Button>
                </div>
              </div>
              
              {showHeaders && (
                <div className="space-y-2">
                  {Object.entries(headers).map(([key, value]) => (
                    <div key={key} className="flex gap-2">
                      <Input
                        placeholder="Header key"
                        value={key}
                        onChange={(e) => setHeaders(prev => ({ ...prev, [e.target.value]: value }))}
                        className="w-1/3"
                      />
                      <Input
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => setHeaders(prev => ({ ...prev, [key]: e.target.value }))}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHeader(key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {Object.keys(headers).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No custom headers added
                    </p>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <Label>Request Body (JSON)</Label>
              <Textarea
                placeholder='{"key": "value"}'
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={6}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Only applicable for POST, PUT, and PATCH requests
              </p>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Request History</Label>
                <Button variant="outline" size="sm" onClick={clearHistory}>
                  Clear History
                </Button>
              </div>
              
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                    onClick={() => loadFromHistory(item)}
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.method}</Badge>
                      <span className="text-sm font-mono truncate max-w-64">{item.url}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {item.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                ))}
                {history.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No request history yet
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Response Section */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Response
            </CardTitle>
            <div className="flex items-center gap-4">
              <Badge className={getStatusColor(response.status)}>
                {response.status} {response.statusText}
              </Badge>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {response.time}ms
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Download className="h-4 w-4" />
                {response.size}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response Headers */}
            <div>
              <Label className="text-sm font-medium">Response Headers</Label>
              <div className="mt-2 p-3 bg-muted rounded-lg max-h-32 overflow-y-auto">
                {Object.entries(response.headers).map(([key, value]) => (
                  <div key={key} className="text-sm font-mono">
                    <span className="text-blue-600">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Response Body */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-medium">Response Body</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={copyResponse}>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={downloadResponse}>
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-lg max-h-96 overflow-y-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap">
                  {JSON.stringify(response.data, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default APITester;
