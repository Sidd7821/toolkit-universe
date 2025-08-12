import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

const WordCounter = () => {
  const [text, setText] = useState("");

  // Calculate stats efficiently
  const { words, charsWithSpaces, charsNoSpaces, readingTime } = useMemo(() => {
    const trimmed = text.trim();

    // Word count: split by spaces/newlines/tabs, filter out empties
    const wordCount = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;

    // Character counts
    const charCountWithSpaces = text.length;
    const charCountNoSpaces = text.replace(/\s+/g, "").length;

    // Reading time (200 words/min)
    const time = wordCount > 0 ? Math.ceil(wordCount / 200) : 0;

    return {
      words: wordCount,
      charsWithSpaces: charCountWithSpaces,
      charsNoSpaces: charCountNoSpaces,
      readingTime: time,
    };
  }, [text]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Input */}
      <Card>
        <CardContent className="pt-6">
          <label className="block text-sm mb-2 font-medium">Paste your text</label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste text here…"
            className="min-h-[220px]"
          />
        </CardContent>
      </Card>

      {/* Stats */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-semibold">{words}</div>
            <div className="text-sm text-muted-foreground">Words</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{charsWithSpaces}</div>
            <div className="text-sm text-muted-foreground">Characters (with spaces)</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{charsNoSpaces}</div>
            <div className="text-sm text-muted-foreground">Characters (no spaces)</div>
          </div>
          <div>
            <div className="text-2xl font-semibold">{readingTime} min</div>
            <div className="text-sm text-muted-foreground">Reading time</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordCounter;
