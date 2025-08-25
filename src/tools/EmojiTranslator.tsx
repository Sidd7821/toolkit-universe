import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smile, 
  MessageSquare, 
  Copy, 
  RefreshCw, 
  Sparkles,
  Languages,
  History,
  Heart,
  Share2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EmojiMapping {
  [key: string]: string[];
}

interface TranslationHistory {
  id: string;
  original: string;
  translated: string;
  type: "text-to-emoji" | "emoji-to-text";
  timestamp: Date;
}

const EmojiTranslator = () => {
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [translationType, setTranslationType] = useState<"text-to-emoji" | "emoji-to-text">("text-to-emoji");
  const [language, setLanguage] = useState("en");
  const [autoTranslate, setAutoTranslate] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<TranslationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Common emoji mappings
  const emojiMappings: EmojiMapping = {
    en: {
      "happy": ["😊", "😄", "😃", "🙂"],
      "sad": ["😢", "😭", "😔", "😞"],
      "love": ["❤️", "💕", "💖", "💗"],
      "angry": ["😠", "😡", "🤬", "💢"],
      "laugh": ["😂", "🤣", "😆", "😅"],
      "cry": ["😭", "😢", "😿", "💧"],
      "sleep": ["😴", "😪", "💤", "🌙"],
      "eat": ["🍕", "🍔", "🍜", "🍣"],
      "drink": ["☕", "🥤", "🍺", "🍷"],
      "work": ["💼", "👔", "💻", "📊"],
      "study": ["📚", "📖", "✏️", "🎓"],
      "music": ["🎵", "🎶", "🎸", "🎤"],
      "sport": ["⚽", "🏀", "🎾", "🏃"],
      "travel": ["✈️", "🚗", "🏖️", "🗺️"],
      "family": ["👨‍👩‍👧‍👦", "👪", "👨‍👩‍👦", "👨‍👩‍👧"],
      "friend": ["👥", "🤝", "👫", "👭"],
      "money": ["💰", "💵", "💳", "🏦"],
      "time": ["⏰", "🕐", "⏳", "⌚"],
      "weather": ["☀️", "🌧️", "❄️", "🌈"],
      "nature": ["🌲", "🌺", "🌊", "🏔️"]
    },
    "es": {
      "feliz": ["😊", "😄", "😃", "🙂"],
      "triste": ["😢", "😭", "😔", "😞"],
      "amor": ["❤️", "💕", "💖", "💗"],
      "enojado": ["😠", "😡", "🤬", "💢"],
      "risa": ["😂", "🤣", "😆", "😅"]
    },
    "fr": {
      "heureux": ["😊", "😄", "😃", "🙂"],
      "triste": ["😢", "😭", "😔", "😞"],
      "amour": ["❤️", "💕", "💖", "💗"],
      "fâché": ["😠", "😡", "🤬", "💢"],
      "rire": ["😂", "🤣", "😆", "😅"]
    }
  };

  const translateTextToEmoji = (text: string): string => {
    const words = text.toLowerCase().split(/\s+/);
    const translatedWords = words.map(word => {
      // Remove punctuation for matching
      const cleanWord = word.replace(/[^\w]/g, '');
      
      // Check if word has emoji mapping
      if (emojiMappings[language] && emojiMappings[language][cleanWord]) {
        const emojis = emojiMappings[language][cleanWord];
        return emojis[Math.floor(Math.random() * emojis.length)];
      }
      
      // Check for partial matches
      for (const [key, emojis] of Object.entries(emojiMappings[language] || {})) {
        if (cleanWord.includes(key) || key.includes(cleanWord)) {
          return emojis[Math.floor(Math.random() * emojis.length)];
        }
      }
      
      // Return original word if no emoji found
      return word;
    });
    
    return translatedWords.join(' ');
  };

  const translateEmojiToText = (text: string): string => {
    // This is a simplified emoji to text translation
    // In a real app, you'd use a comprehensive emoji database
    const emojiToText: { [key: string]: string } = {
      "😊": "happy",
      "😄": "laughing",
      "😃": "joyful",
      "🙂": "slight smile",
      "😢": "crying",
      "😭": "sobbing",
      "😔": "pensive",
      "😞": "disappointed",
      "❤️": "love",
      "💕": "two hearts",
      "💖": "sparkling heart",
      "💗": "growing heart",
      "😠": "annoyed",
      "😡": "pouting",
      "🤬": "cursing",
      "💢": "anger symbol",
      "😂": "joy",
      "🤣": "rolling on floor laughing",
      "😆": "grinning squinting",
      "😅": "grinning with sweat",
      "😴": "sleeping",
      "😪": "sleepy",
      "💤": "zzz",
      "🌙": "crescent moon",
      "🍕": "pizza",
      "🍔": "hamburger",
      "🍜": "steaming bowl",
      "🍣": "sushi",
      "☕": "hot beverage",
      "🥤": "cup with straw",
      "🍺": "beer mug",
      "🍷": "wine glass",
      "💼": "briefcase",
      "👔": "necktie",
      "💻": "laptop",
      "📊": "bar chart",
      "📚": "books",
      "📖": "open book",
      "✏️": "pencil",
      "🎓": "graduation cap",
      "🎵": "musical note",
      "🎶": "musical notes",
      "🎸": "guitar",
      "🎤": "microphone",
      "⚽": "soccer ball",
      "🏀": "basketball",
      "🎾": "tennis",
      "🏃": "runner",
      "✈️": "airplane",
      "🚗": "automobile",
      "🏖️": "beach with umbrella",
      "🗺️": "world map",
      "👨‍👩‍👧‍👦": "family",
      "👪": "family",
      "👨‍👩‍👦": "family man woman boy",
      "👨‍👩‍👧": "family man woman girl",
      "👥": "busts in silhouette",
      "🤝": "handshake",
      "👫": "man and woman holding hands",
      "👭": "two women holding hands",
      "💰": "money bag",
      "💵": "dollar banknote",
      "💳": "credit card",
      "🏦": "bank",
      "⏰": "alarm clock",
      "🕐": "one o'clock",
      "⏳": "hourglass with flowing sand",
      "⌚": "watch",
      "☀️": "sun",
      "🌧️": "cloud with rain",
      "❄️": "snowflake",
      "🌈": "rainbow",
      "🌲": "evergreen tree",
      "🌺": "hibiscus",
      "🌊": "wave",
      "🏔️": "mountain"
    };

    let translated = text;
    for (const [emoji, meaning] of Object.entries(emojiToText)) {
      translated = translated.replace(new RegExp(emoji, 'g'), meaning);
    }
    
    return translated;
  };

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    
    setIsLoading(true);
    
    setTimeout(() => {
      let result = "";
      if (translationType === "text-to-emoji") {
        result = translateTextToEmoji(inputText);
      } else {
        result = translateEmojiToText(inputText);
      }
      
      setOutputText(result);
      
      // Add to history
      const newHistoryItem: TranslationHistory = {
        id: Date.now().toString(),
        original: inputText,
        translated: result,
        type: translationType,
        timestamp: new Date()
      };
      
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 9)]);
      setIsLoading(false);
    }, 500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(outputText);
    toast({
      title: "Copied!",
      description: "Translation copied to clipboard",
    });
  };

  const handleFavorite = () => {
    if (favorites.includes(inputText)) {
      setFavorites(prev => prev.filter(fav => fav !== inputText));
    } else {
      setFavorites(prev => [...prev, inputText]);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Emoji Translation",
        text: `${inputText} → ${outputText}`,
      });
    } else {
      navigator.clipboard.writeText(`${inputText} → ${outputText}`);
      toast({
        title: "Shared!",
        description: "Translation copied to clipboard",
      });
    }
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "Cleared!",
      description: "Translation history cleared",
    });
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Smile className="text-4xl text-yellow-500" />
          Emoji Translator
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Translate your text into emojis and vice versa. Express yourself with the universal language of emojis!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Translation Area */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Translation
              </CardTitle>
              <CardDescription>
                Choose your translation type and start translating
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={translationType} onValueChange={(value: any) => setTranslationType(value)}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="text-to-emoji" className="flex items-center gap-2">
                    <Smile className="h-4 w-4" />
                    Text to Emoji
                  </TabsTrigger>
                  <TabsTrigger value="emoji-to-text" className="flex items-center gap-2">
                    <Languages className="h-4 w-4" />
                    Emoji to Text
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-translate"
                    checked={autoTranslate}
                    onCheckedChange={setAutoTranslate}
                  />
                  <Label htmlFor="auto-translate">Auto-translate on input</Label>
                </div>

                <div>
                  <Label htmlFor="input">Input Text</Label>
                  <Textarea
                    id="input"
                    placeholder={translationType === "text-to-emoji" ? "Enter text to translate to emojis..." : "Enter emojis to translate to text..."}
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      if (autoTranslate && e.target.value.trim()) {
                        setTimeout(() => handleTranslate(), 1000);
                      }
                    }}
                    className="min-h-[120px]"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleTranslate} 
                    disabled={!inputText.trim() || isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Translate
                  </Button>
                  <Button variant="outline" onClick={handleFavorite}>
                    <Heart className={`h-4 w-4 ${favorites.includes(inputText) ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>

                <div>
                  <Label htmlFor="output">Translation Result</Label>
                  <div className="relative">
                    <Textarea
                      id="output"
                      value={outputText}
                      readOnly
                      className="min-h-[120px] bg-muted"
                      placeholder="Translation will appear here..."
                    />
                    {outputText && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCopy}
                        className="absolute top-2 right-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Emojis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Emojis</CardTitle>
              <CardDescription>Common emojis for quick access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {["😊", "❤️", "😂", "🎉", "👍", "🔥", "✨", "🌟", "💪", "🎯", "🚀", "💡"].map((emoji) => (
                  <Button
                    key={emoji}
                    variant="outline"
                    size="sm"
                    className="text-2xl p-2 h-12 w-12"
                    onClick={() => setInputText(prev => prev + emoji)}
                  >
                    {emoji}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Favorites */}
          {favorites.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Favorites</CardTitle>
                <CardDescription>Your saved translations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {favorites.slice(0, 5).map((favorite, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm truncate">{favorite}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setFavorites(prev => prev.filter((_, i) => i !== index))}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* History */}
          {history.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">History</CardTitle>
                  <Button size="sm" variant="ghost" onClick={clearHistory}>
                    Clear
                  </Button>
                </div>
                <CardDescription>Recent translations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-2 bg-muted rounded cursor-pointer hover:bg-muted/80" onClick={() => {
                      setInputText(item.original);
                      setOutputText(item.translated);
                      setTranslationType(item.type);
                    }}>
                      <div className="text-sm font-medium">{item.original}</div>
                      <div className="text-xs text-muted-foreground">{item.translated}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmojiTranslator;
