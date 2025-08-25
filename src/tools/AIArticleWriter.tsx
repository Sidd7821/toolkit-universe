import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Copy, Download, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For better markdown support like tables

interface ArticleParams {
  topic: string;
  length: string;
  tone: string;
  audience: string;
  keywords: string;
  language: string;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";

const AIArticleWriter = () => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [params, setParams] = useState<ArticleParams>({
    topic: "",
    length: "medium",
    tone: "professional",
    audience: "general",
    keywords: "",
    language: "English"
  });
  const [generatedArticle, setGeneratedArticle] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiKey(saved);
    } else {
      localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
    }
  }, []);

  const canGenerate = params.topic.trim() && apiKey && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    setGeneratedArticle("");

    const modelList = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let text = '';
    let usedModel = '';

    try {
      for (const currentModel of modelList) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: currentModel });

          const prompt = createArticlePrompt(params);
          const result = await model.generateContent(prompt);
          const response = await result.response;
          text = response.text();

          // Improved cleaning for better display
          // Remove code block wrappers if present
          if (text.startsWith('```markdown\n') && text.endsWith('\n```')) {
            text = text.slice(12, -4).trim();
          } else if (text.startsWith('```markdown') && text.endsWith('```')) {
            text = text.slice(11, -3).trim();
          } else if (text.startsWith('```\n') && text.endsWith('\n```')) {
            text = text.slice(4, -4).trim();
          } else if (text.startsWith('```') && text.endsWith('```')) {
            text = text.slice(3, -3).trim();
          }
          // Ensure consistent heading spacing and remove extra newlines
          text = text.replace(/\n{3,}/g, '\n\n').trim(); // Reduce multiple newlines to double for proper spacing
          // Fix any misplaced headings or add space after headings if needed, but markdown handles it

          usedModel = currentModel;
          break;
        } catch (modelErr: any) {
          console.error(`Failed with model ${currentModel}:`, modelErr);
          if (currentModel === modelList[modelList.length - 1]) {
            throw modelErr;
          }
          // Continue to next model
        }
      }

      if (text) {
        setGeneratedArticle(text);
        toast({ title: "Article generated!", description: `Using ${usedModel}. Your SEO-friendly article is ready.` });
      }
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: "Generation failed", 
        description: err?.message || "Please check your API key and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createArticlePrompt = (params: ArticleParams): string => {
    const wordCount = {
      short: "300-500 words",
      medium: "800-1200 words",
      long: "1500-2000 words",
      "very-long": "2500-3500 words"
    }[params.length];

    return `Write a comprehensive, SEO-friendly article about "${params.topic}" with the following specifications:

Length: ${wordCount}
Tone: ${params.tone}
Target Audience: ${params.audience}
Language: ${params.language}
${params.keywords ? `Keywords to include naturally: ${params.keywords}` : ""}

Requirements:
- Create an engaging headline as the main title
- Include an introduction that hooks the reader
- Structure with clear headings (H2, H3) and subheadings
- Use bullet points and numbered lists where appropriate for readability
- Include a conclusion that summarizes key points and provides a call to action if suitable
- Optimize for search engines by naturally incorporating keywords without stuffing
- Make it highly informative, valuable, and engaging to readers
- Maintain a consistent ${params.tone} tone throughout
- Write entirely in ${params.language}
- Ensure the content is original and well-researched in feel
- Use double newlines between sections for proper spacing

Format the article using proper Markdown syntax:
- Use # for H1 (title only once at the top)
- ## for H2 headings
- ### for H3 subheadings
- *italic* for emphasis
- **bold** for strong emphasis
- - for unordered lists
- 1. for ordered lists
- No excessive formatting; keep it clean and professional. Do not wrap the output in code blocks or add extra text outside the article.`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedArticle);
      toast({ title: "Copied!", description: "Article copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedArticle], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${params.topic.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_article.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Article saved to your device." });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="lg:col-span-2 grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Article Writer
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate SEO-friendly articles with AI. Customize topic, length, tone, and target audience.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="topic">Article Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., Benefits of Remote Work, Latest AI Trends, Healthy Eating Habits"
                  value={params.topic}
                  onChange={(e) => setParams(prev => ({ ...prev, topic: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="length">Article Length</Label>
                  <Select value={params.length} onValueChange={(value) => setParams(prev => ({ ...prev, length: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short (300-500 words)</SelectItem>
                      <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                      <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                      <SelectItem value="very-long">Very Long (2500-3500 words)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tone">Writing Tone</Label>
                  <Select value={params.tone} onValueChange={(value) => setParams(prev => ({ ...prev, tone: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={params.audience} onValueChange={(value) => setParams(prev => ({ ...prev, audience: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General Public</SelectItem>
                      <SelectItem value="professionals">Professionals</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="experts">Experts</SelectItem>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={params.language} onValueChange={(value) => setParams(prev => ({ ...prev, language: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Portuguese">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="keywords">Keywords (Optional)</Label>
                <Input
                  id="keywords"
                  placeholder="e.g., remote work, productivity, work-life balance"
                  value={params.keywords}
                  onChange={(e) => setParams(prev => ({ ...prev, keywords: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate multiple keywords with commas
                </p>
              </div>

              <Button onClick={handleGenerate} disabled={!canGenerate} variant="hero" className="w-full">
                {loading ? "Generating Article..." : "Generate Article"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedArticle && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generated Article</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none border rounded-md p-4 bg-muted/50">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {generatedArticle}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        )}
      </article>

      <aside className="grid gap-4">
        {/* API Configuration section is hidden/removed */}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Article Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Blog posts and articles</li>
              <li>SEO-optimized content</li>
              <li>Educational guides</li>
              <li>Product reviews</li>
              <li>Industry insights</li>
              <li>How-to tutorials</li>
              <li>News and updates</li>
              <li>Opinion pieces</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tips for Better Articles</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Be specific with your topic</li>
              <li>Include relevant keywords naturally</li>
              <li>Choose the right tone for your audience</li>
              <li>Specify the desired length</li>
              <li>Review and edit the generated content</li>
              <li>Add your personal insights</li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
};

export default AIArticleWriter;