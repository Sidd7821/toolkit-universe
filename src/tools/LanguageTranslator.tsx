import React, { useState } from "react";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Copy, Volume2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const languages = [
  { code: "auto", name: "Auto Detect" },
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "hi", name: "Hindi" },
  // ...add more as needed
];

const GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";
const GOOGLE_API_KEY = "AIzaSyBp2mvdh1VhrXWd1SVu6z0Ok9Dqs0KVHak";

const LanguageTranslator = () => {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("en");
  const [isTranslating, setIsTranslating] = useState(false);

  const translateText = async () => {
    if (!sourceText.trim()) {
      return toast({ title: "No text to translate", description: "Please enter text.", variant: "destructive" });
    }
    setIsTranslating(true);
    setTranslatedText("");

    try {
      const { data } = await axios.post(
        `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_API_KEY}`,
        {
          q: sourceText,
          target: targetLanguage,
          source: sourceLanguage !== "auto" ? sourceLanguage : undefined,
        }
      );
      const translated = data.data.translations[0].translatedText;
      setTranslatedText(translated);
      toast({ title: "Translation complete", description: "Text has been translated successfully." });
    } catch (err) {
      console.error(err);
      toast({ title: "Translation failed", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsTranslating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", description: "Text copied successfully." });
  };

  const speakText = (text: string, lang: string) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === "auto" ? targetLanguage : lang;
      speechSynthesis.speak(utter);
    } else {
      toast({ title: "Speech not supported", description: "Text-to-speech is unsupported.", variant: "destructive" });
    }
  };

  const swapLanguages = () => {
    if (sourceLanguage !== "auto") {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setSourceText(translatedText);
      setTranslatedText("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Language Settings */}
      <Card>
        <CardHeader><CardTitle>Language Settings</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">From</label>
              <Select value={sourceLanguage} onValueChange={setSourceLanguage}>
                <SelectTrigger><SelectValue placeholder="Select source language" /></SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon" onClick={swapLanguages} disabled={sourceLanguage === "auto"}>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">To</label>
              <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                <SelectTrigger><SelectValue placeholder="Select target language" /></SelectTrigger>
                <SelectContent>
                  {languages.filter((l) => l.code !== "auto").map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Text Areas */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Source Text
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => speakText(sourceText, sourceLanguage)} disabled={!sourceText}>
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(sourceText)} disabled={!sourceText}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="min-h-[200px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">{sourceText.length} characters</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Translation
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => speakText(translatedText, targetLanguage)} disabled={!translatedText}>
                  <Volume2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(translatedText)} disabled={!translatedText}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={translatedText}
              readOnly
              placeholder={isTranslating ? "Translating..." : "Translation will appear here..."}
              className="min-h-[200px]"
            />
            <div className="mt-2 text-sm text-muted-foreground">{translatedText.length} characters</div>
          </CardContent>
        </Card>
      </div>

      {/* Translate Button */}
      <div className="flex justify-center">
        <Button onClick={translateText} disabled={!sourceText.trim() || isTranslating} size="lg" className="px-8">
          {isTranslating ? "Translating..." : "Translate"}
        </Button>
      </div>

      {/* Note */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <strong>Note:</strong> This version uses Google Translate API. Replace `GOOGLE_API_KEY` with your valid key and configure billing appropriately.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageTranslator;
