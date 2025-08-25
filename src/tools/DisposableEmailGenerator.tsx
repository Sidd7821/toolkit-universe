import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  Copy, 
  RefreshCw, 
  Shield, 
  Clock, 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmailProvider {
  name: string;
  domain: string;
  description: string;
  features: string[];
  reliability: 'high' | 'medium' | 'low';
}

const DisposableEmailGenerator = () => {
  const { toast } = useToast();
  const [generatedEmail, setGeneratedEmail] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [customUsername, setCustomUsername] = useState("");
  const [emailHistory, setEmailHistory] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const emailProviders: EmailProvider[] = [
    {
      name: "10 Minute Mail",
      domain: "10minutemail.com",
      description: "Temporary email that expires in 10 minutes",
      features: ["10 minute expiry", "No registration", "Instant access"],
      reliability: "high"
    },
    {
      name: "Guerrilla Mail",
      domain: "guerrillamail.com",
      description: "Disposable email with 1 hour expiry",
      features: ["1 hour expiry", "Multiple domains", "Spam protection"],
      reliability: "high"
    },
    {
      name: "Temp Mail",
      domain: "temp-mail.org",
      description: "Temporary email service with 24 hour expiry",
      features: ["24 hour expiry", "Multiple domains", "Easy to use"],
      reliability: "medium"
    },
    {
      name: "Mailinator",
      domain: "mailinator.com",
      description: "Public email inboxes for testing",
      features: ["Public inboxes", "No registration", "Instant access"],
      reliability: "medium"
    },
    {
      name: "YOPmail",
      domain: "yopmail.com",
      description: "Temporary email with custom username",
      features: ["Custom usernames", "No expiry", "Multiple domains"],
      reliability: "low"
    }
  ];

  const generateRandomUsername = () => {
    const adjectives = ['quick', 'fast', 'smart', 'clever', 'bright', 'swift', 'rapid', 'agile'];
    const nouns = ['fox', 'cat', 'dog', 'bird', 'fish', 'bear', 'wolf', 'eagle'];
    const numbers = Math.floor(Math.random() * 9999);
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}${numbers}`;
  };

  const generateEmail = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      const provider = emailProviders.find(p => p.name === selectedProvider);
      if (!provider) return;

      const username = customUsername || generateRandomUsername();
      const email = `${username}@${provider.domain}`;
      
      setGeneratedEmail(email);
      
      // Add to history
      if (!emailHistory.includes(email)) {
        setEmailHistory(prev => [email, ...prev.slice(0, 9)]);
      }
      
      setIsGenerating(false);
      
      toast({
        title: "Email Generated!",
        description: `Your temporary email is ready: ${email}`,
      });
    }, 1000);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Email address copied to clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const clearHistory = () => {
    setEmailHistory([]);
    toast({
      title: "History Cleared",
      description: "Email history has been cleared",
    });
  };

  const openProviderWebsite = (provider: EmailProvider) => {
    const url = `https://${provider.domain}`;
    window.open(url, '_blank');
  };

  useEffect(() => {
    if (emailProviders.length > 0) {
      setSelectedProvider(emailProviders[0].name);
    }
  }, []);

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Email Generation */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Generate Disposable Email
              </CardTitle>
              <CardDescription>
                Create temporary email addresses for testing, registration, or privacy protection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="provider-select">Email Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {emailProviders.map((provider) => (
                      <SelectItem key={provider.name} value={provider.name}>
                        <div className="flex items-center gap-2">
                          <span>{provider.name}</span>
                          <Badge className={getReliabilityColor(provider.reliability)}>
                            {provider.reliability}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-username">Custom Username (Optional)</Label>
                <Input
                  id="custom-username"
                  placeholder="Leave empty for random username"
                  value={customUsername}
                  onChange={(e) => setCustomUsername(e.target.value)}
                />
              </div>

              <Button 
                onClick={generateEmail} 
                disabled={isGenerating || !selectedProvider}
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Generate Email
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Generated Email Display */}
          {generatedEmail && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Your Temporary Email
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-lg break-all">{generatedEmail}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedEmail)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>This email will expire based on provider settings</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email History */}
          {emailHistory.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Emails
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearHistory}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {emailHistory.map((email, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-mono text-sm break-all">{email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(email)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Provider Info & Features */}
        <div className="space-y-6">
          {/* Selected Provider Info */}
          {selectedProvider && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Provider Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const provider = emailProviders.find(p => p.name === selectedProvider);
                  if (!provider) return null;
                  
                  return (
                    <>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{provider.name}</span>
                          <Badge className={getReliabilityColor(provider.reliability)}>
                            {provider.reliability} reliability
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{provider.description}</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Features:</Label>
                        <div className="flex flex-wrap gap-2">
                          {provider.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => openProviderWebsite(provider)}
                        className="w-full"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit {provider.name}
                      </Button>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          )}

          {/* How It Works */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Select an email provider from the list above</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Optionally enter a custom username or use the random generator</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Click generate to create your temporary email address</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Use the email for testing or temporary registrations</p>
              </div>
            </CardContent>
          </Card>

          {/* Privacy Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Privacy & Security Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Use for testing websites and services</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Protect your real email from spam</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p>Don't use for important accounts or banking</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                <p>Never send sensitive information to temporary emails</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DisposableEmailGenerator;
