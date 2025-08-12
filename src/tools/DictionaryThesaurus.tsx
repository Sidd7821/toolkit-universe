import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, BookOpen, Volume2, Copy, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface WordDefinition {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
    synonyms: string[];
    antonyms: string[];
  }[];
  origin?: string;
}

const DictionaryThesaurus = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<WordDefinition | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) setRecentSearches(JSON.parse(saved));
  }, []);

  // Save recent searches
  useEffect(() => {
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }, [recentSearches]);

  const searchWord = async () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      toast({
        title: "No search term",
        description: "Please enter a word to search for.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    setSearchResults(null);

    try {
      const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${term}`);
      if (!res.ok) throw new Error("Word not found");
      const data = await res.json();

      const result: WordDefinition = {
        word: data[0]?.word || term,
        phonetic: data[0]?.phonetic,
        meanings: data[0]?.meanings || [],
        origin: data[0]?.origin,
      };

      setSearchResults(result);

      if (!recentSearches.includes(term)) {
        setRecentSearches((prev) => [term, ...prev.slice(0, 4)]);
      }

      toast({
        title: "Word found",
        description: `Found definition for "${term}"`,
      });
    } catch {
      toast({
        title: "Word not found",
        description: `No definition found for "${term}".`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `"${text}" copied to clipboard.`,
    });
  };

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      speechSynthesis.speak(utterance);
    } else {
      toast({
        title: "Speech not supported",
        description: "Your browser doesn't support text-to-speech.",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchWord();
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Dictionary & Thesaurus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter a word..."
                className="pl-10"
              />
            </div>
            <Button onClick={searchWord} disabled={isSearching}>
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Searches</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {recentSearches.map((word, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm(word);
                  searchWord();
                }}
              >
                {word}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {searchResults && (
        <>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold">{searchResults.word}</h2>
                  {searchResults.phonetic && (
                    <p className="text-lg text-muted-foreground">{searchResults.phonetic}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => speakWord(searchResults.word)}>
                    <Volume2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(searchResults.word)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="definitions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="definitions">Definitions</TabsTrigger>
              <TabsTrigger value="synonyms">Synonyms</TabsTrigger>
              <TabsTrigger value="antonyms">Antonyms</TabsTrigger>
            </TabsList>

            {/* Definitions */}
            <TabsContent value="definitions" className="space-y-4">
              {searchResults.meanings.map((meaning, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      <CardTitle className="text-lg capitalize">{meaning.partOfSpeech}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {meaning.definitions.map((def, i) => (
                      <div key={i} className="mb-3">
                        <p>{def.definition}</p>
                        {def.example && <p className="italic mt-1">"{def.example}"</p>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Synonyms */}
            <TabsContent value="synonyms">
              <Card>
                <CardHeader>
                  <CardTitle>Synonyms</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {searchResults.meanings.flatMap((m) => m.synonyms).length > 0
                    ? searchResults.meanings.flatMap((m) => m.synonyms).map((syn, i) => (
                        <Badge key={i} variant="secondary">
                          {syn}
                        </Badge>
                      ))
                    : <p className="text-muted-foreground">No synonyms found.</p>}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Antonyms */}
            <TabsContent value="antonyms">
              <Card>
                <CardHeader>
                  <CardTitle>Antonyms</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {searchResults.meanings.flatMap((m) => m.antonyms).length > 0
                    ? searchResults.meanings.flatMap((m) => m.antonyms).map((ant, i) => (
                        <Badge key={i} variant="outline">
                          {ant}
                        </Badge>
                      ))
                    : <p className="text-muted-foreground">No antonyms found.</p>}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* External Links */}
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">More references:</p>
              <div className="flex justify-center gap-3">
                <a href={`https://www.merriam-webster.com/dictionary/${searchResults.word}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" /> Merriam-Webster
                  </Button>
                </a>
                <a href={`https://www.oxfordlearnersdictionaries.com/definition/english/${searchResults.word}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" /> Oxford
                  </Button>
                </a>
                <a href={`https://dictionary.cambridge.org/dictionary/english/${searchResults.word}`} target="_blank" rel="noreferrer">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" /> Cambridge
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default DictionaryThesaurus;
