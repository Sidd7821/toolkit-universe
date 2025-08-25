import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Copy, Download, Sparkles } from "lucide-react";

interface ImageParams {
  prompt: string;
  style: string;
  size: string;
  quality: string;
  aspectRatio: string;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";
const MODEL_PRIORITY = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

const AIImageGenerator = () => {
  const [params, setParams] = useState<ImageParams>({
    prompt: "",
    style: "realistic",
    size: "1024x1024",
    quality: "standard",
    aspectRatio: "1:1"
  });
  const [generatedImage, setGeneratedImage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canGenerate = params.prompt.trim() && !loading;

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    setGeneratedImage("");

    try {
      let result = null;
      let currentModel = "";
      
      for (const modelName of MODEL_PRIORITY) {
        try {
          const genAI = new GoogleGenerativeAI(DEFAULT_API_KEY);
          currentModel = modelName;
          const model = genAI.getGenerativeModel({ model: modelName });
          
          const prompt = createImagePrompt(params);
          result = await model.generateContent(prompt);
          break; // Exit loop if successful
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
      
      setGeneratedImage(text);
      toast({ 
        title: "Success!", 
        description: `Image prompt generated using ${currentModel}`,
      });
    } catch (err: any) {
      console.error(err);
      toast({ 
        title: "Generation failed", 
        description: err?.message || "Unable to generate image prompt. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createImagePrompt = (params: ImageParams): string => {
    const styleDescription = {
      realistic: "photorealistic, highly detailed, lifelike rendering",
      artistic: "artistic composition with creative expression",
      cartoon: "vibrant cartoon style with bold outlines",
      abstract: "abstract and conceptual with surreal elements",
      vintage: "retro aesthetic with vintage color palette",
      futuristic: "futuristic design with sci-fi elements"
    }[params.style];

    const qualityDescription = {
      standard: "standard resolution with clear details",
      high: "high resolution with enhanced details",
      ultra: "ultra-high resolution with maximum detail and clarity"
    }[params.quality];

    return `Generate a highly detailed image with the following specifications:

Description: ${params.prompt}
Style: ${styleDescription}
Size: ${params.size}
Quality: ${qualityDescription}
Aspect Ratio: ${params.aspectRatio}

Requirements:
- Create a vivid, detailed scene with rich visual elements
- Use specific colors, lighting conditions, and atmospheric effects
- Incorporate professional artistic terminology
- Optimize for AI image generation systems
- Include relevant style modifiers and quality enhancers
- Ensure composition is balanced and visually appealing
- Add subtle details to enhance realism or artistic impact
- Consider perspective, depth, and focal points`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedImage);
      toast({ title: "Copied!", description: "Prompt copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const blob = new Blob([generatedImage], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `image_prompt_${params.prompt.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Prompt saved to your device." });
  };

  const getSizesForAspectRatio = (aspectRatio: string): string[] => {
    const sizes: { [key: string]: string[] } = {
      "1:1": ["512x512", "1024x1024", "2048x2048"],
      "16:9": ["1024x576", "1920x1080", "2560x1440"],
      "4:3": ["1024x768", "1920x1440", "2560x1920"],
      "3:2": ["1024x683", "1920x1280", "2560x1707"],
      "9:16": ["576x1024", "1080x1920", "1440x2560"]
    };
    return sizes[aspectRatio] || ["1024x1024"];
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="lg:col-span-2 grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              AI Image Prompt Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Create detailed prompts for AI image generation tools with customizable parameters.
            </p>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid gap-4">
              <div>
                <Label htmlFor="prompt" className="text-sm font-medium">Image Description *</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your image (e.g., A majestic dragon flying over a medieval castle at sunset)"
                  value={params.prompt}
                  onChange={(e) => setParams(prev => ({ ...prev, prompt: e.target.value }))}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="style" className="text-sm font-medium">Art Style</Label>
                  <Select value={params.style} onValueChange={(value) => setParams(prev => ({ ...prev, style: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="artistic">Artistic</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="abstract">Abstract</SelectItem>
                      <SelectItem value="vintage">Vintage</SelectItem>
                      <SelectItem value="futuristic">Futuristic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="quality" className="text-sm font-medium">Quality Level</Label>
                  <Select value={params.quality} onValueChange={(value) => setParams(prev => ({ ...prev, quality: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="ultra">Ultra High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aspectRatio" className="text-sm font-medium">Aspect Ratio</Label>
                  <Select value={params.aspectRatio} onValueChange={(value) => {
                    setParams(prev => ({ 
                      ...prev, 
                      aspectRatio: value,
                      size: getSizesForAspectRatio(value)[1]
                    }));
                  }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="16:9">Widescreen (16:9)</SelectItem>
                      <SelectItem value="4:3">Standard (4:3)</SelectItem>
                      <SelectItem value="3:2">Photo (3:2)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="size" className="text-sm font-medium">Image Size</Label>
                  <Select value={params.size} onValueChange={(value) => setParams(prev => ({ ...prev, size: value }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getSizesForAspectRatio(params.aspectRatio).map(size => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={!canGenerate} 
                variant="hero" 
                className="w-full py-6 text-lg"
              >
                {loading ? "Generating Prompt..." : "Generate Image Prompt"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedImage && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Generated Image Prompt</CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Prompt
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Prompt
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 border rounded-md p-6 text-sm leading-relaxed">
                <p className="whitespace-pre-wrap">{generatedImage}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </article>

      <aside className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Image Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Landscapes & nature</li>
              <li>Portraits & people</li>
              <li>Fantasy & sci-fi</li>
              <li>Abstract art</li>
              <li>Product photography</li>
              <li>Architecture</li>
              <li>Animals & wildlife</li>
              <li>Conceptual art</li>
              <li>Historical scenes</li>
              <li>Futuristic designs</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prompt Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Be specific about details</li>
              <li>Include lighting and mood</li>
              <li>Specify colors and textures</li>
              <li>Mention composition style</li>
              <li>Add artistic references</li>
              <li>Include technical details</li>
              <li>Use descriptive adjectives</li>
              <li>Consider the target audience</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Example Prompts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="p-2 bg-muted/50 rounded text-xs">
                "A serene mountain lake at golden hour with crystal clear reflections"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Cyberpunk city street with neon lights and flying cars"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Magical forest with glowing mushrooms and fairy lights"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Professional headshot of a confident businesswoman"
              </li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
};

export default AIImageGenerator;