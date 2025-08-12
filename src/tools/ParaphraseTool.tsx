import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Copy, RotateCcw } from "lucide-react";

type ParaphraseMode = "standard" | "creative" | "formal" | "casual" | "academic";

// ⚠ Replace with your own Gemini API Key from Google AI Studio
const GEMINI_API_KEY = "AIzaSyBp2mvdh1VhrXWd1SVu6z0Ok9Dqs0KVHak";

const ParaphraseTool = () => {
  const [originalText, setOriginalText] = useState("");
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [mode, setMode] = useState<ParaphraseMode>("standard");
  const [isParaphrasing, setIsParaphrasing] = useState(false);
  const [hasParaphrased, setHasParaphrased] = useState(false);

  const paraphraseText = async () => {
    if (!originalText.trim()) return;
    setIsParaphrasing(true);
    setHasParaphrased(true);

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: getPrompt(mode) },
                  { text: originalText }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 512
            }
          })
        }
      );

      const data = await res.json();

      if (data?.candidates?.length > 0) {
        // Combine all candidates' text for richer output
        const outputs = data.candidates
          .map((c: any) => c?.content?.parts?.map((p: any) => p.text).join(" "))
          .filter(Boolean);
        setParaphrasedText(outputs.join("\n\n").trim());
      } else {
        setParaphrasedText("⚠️ No paraphrase generated. Please try again.");
      }

    } catch (err: any) {
      console.error(err);
      setParaphrasedText(`⚠️ Error: ${err.message || "Something went wrong."}`);
    } finally {
      setIsParaphrasing(false);
    }
  };

  const getPrompt = (mode: ParaphraseMode) => {
    const modeInstructions: Record<ParaphraseMode, string> = {
      standard: "Paraphrase the following text clearly and naturally.",
      creative: "Paraphrase the following text with creative and expressive language.",
      formal: "Paraphrase the following text in a formal, professional tone.",
      casual: "Paraphrase the following text in a relaxed and conversational style.",
      academic: "Paraphrase the following text in an academic and scholarly tone."
    };
    return modeInstructions[mode];
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const resetText = () => {
    setOriginalText("");
    setParaphrasedText("");
    setHasParaphrased(false);
  };

  const getModeDescription = (mode: ParaphraseMode) => {
    switch (mode) {
      case "standard": return "Balanced rewriting for general use";
      case "creative": return "More expressive and imaginative language";
      case "formal": return "Professional and business-appropriate tone";
      case "casual": return "Relaxed and conversational style";
      case "academic": return "Scholarly and research-oriented language";
      default: return "";
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Original Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Paraphrase Mode</label>
            <Select value={mode} onValueChange={(value: ParaphraseMode) => setMode(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="standard">Standard</SelectItem>
                <SelectItem value="creative">Creative</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">{getModeDescription(mode)}</p>
          </div>

          <Textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Enter the text you want to paraphrase..."
            className="min-h-[250px] resize-none"
          />

          <div className="flex gap-2">
            <Button
              onClick={paraphraseText}
              disabled={!originalText.trim() || isParaphrasing}
              className="flex-1"
            >
              {isParaphrasing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Paraphrasing...
                </>
              ) : (
                "Paraphrase Text"
              )}
            </Button>
            <Button
              variant="outline"
              onClick={resetText}
              disabled={isParaphrasing}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paraphrased Text</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasParaphrased ? (
            <div className="text-center text-muted-foreground py-8">
              <p>Your paraphrased text will appear here</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <Textarea
                  value={paraphrasedText}
                  readOnly
                  className="min-h-[250px] resize-none"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(paraphrasedText)}
                  className="absolute top-2 right-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>Original: {originalText.trim().split(/\s+/).length} words</div>
                <div>Paraphrased: {paraphrasedText.trim().split(/\s+/).length} words</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ParaphraseTool;
