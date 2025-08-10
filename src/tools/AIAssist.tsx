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

const AIAssist = () => {
  const [apiKey, setApiKey] = useState<string>("");
  const [input, setInput] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setApiKey(saved);
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
      toast({ title: "Missing Gemini API key", description: "Add your key in Settings.", });
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
      toast({ title: "Generation failed", description: err?.message || "Please try again." });
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

  return (
    <section className="grid gap-6 lg:grid-cols-3">
      <article className="lg:col-span-2 grid gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">AI Assist</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              ref={viewportRef}
              className="h-[420px] overflow-y-auto rounded-md border border-border bg-background p-4"
              aria-live="polite"
            >
              {messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Ask anything. Press Cmd/Ctrl+Enter to send.
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m, i) => (
                    <div key={i} className="rounded-md p-3 border border-border bg-card">
                      <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{m.role}</div>
                      <div className="prose prose-sm dark:prose-invert whitespace-pre-wrap">{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-2">
              <Textarea
                placeholder="Write an email apologizing for a delay…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Prompt"
              />
              <div className="flex items-center gap-2">
                <Button onClick={handleSend} disabled={!canSend}>
                  {loading ? "Generating…" : "Send"}
                </Button>
                <Button type="button" variant="outline" onClick={handleClear} disabled={messages.length === 0 || loading}>
                  Clear
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
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="gemini-key">Gemini API Key</label>
            <Input
              id="gemini-key"
              type="password"
              placeholder="AIza…"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              aria-describedby="gemini-help"
            />
            <p id="gemini-help" className="text-xs text-muted-foreground">
              Your key is stored locally in your browser (never sent to our servers).
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSaveKey}>Save key</Button>
              <Button size="sm" variant="outline" onClick={() => { setApiKey(""); localStorage.removeItem(STORAGE_KEY); }}>Remove</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm list-disc pl-5 space-y-1 text-muted-foreground">
              <li>Use Cmd/Ctrl+Enter to send quickly.</li>
              <li>Ask for structured outputs (JSON, bullet lists).</li>
              <li>Your API key stays in local storage only.</li>
            </ul>
          </CardContent>
        </Card>
      </aside>
    </section>
  );
};

export default AIAssist;
