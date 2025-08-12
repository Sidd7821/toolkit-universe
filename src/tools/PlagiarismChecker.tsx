import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const PlagiarismChecker = () => {
  const [text, setText] = useState("");
  const [apiKey, setApiKey] = useState("UPdCdswM692Yhs9x-Yiod-CJMpGfkV1p");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkPlagiarism = async () => {
    if (!apiKey || !text.trim()) {
      toast({ title: "Error", description: "Enter API Key and Text", variant: "destructive" });
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const apiUrl = "https://plagiarismcheck.org/api/v1/text";

      const response = await fetch(
        "https://corsproxy.io/?" + encodeURIComponent(apiUrl),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
          },
          body: JSON.stringify({ text })
        }
      );

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);

    } catch (error: any) {
      console.error(error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Plagiarism Checker</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* <div className="space-y-2">
          <Label>API Key</Label>
          <Input
            placeholder="Enter your plagiarismcheck.org API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </div> */}

        <div className="space-y-2">
          <Label>Text to Check</Label>
          <Textarea
            placeholder="Paste your content here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
          />
        </div>

        <Button onClick={checkPlagiarism} disabled={loading}>
          {loading ? "Checking..." : "Check Plagiarism"}
        </Button>

        {result && (
          <div className="space-y-3 border p-3 rounded-md mt-4">
            <h3 className="font-semibold">Result</h3>
            <Badge variant="secondary">
              Similarity: {result.similarity || "N/A"}%
            </Badge>
            {result.sources && result.sources.length > 0 && (
              <ul className="list-disc list-inside text-sm">
                {result.sources.map((src: any, idx: number) => (
                  <li key={idx}>
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 underline"
                    >
                      {src.url}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlagiarismChecker;
