import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Copy, 
  Download, 
  Sparkles,
  Target,
  Star,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface AppInfo {
  name: string;
  category: string;
  targetAudience: string;
  keyFeatures: string[];
  benefits: string[];
  tone: string;
  platform: 'ios' | 'android' | 'both';
}

interface GeneratedDescription {
  shortDescription: string;
  fullDescription: string;
  keywords: string[];
  characterCount: number;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";
const MODEL_PRIORITY = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

const AppStoreDescriptionGenerator = () => {
  const [appInfo, setAppInfo] = useState<AppInfo>({
    name: "",
    category: "",
    targetAudience: "",
    keyFeatures: [],
    benefits: [],
    tone: "professional",
    platform: "both"
  });
  const [generatedDescription, setGeneratedDescription] = useState<GeneratedDescription | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

const categories = [
    "Games", "Productivity", "Social Networking", "Entertainment", "Education",
    "Health & Fitness", "Travel", "Shopping", "Finance", "Music", "Photo & Video",
    "Sports", "News", "Weather", "Utilities", "Lifestyle", "Medical", "Food & Drink"
  ];

  const tones = [
    { value: "professional", label: "Professional" },
    { value: "friendly", label: "Friendly & Casual" },
    { value: "enthusiastic", label: "Enthusiastic" },
    { value: "technical", label: "Technical" },
    { value: "luxury", label: "Premium/Luxury" }
  ];

  const commonFeatures = [
    "User-friendly interface", "Offline functionality", "Cloud sync", "Dark mode",
    "Customizable settings", "Real-time updates", "Push notifications", "Social sharing",
    "Data backup", "Multi-language support", "Accessibility features", "Cross-platform sync"
  ];

  const commonBenefits = [
    "Save time", "Increase productivity", "Stay organized", "Connect with others",
    "Learn new skills", "Improve health", "Save money", "Entertain yourself",
    "Stay informed", "Make better decisions", "Reduce stress", "Achieve goals"
  ];

  const handleFeatureToggle = (feature: string) => {
    setAppInfo(prev => ({
      ...prev,
      keyFeatures: prev.keyFeatures.includes(feature)
        ? prev.keyFeatures.filter(f => f !== feature)
        : [...prev.keyFeatures, feature]
    }));
  };

  const handleBenefitToggle = (benefit: string) => {
    setAppInfo(prev => ({
      ...prev,
      benefits: prev.benefits.includes(benefit)
        ? prev.benefits.filter(b => b !== benefit)
        : [...prev.benefits, benefit]
    }));
  };

  const createDescriptionPrompt = (appInfo: AppInfo): string => {
    return `Generate an app store description for an app with the following details:

App Name: ${appInfo.name}
Category: ${appInfo.category}
Target Audience: ${appInfo.targetAudience}
Key Features: ${appInfo.keyFeatures.join(', ')}
Benefits: ${appInfo.benefits.join(', ')}
Tone: ${appInfo.tone}
Platform: ${appInfo.platform}

Requirements:
- Short description: Exactly one sentence, max 255 characters, summarizing the app's purpose and key benefits
- Full description: 500-1000 characters, including:
  - Engaging opening statement
  - List of key features (use • for bullet points)
  - List of benefits (use • for bullet points)
  - Technical highlights
  - Call to action for download
  - Platform availability
- Keywords: 5-10 relevant keywords for app store optimization
- Use the specified tone
- Avoid markdown symbols (**, *, etc.)
- Return in this exact format:
Short Description: [Your short description here]
---
Full Description: [Your full description here]
---
Keywords: [keyword1,keyword2,keyword3,...]
`;
  };

  const generateFallbackShortDescription = (appInfo: AppInfo): string => {
    const base = `${appInfo.name} enhances your ${appInfo.category.toLowerCase()} experience with ${appInfo.keyFeatures.slice(0, 2).join(" and ").toLowerCase()} for ${appInfo.targetAudience.toLowerCase()}.`;
    return base.length > 255 ? base.substring(0, 252) + "..." : base;
  };

  const generateDescription = async () => {
    if (!appInfo.name || !appInfo.category || !appInfo.targetAudience) {
      toast({
        title: "Missing Information",
        description: "Please fill in the app name, category, and target audience",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      let result = null;
      let currentModel = "";

      for (const modelName of MODEL_PRIORITY) {
        try {
          const genAI = new GoogleGenerativeAI(DEFAULT_API_KEY);
          currentModel = modelName;
          const model = genAI.getGenerativeModel({ model: modelName });

          const prompt = createDescriptionPrompt(appInfo);
          result = await model.generateContent(prompt);
          break;
        } catch (error) {
          console.warn(`Model ${modelName} failed, trying next model...`);
          continue;
        }
      }

      if (!result) {
        throw new Error("All models failed to generate content");
      }

      const response = await result.response;
      const text = response.text();
      
      // Parse the response
      const [shortDescSection, fullDescSection, keywordsSection] = text.split('---').map(s => s.trim());
      
      // Extract sections with fallback
      let shortDescription = shortDescSection.startsWith('Short Description:') 
        ? shortDescSection.replace('Short Description:', '').trim()
        : generateFallbackShortDescription(appInfo);
      
      // Ensure short description is within 255 characters
      if (shortDescription.length > 255) {
        shortDescription = shortDescription.substring(0, 252) + "...";
      }

      const fullDescription = fullDescSection.startsWith('Full Description:') 
        ? fullDescSection.replace('Full Description:', '').trim()
        : `Welcome to ${appInfo.name}, the ultimate ${appInfo.category.toLowerCase()} app for ${appInfo.targetAudience.toLowerCase()}.\n\nKey Features:\n${appInfo.keyFeatures.map(f => `• ${f}`).join('\n')}\n\nBenefits:\n${appInfo.benefits.map(b => `• ${b}`).join('\n')}\n\nTechnical Highlights:\n• Optimized performance\n• Regular updates\n• Secure and private\n\nDownload ${appInfo.name} on ${appInfo.platform === 'both' ? 'iOS and Android' : appInfo.platform} today!`;

      const keywords = keywordsSection.startsWith('Keywords:') 
        ? keywordsSection.replace('Keywords:', '').split(',').map(k => k.trim()).slice(0, 10)
        : [
            appInfo.name.toLowerCase(),
            appInfo.category.toLowerCase(),
            ...appInfo.keyFeatures.slice(0, 4).map(f => f.toLowerCase()),
            ...appInfo.benefits.slice(0, 4).map(b => b.toLowerCase())
          ].flat().filter((word, index, arr) => arr.indexOf(word) === index).slice(0, 10);

      setGeneratedDescription({
        shortDescription,
        fullDescription,
        keywords,
        characterCount: fullDescription.length
      });

      toast({
        title: "Success!",
        description: `App store description generated using ${currentModel}`,
      });
    } catch (error) {
      // Fallback to local generation if AI fails completely
      const fallbackShortDesc = generateFallbackShortDescription(appInfo);
      const fallbackFullDesc = `Welcome to ${appInfo.name}, the ultimate ${appInfo.category.toLowerCase()} app for ${appInfo.targetAudience.toLowerCase()}.\n\nKey Features:\n${appInfo.keyFeatures.map(f => `• ${f}`).join('\n')}\n\nBenefits:\n${appInfo.benefits.map(b => `• ${b}`).join('\n')}\n\nTechnical Highlights:\n• Optimized performance\n• Regular updates\n• Secure and private\n\nDownload ${appInfo.name} on ${appInfo.platform === 'both' ? 'iOS and Android' : appInfo.platform} today!`;
      const fallbackKeywords = [
        appInfo.name.toLowerCase(),
        appInfo.category.toLowerCase(),
        ...appInfo.keyFeatures.slice(0, 4).map(f => f.toLowerCase()),
        ...appInfo.benefits.slice(0, 4).map(b => b.toLowerCase())
      ].flat().filter((word, index, arr) => arr.indexOf(word) === index).slice(0, 10);

      setGeneratedDescription({
        shortDescription: fallbackShortDesc,
        fullDescription: fallbackFullDesc,
        keywords: fallbackKeywords,
        characterCount: fallbackFullDesc.length
      });

      toast({
        title: "Fallback Generated",
        description: "Used local generation due to API failure",
        variant: "default"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: `${type} has been copied to your clipboard`,
    });
  };

  const downloadDescription = () => {
    if (!generatedDescription) return;

    const content = `App Store Description for ${appInfo.name}

SHORT DESCRIPTION:
${generatedDescription.shortDescription}

FULL DESCRIPTION:
${generatedDescription.fullDescription}

KEYWORDS:
${generatedDescription.keywords.join(', ')}

CHARACTER COUNT: ${generatedDescription.characterCount}
`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${appInfo.name}-app-description.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Downloaded",
      description: "Description file has been downloaded",
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Information Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-primary" />
                App Information
              </CardTitle>
              <CardDescription>
                Provide details about your app to generate a tailored description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="appName" className="text-sm font-medium">App Name *</Label>
                <Input
                  id="appName"
                  value={appInfo.name}
                  onChange={(e) => setAppInfo(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your app name"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                <Select value={appInfo.category} onValueChange={(value) => setAppInfo(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select app category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="targetAudience" className="text-sm font-medium">Target Audience *</Label>
                <Input
                  id="targetAudience"
                  value={appInfo.targetAudience}
                  onChange={(e) => setAppInfo(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="e.g., Students, Professionals, Gamers"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Platform</Label>
                <Select value={appInfo.platform} onValueChange={(value: 'ios' | 'android' | 'both') => setAppInfo(prev => ({ ...prev, platform: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both iOS & Android</SelectItem>
                    <SelectItem value="ios">iOS Only</SelectItem>
                    <SelectItem value="android">Android Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm font-medium">Tone</Label>
                <Select value={appInfo.tone} onValueChange={(value) => setAppInfo(prev => ({ ...prev, tone: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map(tone => (
                      <SelectItem key={tone.value} value={tone.value}>{tone.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Key Features */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Star className="w-5 h-5 text-primary" />
                Key Features
              </CardTitle>
              <CardDescription>
                Select the main features of your app
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonFeatures.map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={appInfo.keyFeatures.includes(feature)}
                      onCheckedChange={() => handleFeatureToggle(feature)}
                    />
                    <Label htmlFor={feature} className="text-sm cursor-pointer">
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <TrendingUp className="w-5 h-5 text-primary" />
                Benefits
              </CardTitle>
              <CardDescription>
                What value does your app provide to users?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {commonBenefits.map(benefit => (
                  <div key={benefit} className="flex items-center space-x-2">
                    <Checkbox
                      id={benefit}
                      checked={appInfo.benefits.includes(benefit)}
                      onCheckedChange={() => handleBenefitToggle(benefit)}
                    />
                    <Label htmlFor={benefit} className="text-sm cursor-pointer">
                      {benefit}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Description */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="w-5 h-5 text-primary" />
                Generate Description
              </CardTitle>
              <CardDescription>
                Create an optimized app store description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={generateDescription}
                disabled={isGenerating || !appInfo.name || !appInfo.category || !appInfo.targetAudience}
                className="w-full py-6 text-lg"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Description
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedDescription && (
            <>
              {/* Short Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Short Description
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedDescription.shortDescription, "Short description")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Optimized for app store previews (max 255 characters)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm leading-relaxed">{generatedDescription.shortDescription}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {generatedDescription.shortDescription.length}/255 characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Full Description */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Full Description
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedDescription.fullDescription, "Full description")}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Complete app store description
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-6 bg-muted rounded-lg max-h-96 overflow-y-auto">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{generatedDescription.fullDescription}</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {generatedDescription.characterCount} characters
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Keywords */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Star className="w-5 h-5" />
                    Suggested Keywords
                  </CardTitle>
                  <CardDescription>
                    Optimized keywords for app store search
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {generatedDescription.keywords.map(keyword => (
                      <Badge key={keyword} variant="secondary" className="text-sm">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Download Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button onClick={downloadDescription} className="w-full py-6" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Download Description
                  </Button>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            App Store Optimization Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-medium mb-3">Description Best Practices:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Start with a compelling hook</li>
                <li>• Use bullet points for readability</li>
                <li>• Include keywords naturally</li>
                <li>• Focus on user benefits</li>
                <li>• Keep paragraphs concise</li>
                <li>• Use clear, action-oriented language</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-3">Platform-Specific Guidelines:</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>• iOS: Emphasize design and user experience</li>
                <li>• Android: Highlight functionality</li>
                <li>• Both: Showcase cross-platform benefits</li>
                <li>• Include social proof when possible</li>
                <li>• Update descriptions regularly</li>
                <li>• Test variations for better conversion</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppStoreDescriptionGenerator;