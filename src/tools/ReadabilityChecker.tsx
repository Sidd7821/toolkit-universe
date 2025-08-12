import { useState, useMemo } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const ReadabilityChecker = () => {
  const [text, setText] = useState("");

  const readabilityScores = useMemo(() => {
    const cleanText = text.trim();
    if (!cleanText) return null;

    // Better sentence splitting (handles abbreviations & ellipses)
    const sentences = cleanText
      .replace(/([.!?])\s+(?=[A-Z])/g, "$1|")
      .split("|")
      .filter(s => s.trim().length > 0);

    // Word extraction (removes punctuation)
    const words = cleanText
      .replace(/[^\w\s']/g, "")
      .split(/\s+/)
      .filter(w => w.length > 0);

    const syllables = countSyllables(words);
    const characters = cleanText.replace(/\s+/g, "").length;
    const complexWords = words.filter(w => countSyllables([w]) > 2).length;

    const W = words.length;
    const S = sentences.length;
    const C = characters;
    const Y = complexWords;
    const Sy = syllables;

    // Flesch Reading Ease
    const fleschEase = 206.835 - (1.015 * (W / S)) - (84.6 * (Sy / W));

    // Flesch-Kincaid Grade Level
    const fleschGrade = (0.39 * (W / S)) + (11.8 * (Sy / W)) - 15.59;

    // Gunning Fog Index
    const fogIndex = 0.4 * ((W / S) + (100 * (Y / W)));

    // Coleman-Liau Index
    const L = (C / W) * 100; // avg letters per 100 words
    const SL = (S / W) * 100; // avg sentences per 100 words
    const colemanLiau = (0.0588 * L) - (0.296 * SL) - 15.8;

    // SMOG Index (valid only for texts with >= 3 sentences)
    const smogIndex = S >= 3
      ? 1.043 * Math.sqrt(Y * (30 / S)) + 3.1291
      : 0;

    return {
      fleschEase: clamp(fleschEase, 0, 100),
      fleschGrade: Math.max(0, fleschGrade),
      fogIndex: Math.max(0, fogIndex),
      colemanLiau: Math.max(0, colemanLiau),
      smogIndex: Math.max(0, smogIndex),
      sentences: S,
      words: W,
      characters: C,
      syllables: Sy,
      complexWords: Y,
      avgWordsPerSentence: W / S,
      avgSyllablesPerWord: Sy / W
    };
  }, [text]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Input */}
      <Card>
        <CardHeader>
          <CardTitle>Text Input</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste or type your text here to analyze readability..."
            className="min-h-[300px]"
          />
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {readabilityScores ? (
          <>
            <MetricCard
              title="Flesch Reading Ease"
              value={readabilityScores.fleschEase}
              badge={getReadabilityLevel(readabilityScores.fleschEase)}
              progress={true}
              description={getReadabilityLevel(readabilityScores.fleschEase).description + " level"}
            />
            <MetricCard
              title="Flesch-Kincaid Grade Level"
              value={readabilityScores.fleschGrade}
              badge={getGradeLevel(readabilityScores.fleschGrade)}
              progress={false}
              description="Grade level required to understand the text"
            />
            <Card>
              <CardHeader><CardTitle>Other Readability Metrics</CardTitle></CardHeader>
              <CardContent>
                <GridStat label="Gunning Fog Index" value={readabilityScores.fogIndex} />
                <GridStat label="Coleman-Liau Index" value={readabilityScores.colemanLiau} />
                <GridStat label="SMOG Index" value={readabilityScores.smogIndex} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle>Text Statistics</CardTitle></CardHeader>
              <CardContent>
                <GridStat label="Sentences" value={readabilityScores.sentences} />
                <GridStat label="Words" value={readabilityScores.words} />
                <GridStat label="Characters" value={readabilityScores.characters} />
                <GridStat label="Syllables" value={readabilityScores.syllables} />
                <GridStat label="Complex Words" value={readabilityScores.complexWords} />
                <GridStat label="Avg Words/Sentence" value={readabilityScores.avgWordsPerSentence} fixed />
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              Enter text to analyze readability
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

/* ---------- Helpers ---------- */

function countSyllables(words: string[]): number {
  let total = 0;
  for (let word of words) {
    word = word.toLowerCase().replace(/[^a-z]/g, "");
    if (!word) continue;
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "");
    word = word.replace(/^y/, "");
    const matches = word.match(/[aeiouy]{1,2}/g);
    total += matches ? matches.length : 1;
  }
  return total;
}

function clamp(val: number, min: number, max: number) {
  return Math.min(Math.max(val, min), max);
}

function getReadabilityLevel(score: number) {
  if (score >= 90) return { level: "Very Easy", color: "bg-green-500", description: "5th grade" };
  if (score >= 80) return { level: "Easy", color: "bg-green-400", description: "6th grade" };
  if (score >= 70) return { level: "Fairly Easy", color: "bg-yellow-400", description: "7th grade" };
  if (score >= 60) return { level: "Standard", color: "bg-yellow-500", description: "8th-9th grade" };
  if (score >= 50) return { level: "Fairly Difficult", color: "bg-orange-400", description: "10th-12th grade" };
  if (score >= 30) return { level: "Difficult", color: "bg-red-400", description: "College" };
  return { level: "Very Difficult", color: "bg-red-500", description: "College graduate" };
}

function getGradeLevel(score: number) {
  if (score <= 6) return { level: "Elementary", color: "bg-green-500" };
  if (score <= 10) return { level: "Middle School", color: "bg-yellow-400" };
  if (score <= 12) return { level: "High School", color: "bg-orange-400" };
  if (score <= 16) return { level: "College", color: "bg-red-400" };
  return { level: "Graduate", color: "bg-red-500" };
}

const MetricCard = ({ title, value, badge, description, progress }: any) => (
  <Card>
    <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">{value.toFixed(1)}</span>
          <Badge className={badge.color}>{badge.level}</Badge>
        </div>
        {progress && <Progress value={value} className="h-2" />}
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </CardContent>
  </Card>
);

const GridStat = ({ label, value, fixed }: any) => (
  <div className="mb-2">
    <div className="text-sm font-medium">{label}</div>
    <div className="text-lg font-semibold">
      {fixed ? value.toFixed(1) : value}
    </div>
  </div>
);

export default ReadabilityChecker;
