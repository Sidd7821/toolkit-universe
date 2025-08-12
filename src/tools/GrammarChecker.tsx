import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface GrammarError {
  message: string;
  offset: number;
  length: number;
  replacements?: string[];
}

const GrammarChecker = () => {
  const [text, setText] = useState("");
  const [errors, setErrors] = useState<GrammarError[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkGrammar = async () => {
    if (!text.trim()) return;

    setIsChecking(true);
    setHasChecked(true);

    try {
      // Call LanguageTool's free API (no API key needed for demo use)
      const res = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          text,
          language: "en-US",
        }),
      });

      if (!res.ok) throw new Error("Failed to check grammar");

      const data = await res.json();

      const parsedErrors: GrammarError[] = data.matches.map((match: any) => ({
        message: match.message,
        offset: match.offset,
        length: match.length,
        replacements: match.replacements?.map((r: any) => r.value) || [],
      }));

      setErrors(parsedErrors);
    } catch (err) {
      console.error("Grammar check error:", err);
      setErrors([]);
    }

    setIsChecking(false);
  };

  const fixError = (error: GrammarError, replacement: string) => {
    const before = text.slice(0, error.offset);
    const after = text.slice(error.offset + error.length);
    const newText = before + replacement + after;
    setText(newText);

    // Remove the fixed error
    setErrors(errors.filter((e) => e !== error));
  };

  const getErrorPosition = (error: GrammarError) => {
    const beforeError = text.slice(0, error.offset);
    const lines = beforeError.split("\n");
    const line = lines.length;
    const column = lines[lines.length - 1].length + 1;
    return { line, column };
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here to check for grammar errors..."
            className="min-h-[300px] resize-none"
          />
          <Button
            onClick={checkGrammar}
            disabled={!text.trim() || isChecking}
            className="w-full"
          >
            {isChecking ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking Grammar...
              </>
            ) : (
              "Check Grammar"
            )}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grammar Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          {!hasChecked ? (
            <div className="text-center text-muted-foreground py-8">
              <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Click "Check Grammar" to analyze your text</p>
            </div>
          ) : errors.length === 0 ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Great! No grammar errors found in your text.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="destructive">
                  {errors.length} error{errors.length !== 1 ? "s" : ""} found
                </Badge>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {errors.map((error, index) => {
                  const position = getErrorPosition(error);
                  return (
                    <div
                      key={index}
                      className="p-3 border rounded-lg bg-muted/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-destructive mb-1">
                            {error.message}
                          </p>
                          <p className="text-xs text-muted-foreground mb-2">
                            Line {position.line}, Column {position.column}
                          </p>
                          <div className="text-sm bg-background p-2 rounded border">
                            {text.slice(Math.max(0, error.offset - 20), error.offset)}
                            <span className="bg-destructive/20 text-destructive font-mono">
                              {text.slice(error.offset, error.offset + error.length)}
                            </span>
                            {text.slice(
                              error.offset + error.length,
                              error.offset + error.length + 20
                            )}
                          </div>
                          {error.replacements && error.replacements.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground mb-1">
                                Suggestions:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {error.replacements.map((replacement, idx) => (
                                  <Button
                                    key={idx}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fixError(error, replacement)}
                                    className="text-xs h-6"
                                  >
                                    {replacement}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GrammarChecker;
