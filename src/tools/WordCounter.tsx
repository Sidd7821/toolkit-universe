import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const WordCounter = () => {
  const [text, setText] = useState("");
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  const minutes = Math.max(1, Math.round(words / 200));

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm mb-2">Paste your text</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here…"
            className="min-h-[220px]"
          />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6 grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-semibold">{words}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{chars}</div>
            <div className="text-sm text-muted-foreground">Characters</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{minutes} min</div>
            <div className="text-sm text-muted-foreground">Reading time</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordCounter;
