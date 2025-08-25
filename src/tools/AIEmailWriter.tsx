import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Copy, Download, Mail, Send } from "lucide-react";

interface EmailParams {
  subject: string;
  recipient: string;
  purpose: string;
  tone: string;
  context: string;
  length: string;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";
const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

const AIEmailWriter = () => {
  const [params, setParams] = useState<EmailParams>({
    subject: "",
    recipient: "",
    purpose: "",
    tone: "professional",
    context: "",
    length: "medium"
  });
  const [generatedEmail, setGeneratedEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canGenerate = params.subject.trim() && params.purpose.trim() && !loading;

  const createEmailPrompt = (params: EmailParams): string => {
    const toneDescription = {
      professional: "formal, professional, and business-like",
      friendly: "warm, approachable, and friendly",
      casual: "relaxed, informal, and conversational",
      persuasive: "convincing, compelling, and engaging",
      apologetic: "sincere, regretful, and empathetic",
      enthusiastic: "excited, positive, and energetic"
    }[params.tone];

    const lengthDescription = {
      short: "concise (2-3 sentences)",
      medium: "standard length (4-6 sentences)",
      long: "detailed and comprehensive (8-10 sentences)"
    }[params.length];

    return `Write a ${params.tone} email with the following details:

Subject: ${params.subject}
${params.recipient ? `Recipient: ${params.recipient}` : ""}
Purpose: ${params.purpose}
${params.context ? `Context: ${params.context}` : ""}

Requirements:
- Use a ${toneDescription} tone
- Make it ${lengthDescription}
- Include a proper greeting and closing
- Use professional email formatting with clear paragraphs
- Include a clear call to action if relevant
- Ensure proper email etiquette
- Return only the email content (no additional explanations)
- Format with proper line breaks for readability`;
  };

  const tryGenerateWithModel = async (modelName: string, prompt: string) => {
    try {
      const genAI = new GoogleGenerativeAI(DEFAULT_API_KEY);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      return null;
    }
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast({
        title: "Missing required fields",
        description: "Please fill in the subject and purpose.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setGeneratedEmail("");

    const prompt = createEmailPrompt(params);
    
    for (const model of MODELS) {
      const text = await tryGenerateWithModel(model, prompt);
      if (text) {
        setGeneratedEmail(text);
        toast({
          title: "Email Generated",
          description: `Successfully generated using ${model}`
        });
        setLoading(false);
        return;
      }
    }

    toast({
      title: "Generation Failed",
      description: "Unable to generate email with any available model. Please try again later.",
      variant: "destructive"
    });
    setLoading(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedEmail);
      toast({
        title: "Copied",
        description: "Email copied to clipboard successfully."
      });
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Please copy the email manually.",
        variant: "destructive"
      });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedEmail], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `email_${params.subject.replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: "Downloaded",
      description: "Email saved to your device."
    });
  };

  return (
    <section className="container mx-auto p-4 max-w-7xl">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                AI Email Writer
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Craft professional emails effortlessly with AI assistance.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Email Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Meeting Request, Project Update"
                  value={params.subject}
                  onChange={(e) => setParams(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="recipient" className="text-sm font-medium">Recipient (Optional)</Label>
                <Input
                  id="recipient"
                  placeholder="e.g., john@company.com, Hiring Manager"
                  value={params.recipient}
                  onChange={(e) => setParams(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="purpose" className="text-sm font-medium">Purpose *</Label>
                <Textarea
                  id="purpose"
                  placeholder="e.g., Request a meeting, Apply for a position"
                  value={params.purpose}
                  onChange={(e) => setParams(prev => ({ ...prev, purpose: e.target.value }))}
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tone" className="text-sm font-medium">Tone</Label>
                  <Select value={params.tone} onValueChange={(value) => setParams(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="persuasive">Persuasive</SelectItem>
                      <SelectItem value="apologetic">Apologetic</SelectItem>
                      <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length" className="text-sm font-medium">Length</Label>
                  <Select value={params.length} onValueChange={(value) => setParams(prev => ({ ...prev, length: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="long">Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="context" className="text-sm font-medium">Additional Context (Optional)</Label>
                <Textarea
                  id="context"
                  placeholder="e.g., Previous communications, specific details"
                  value={params.context}
                  onChange={(e) => setParams(prev => ({ ...prev, context: e.target.value }))}
                  rows={3}
                  className="w-full"
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!canGenerate} 
                className="w-full bg-primary hover:bg-primary/90 transition-colors"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4 animate-pulse" />
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Generate Email
                  </span>
                )}
              </Button>
            </CardContent>
          </Card>

          {generatedEmail && (
            <Card className="shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl">Generated Email</CardTitle>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleCopy}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleDownload}
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-muted/50 rounded-md text-sm whitespace-pre-wrap leading-relaxed">
                  {generatedEmail}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Email Types</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Business proposals and pitches</li>
                <li>Job applications and cover letters</li>
                <li>Meeting and appointment requests</li>
                <li>Follow-up and thank you notes</li>
                <li>Apology and resolution emails</li>
                <li>Project updates and reports</li>
                <li>Client and stakeholder communications</li>
                <li>Networking and introduction emails</li>
                <li>Sales and marketing outreach</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Email Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm list-disc pl-5 space-y-2 text-muted-foreground">
                <li>Write clear, specific subject lines</li>
                <li>Use appropriate greetings and closings</li>
                <li>Keep the message focused and concise</li>
                <li>Match tone to the recipient and purpose</li>
                <li>Include clear calls to action</li>
                <li>Proofread for clarity and errors</li>
                <li>Respect professional email etiquette</li>
                <li>Maintain relevance to the context</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Example Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="p-3 bg-muted/50 rounded-md">
                  Request a meeting to discuss Q4 marketing strategy
                </li>
                <li className="p-3 bg-muted/50 rounded-md">
                  Apply for the senior developer position at TechCorp
                </li>
                <li className="p-3 bg-muted/50 rounded-md">
                  Thank a client for their business and request feedback
                </li>
                <li className="p-3 bg-muted/50 rounded-md">
                  Follow up on a proposal sent last week
                </li>
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
};

export default AIEmailWriter;