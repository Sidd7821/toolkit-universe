import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Copy, Download, Code } from "lucide-react";

interface CodeParams {
  description: string;
  language: string;
  complexity: string;
  framework: string;
  requirements: string;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";
const MODELS = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-2.5-flash"];

const AICodeGenerator = () => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [params, setParams] = useState<CodeParams>({
    description: "",
    language: "JavaScript",
    complexity: "intermediate",
    framework: "none",
    requirements: ""
  });
  const [generatedCode, setGeneratedCode] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiKey(saved);
    } else {
      localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
    }
  }, []);

  const canGenerate = params.description.trim() && apiKey && !loading;

  const cleanCode = (text: string): string => {
    // Extract code from markdown code block if present
    const codeBlockRegex = /```(?:\w+)?\s*([\s\S]*?)```/;
    const match = text.match(codeBlockRegex);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Otherwise, remove markdown elements like **, #, etc.
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/#/g, '')
      .replace(/`/g, '')
      .trim();
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;

    setLoading(true);
    setGeneratedCode("");

    let success = false;
    for (const modelName of MODELS) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = createCodePrompt(params);
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        setGeneratedCode(cleanCode(text));
        toast({ title: "Code generated!", description: `Generated using ${modelName}. Your code snippet is ready.` });
        success = true;
        break;
      } catch (err: any) {
        console.error(`Failed with ${modelName}:`, err);
        // Continue to next model
      }
    }

    if (!success) {
      toast({ 
        title: "Generation failed", 
        description: "All models failed. Please check your API key and try again.",
        variant: "destructive"
      });
    }

    setLoading(false);
  };

  const createCodePrompt = (params: CodeParams): string => {
    const complexityLevel = {
      beginner: "simple and well-commented code suitable for beginners",
      intermediate: "moderate complexity with good practices and some comments",
      advanced: "complex implementation with advanced features and minimal comments"
    }[params.complexity];

    const frameworkText = params.framework !== "none" ? ` using ${params.framework}` : "";

    return `Generate ${params.language} code${frameworkText} for the following requirement:

Description: ${params.description}
${params.requirements ? `Additional Requirements: ${params.requirements}` : ""}

Requirements:
- Write ${complexityLevel}
- Include proper error handling where appropriate
- Use modern ${params.language} best practices
- Add comments explaining the logic
- Make the code reusable and maintainable
- Include example usage if applicable
- Format the code properly with correct indentation
- Wrap the final code in a markdown code block like \`\`\`${params.language.toLowerCase()}\n code \n\`\`\`

Please provide the complete code snippet with all necessary imports and dependencies.`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      toast({ title: "Copied!", description: "Code copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Please copy manually.", variant: "destructive" });
    }
  };

  const handleDownload = () => {
    const extension = getFileExtension(params.language);
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `generated_code.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Downloaded!", description: "Code saved to your device." });
  };

  const getFileExtension = (language: string): string => {
    const extensions: { [key: string]: string } = {
      JavaScript: "js",
      TypeScript: "ts",
      Python: "py",
      Java: "java",
      C: "c",
      "C++": "cpp",
      CSharp: "cs",
      PHP: "php",
      Ruby: "rb",
      Go: "go",
      Rust: "rs",
      Swift: "swift",
      Kotlin: "kt",
      HTML: "html",
      CSS: "css",
      SQL: "sql",
      R: "r",
      MATLAB: "m",
      Scala: "scala",
      Dart: "dart"
    };
    return extensions[language] || "txt";
  };

  const getFrameworksForLanguage = (language: string): string[] => {
    const frameworks: { [key: string]: string[] } = {
      JavaScript: ["none", "React", "Vue", "Angular", "Node.js", "Express", "Next.js"],
      TypeScript: ["none", "React", "Vue", "Angular", "Node.js", "Express", "Next.js"],
      Python: ["none", "Django", "Flask", "FastAPI", "Pandas", "NumPy", "TensorFlow"],
      Java: ["none", "Spring", "Spring Boot", "Hibernate", "Maven", "Gradle"],
      "C++": ["none", "Qt", "Boost", "STL", "OpenGL"],
      CSharp: ["none", ".NET", "ASP.NET", "Entity Framework", "Unity"],
      PHP: ["none", "Laravel", "Symfony", "CodeIgniter", "WordPress"],
      Ruby: ["none", "Rails", "Sinatra", "RSpec"],
      Go: ["none", "Gin", "Echo", "Fiber", "GORM"],
      Rust: ["none", "Actix", "Rocket", "Tokio", "Serde"],
      Swift: ["none", "UIKit", "SwiftUI", "Core Data", "Combine"],
      Kotlin: ["none", "Spring Boot", "Ktor", "Android", "Coroutines"]
    };
    return frameworks[language] || ["none"];
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="lg:col-span-2 grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Code className="h-5 w-5" />
              AI Code Generator
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Generate code snippets in various programming languages with AI assistance.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="description">Code Description *</Label>
                <Textarea
                  id="description"
                  placeholder="e.g., Create a function to sort an array of numbers, Build a REST API endpoint for user authentication, Implement a binary search algorithm"
                  value={params.description}
                  onChange={(e) => setParams(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="language">Programming Language</Label>
                  <Select value={params.language} onValueChange={(value) => {
                    setParams(prev => ({ 
                      ...prev, 
                      language: value,
                      framework: "none" // Reset framework when language changes
                    }));
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="JavaScript">JavaScript</SelectItem>
                      <SelectItem value="TypeScript">TypeScript</SelectItem>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="Java">Java</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="C++">C++</SelectItem>
                      <SelectItem value="CSharp">C#</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                      <SelectItem value="Ruby">Ruby</SelectItem>
                      <SelectItem value="Go">Go</SelectItem>
                      <SelectItem value="Rust">Rust</SelectItem>
                      <SelectItem value="Swift">Swift</SelectItem>
                      <SelectItem value="Kotlin">Kotlin</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="CSS">CSS</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="R">R</SelectItem>
                      <SelectItem value="MATLAB">MATLAB</SelectItem>
                      <SelectItem value="Scala">Scala</SelectItem>
                      <SelectItem value="Dart">Dart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="complexity">Code Complexity</Label>
                  <Select value={params.complexity} onValueChange={(value) => setParams(prev => ({ ...prev, complexity: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="framework">Framework/Library (Optional)</Label>
                <Select value={params.framework} onValueChange={(value) => setParams(prev => ({ ...prev, framework: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getFrameworksForLanguage(params.language).map(framework => (
                      <SelectItem key={framework} value={framework}>
                        {framework === "none" ? "No Framework" : framework}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="requirements">Additional Requirements (Optional)</Label>
                <Textarea
                  id="requirements"
                  placeholder="e.g., Must handle edge cases, Include unit tests, Use async/await, Follow specific naming conventions"
                  value={params.requirements}
                  onChange={(e) => setParams(prev => ({ ...prev, requirements: e.target.value }))}
                  rows={2}
                />
              </div>

              <Button onClick={handleGenerate} disabled={!canGenerate} variant="hero" className="w-full">
                {loading ? "Generating Code..." : "Generate Code"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {generatedCode && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Generated Code</CardTitle>
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
              <pre className="bg-muted/50 border rounded-md p-4 overflow-x-auto text-sm">
                <code className="whitespace-pre-wrap">{generatedCode}</code>
              </pre>
            </CardContent>
          </Card>
        )}
      </article>

      <aside className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Code Types</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Functions and methods</li>
              <li>Classes and objects</li>
              <li>API endpoints</li>
              <li>Algorithms</li>
              <li>Data structures</li>
              <li>Database queries</li>
              <li>Utility functions</li>
              <li>Configuration files</li>
              <li>Test cases</li>
              <li>Component templates</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tips for Better Code</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Be specific about requirements</li>
              <li>Mention the target use case</li>
              <li>Specify performance requirements</li>
              <li>Include error handling needs</li>
              <li>Mention any constraints</li>
              <li>Review and test generated code</li>
              <li>Customize for your specific needs</li>
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
                "Create a React component for a todo list with add, delete, and toggle functionality"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Write a Python function to validate email addresses using regex"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Generate a Node.js Express API endpoint for user registration with password hashing"
              </li>
              <li className="p-2 bg-muted/50 rounded text-xs">
                "Create a Java class for a binary search tree with insert and search methods"
              </li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
};

export default AICodeGenerator;