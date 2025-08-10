import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "gemini_api_key";
const DEFAULT_API_KEY = "AIzaSyDg4-aSW_VQwwaIR7NVRJrtibikyrp0zFE";

const AIAssist = () => {
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setApiKey(saved);
    } else {
      // Set default API key if none is saved
      localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
    }
  }, []);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const modelId = "gemini-1.5-flash";

  const canSend = useMemo(() => !!input.trim() && !!apiKey && !loading, [input, apiKey, loading]);

  const handleSaveKey = () => {
    if (!apiKey) {
      toast({ title: "API key cleared", description: "Removed local Gemini key." });
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, apiKey);
    toast({ title: "API key saved", description: "Stored locally in your browser." });
  };

  const handleSend = async () => {
    const prompt = input.trim();
    if (!prompt) return;
    if (!apiKey) {
      toast({ title: "Missing Gemini API key", description: "Add your key in Settings." });
      return;
    }

    setMessages((prev) => [...prev, { role: "user", content: prompt }]);
    setInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelId });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [...prev, { role: "assistant", content: text }]);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (canSend) handleSend();
    }
  };

  const handleClear = () => setMessages([]);

  const handleUseDefault = () => {
    setApiKey(DEFAULT_API_KEY);
    localStorage.setItem(STORAGE_KEY, DEFAULT_API_KEY);
    toast({ title: "Default API key set", description: "Using the provided Gemini API key." });
  };

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="lg:col-span-2 grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">AI Assist - Gemini 1.5 Flash</CardTitle>
            <p className="text-sm text-muted-foreground">
              Chat with Google's Gemini AI for writing, coding, analysis, and creative tasks.
            </p>
          </CardHeader>
          <CardContent>
            <div
              ref={viewportRef}
              className="h-[420px] overflow-y-auto rounded-md border border-border bg-background p-4"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">Welcome to AI Assist! Try asking:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>"Write a professional email about project delays"</li>
                    <li>"Explain quantum computing in simple terms"</li>
                    <li>"Create a Python function to sort a list"</li>
                    <li>"Generate creative story ideas for a sci-fi novel"</li>
                  </ul>
                  <p className="text-xs mt-3">Press Cmd/Ctrl+Enter to send quickly.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className={`rounded-md p-3 border border-border ${
                      m.role === 'user' ? 'bg-primary/5 ml-8' : 'bg-card mr-8'
                    }`}>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                        {m.role === 'user' ? 'You' : 'Gemini'}
                      </div>
                      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                        {m.content}
                      </div>
                    </div>
                  ))}
                  {loading && (
                    <div className="rounded-md p-3 border border-border bg-card mr-8">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1 font-medium">
                        Gemini
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                        <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <Textarea
                placeholder="Ask me anything... I can help with writing, coding, analysis, creative tasks, and more!"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Chat with AI"
                rows={3}
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleSend} disabled={!canSend} variant="hero">
                  {loading ? "Generating..." : "Send Message"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear} disabled={messages.length === 0 || loading}>
                  Clear Chat
                </Button>
                <span className="ml-auto text-xs text-muted-foreground">Model: {modelId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </article>

      <aside className="grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="gemini-key">Gemini API Key</label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="AIza..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              aria-describedby="gemini-help"
            />
            <p id="gemini-help" className="text-xs text-muted-foreground">
              Your API key is stored locally in your browser and never sent to our servers.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" onClick={handleSaveKey}>Save Key</Button>
              <Button size="sm" variant="outline" onClick={handleUseDefault}>Use Default</Button>
              <Button size="sm" variant="outline" onClick={() => { 
                setApiKey(""); 
                localStorage.removeItem(STORAGE_KEY); 
                toast({ title: "API key removed", description: "Cleared from local storage." });
              }}>
                Remove
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Creative writing and storytelling</li>
              <li>Code generation and debugging</li>
              <li>Text analysis and summarization</li>
              <li>Language translation</li>
              <li>Question answering</li>
              <li>Educational explanations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Use Cmd/Ctrl+Enter to send quickly</li>
              <li>Be specific in your requests for better results</li>
              <li>Ask for structured outputs (JSON, lists, tables)</li>
              <li>Request examples or step-by-step explanations</li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
};

export default AIAssist;