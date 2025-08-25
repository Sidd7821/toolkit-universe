import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Hash, Copy, Sparkles, Trash2, Plus, Instagram } from "lucide-react";

// Categories and their associated hashtags
const hashtagCategories = {
  travel: [
    "travel", "wanderlust", "travelgram", "instatravel", "adventure", "vacation", "explore", "traveling", 
    "holiday", "travelphotography", "nature", "trip", "traveltheworld", "igtravel", "travelblogger", 
    "tourism", "traveler", "traveladdict", "beautifuldestinations", "travelholic", "travellife", "traveldiary"
  ],
  food: [
    "food", "foodporn", "foodie", "instafood", "yummy", "delicious", "dinner", "foodphotography", 
    "lunch", "tasty", "homemade", "healthyfood", "breakfast", "foodstagram", "foodblogger", "foodlover", 
    "cooking", "chef", "eeeeeats", "nomnom", "foodgasm", "foodies", "foodpics", "foodpic"
  ],
  fashion: [
    "fashion", "style", "ootd", "outfit", "fashionblogger", "streetstyle", "instafashion", "fashionista", 
    "stylish", "outfitoftheday", "fashionstyle", "streetwear", "fashionable", "fashionblog", "styleblogger", 
    "lookbook", "whatiwore", "fashiongram", "fashionaddict", "styleinspo", "fashionweek", "trendy"
  ],
  fitness: [
    "fitness", "gym", "workout", "fit", "training", "health", "motivation", "fitnessmotivation", 
    "bodybuilding", "lifestyle", "healthy", "sport", "fitfam", "gymlife", "exercise", "muscle", 
    "strong", "cardio", "personaltrainer", "weightloss", "fitnessjourney", "gains", "fitnessaddict"
  ],
  beauty: [
    "beauty", "makeup", "skincare", "hair", "beautiful", "cosmetics", "makeupartist", "mua", 
    "makeuptutorial", "makeuplover", "makeupjunkie", "instamakeup", "makeuplook", "makeupoftheday", 
    "makeupbyme", "makeupmafia", "makeupforever", "makeupblogger", "makeupobsessed", "makeuplove"
  ],
  photography: [
    "photography", "photo", "photooftheday", "photographer", "naturephotography", "travelphotography", 
    "portrait", "landscape", "canon", "nikon", "sony", "photoshoot", "streetphotography", "photogram", 
    "portraitphotography", "landscapephotography", "photodaily", "photographylovers", "mobilephotography"
  ],
  art: [
    "art", "artist", "drawing", "artwork", "illustration", "painting", "sketch", "creative", 
    "design", "draw", "artistsoninstagram", "digitalart", "arte", "artistic", "artoftheday", 
    "instaart", "contemporaryart", "artgallery", "modernart", "abstractart", "artsy", "fineart"
  ],
  business: [
    "business", "entrepreneur", "success", "marketing", "motivation", "entrepreneurship", "money", 
    "startup", "smallbusiness", "businessowner", "entrepreneurlife", "mindset", "hustle", "leadership", 
    "inspiration", "goals", "businesstips", "digitalmarketing", "businesscoach", "businessmindset"
  ],
  pets: [
    "pets", "dog", "cat", "dogs", "cats", "puppy", "kitten", "dogsofinstagram", "catsofinstagram", 
    "pet", "dogstagram", "catstagram", "doglover", "catlover", "instadog", "instacat", "petstagram", 
    "puppylove", "doglife", "catlife", "adoptdontshop", "rescuedog", "rescuecat", "petsofinstagram"
  ],
  nature: [
    "nature", "naturephotography", "landscape", "outdoors", "mountains", "hiking", "sunset", "beach", 
    "ocean", "sea", "sky", "naturelovers", "naturelover", "wildlife", "forest", "adventure", "earth", 
    "mothernature", "naturegram", "natureaddict", "natureperfection", "landscapephotography", "wilderness"
  ],
  technology: [
    "technology", "tech", "innovation", "coding", "programming", "developer", "software", "computer", 
    "ai", "artificialintelligence", "machinelearning", "datascience", "cybersecurity", "blockchain", 
    "iot", "internetofthings", "gadgets", "smartphone", "apple", "android", "webdevelopment", "techie"
  ],
  motivation: [
    "motivation", "inspiration", "quotes", "success", "mindset", "goals", "positivevibes", "believe", 
    "positivity", "selflove", "growth", "entrepreneur", "hustle", "grind", "nevergiveup", "determination", 
    "ambition", "focus", "discipline", "hardwork", "dedication", "perseverance", "consistency", "patience"
  ]
};

// Popular hashtags
const popularHashtags = [
  "love", "instagood", "photooftheday", "fashion", "beautiful", "happy", "cute", "tbt", "like4like", 
  "followme", "picoftheday", "follow", "me", "selfie", "summer", "instadaily", "friends", "repost", 
  "nature", "girl", "fun", "style", "smile", "food", "instalike", "likeforlike", "family", "travel", 
  "fitness", "igers", "tagsforlikes", "follow4follow", "nofilter", "life", "beauty", "amazing", 
  "instagram", "photography", "vscocam", "sun", "photo", "music", "beach", "sunset"
];

const InstagramHashtagGenerator = () => {
  const { toast } = useToast();
  
  // State for user inputs
  const [topic, setTopic] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [customHashtags, setCustomHashtags] = useState<string>("");
  const [hashtagCount, setHashtagCount] = useState<number>(15);
  const [includePopular, setIncludePopular] = useState<boolean>(true);
  
  // State for generated hashtags
  const [generatedHashtags, setGeneratedHashtags] = useState<string[]>([]);
  const [savedHashtagSets, setSavedHashtagSets] = useState<{name: string, hashtags: string[]}[]>([]);
  
  // Load saved hashtag sets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("savedHashtagSets");
    if (saved) {
      try {
        setSavedHashtagSets(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved hashtag sets", e);
      }
    }
  }, []);
  
  // Save hashtag sets to localStorage when updated
  useEffect(() => {
    if (savedHashtagSets.length > 0) {
      localStorage.setItem("savedHashtagSets", JSON.stringify(savedHashtagSets));
    }
  }, [savedHashtagSets]);
  
  // Generate hashtags based on inputs
  const generateHashtags = () => {
    let hashtags: string[] = [];
    let availableHashtags: string[] = [];
    
    // Add hashtags from selected category
    if (selectedCategory && hashtagCategories[selectedCategory as keyof typeof hashtagCategories]) {
      availableHashtags = [
        ...availableHashtags,
        ...hashtagCategories[selectedCategory as keyof typeof hashtagCategories]
      ];
    }
    
    // Add popular hashtags if selected
    if (includePopular) {
      availableHashtags = [...availableHashtags, ...popularHashtags];
    }
    
    // Add custom hashtags if provided
    if (customHashtags.trim()) {
      const customTags = customHashtags
        .trim()
        .split(/[\s,]+/)
        .map(tag => tag.startsWith('#') ? tag.substring(1) : tag)
        .filter(tag => tag.length > 0);
      
      availableHashtags = [...availableHashtags, ...customTags];
    }
    
    // Add topic as a hashtag if provided
    if (topic.trim()) {
      const topicWords = topic
        .trim()
        .toLowerCase()
        .split(/\s+/)
        .map(word => word.replace(/[^a-z0-9]/g, ''));
      
      // Add individual words and combinations
      availableHashtags = [
        ...availableHashtags,
        ...topicWords,
        ...topicWords.filter(w => w.length > 3).map(word => `${selectedCategory}${word}`),
        topicWords.join(''),
        `${selectedCategory}${topicWords.join('')}`
      ].filter(tag => tag && tag.length > 1);
    }
    
    // Remove duplicates and empty tags
    availableHashtags = [...new Set(availableHashtags)].filter(tag => tag && tag.length > 0);
    
    // Shuffle and select the requested number of hashtags
    for (let i = availableHashtags.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableHashtags[i], availableHashtags[j]] = [availableHashtags[j], availableHashtags[i]];
    }
    
    hashtags = availableHashtags.slice(0, hashtagCount);
    
    if (hashtags.length === 0) {
      toast({
        title: "No Hashtags Generated",
        description: "Please select a category, enter a topic, or add custom hashtags",
        variant: "destructive"
      });
      return;
    }
    
    setGeneratedHashtags(hashtags);
    
    toast({
      title: "Hashtags Generated",
      description: `Generated ${hashtags.length} hashtags for your post`
    });
  };
  
  // Format hashtags for display or copying
  const formatHashtags = (hashtags: string[]): string => {
    return hashtags.map(tag => `#${tag}`).join(' ');
  };
  
  // Copy hashtags to clipboard
  const copyHashtags = () => {
    const formattedHashtags = formatHashtags(generatedHashtags);
    navigator.clipboard.writeText(formattedHashtags);
    
    toast({
      title: "Copied to Clipboard",
      description: "Hashtags copied to clipboard"
    });
  };
  
  // Save current hashtag set
  const saveHashtagSet = () => {
    if (generatedHashtags.length === 0) {
      toast({
        title: "No Hashtags to Save",
        description: "Generate hashtags first before saving",
        variant: "destructive"
      });
      return;
    }
    
    const setName = prompt("Enter a name for this hashtag set:");
    if (!setName) return;
    
    const newSet = {
      name: setName,
      hashtags: [...generatedHashtags]
    };
    
    setSavedHashtagSets([...savedHashtagSets, newSet]);
    
    toast({
      title: "Hashtag Set Saved",
      description: `Saved ${generatedHashtags.length} hashtags as "${setName}"`
    });
  };
  
  // Load a saved hashtag set
  const loadHashtagSet = (index: number) => {
    if (index >= 0 && index < savedHashtagSets.length) {
      setGeneratedHashtags(savedHashtagSets[index].hashtags);
      
      toast({
        title: "Hashtag Set Loaded",
        description: `Loaded "${savedHashtagSets[index].name}" hashtag set`
      });
    }
  };
  
  // Delete a saved hashtag set
  const deleteHashtagSet = (index: number) => {
    if (index >= 0 && index < savedHashtagSets.length) {
      const setName = savedHashtagSets[index].name;
      const newSets = [...savedHashtagSets];
      newSets.splice(index, 1);
      setSavedHashtagSets(newSets);
      
      // Update localStorage
      if (newSets.length > 0) {
        localStorage.setItem("savedHashtagSets", JSON.stringify(newSets));
      } else {
        localStorage.removeItem("savedHashtagSets");
      }
      
      toast({
        title: "Hashtag Set Deleted",
        description: `Deleted "${setName}" hashtag set`
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          <span>Instagram Hashtag Generator</span>
        </CardTitle>
        <CardDescription>
          Generate optimized hashtags for your Instagram posts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Generator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Post Topic or Description</Label>
              <Input
                id="topic"
                placeholder="What is your post about?"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                Describe your post to generate more relevant hashtags
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(hashtagCategories).map((category) => (
                    <SelectItem key={category} value={category}>
                      <span className="capitalize">{category}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customHashtags">Custom Hashtags (optional)</Label>
              <Textarea
                id="customHashtags"
                placeholder="Enter custom hashtags separated by spaces or commas"
                value={customHashtags}
                onChange={(e) => setCustomHashtags(e.target.value)}
                rows={3}
              />
              <p className="text-sm text-muted-foreground">
                Add your own hashtags to include in the generated set
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="hashtagCount">Number of Hashtags: {hashtagCount}</Label>
              </div>
              <Slider
                id="hashtagCount"
                min={5}
                max={30}
                step={1}
                value={[hashtagCount]}
                onValueChange={(values) => setHashtagCount(values[0])}
              />
              <p className="text-sm text-muted-foreground">
                Instagram allows up to 30 hashtags per post
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="includePopular"
                checked={includePopular}
                onChange={(e) => setIncludePopular(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="includePopular">Include Popular Hashtags</Label>
            </div>
            
            <Button 
              onClick={generateHashtags}
              className="w-full flex items-center gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Generate Hashtags
            </Button>
          </div>
          
          {/* Right Column - Results */}
          <div className="space-y-4">
            {/* Generated Hashtags */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Generated Hashtags</h3>
              
              {generatedHashtags.length > 0 ? (
                <div className="p-4 border rounded-lg space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {generatedHashtags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      onClick={copyHashtags}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Copy className="h-4 w-4" />
                      Copy All
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={saveHashtagSet}
                      className="flex items-center gap-2 flex-1"
                    >
                      <Plus className="h-4 w-4" />
                      Save Set
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Generated hashtags will appear here</p>
                </div>
              )}
            </div>
            
            {/* Saved Hashtag Sets */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Saved Hashtag Sets</h3>
              
              {savedHashtagSets.length > 0 ? (
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                  {savedHashtagSets.map((set, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{set.name}</h4>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => loadHashtagSet(index)}
                            title="Load this hashtag set"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => deleteHashtagSet(index)}
                            title="Delete this hashtag set"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {set.hashtags.slice(0, 5).map(tag => `#${tag}`).join(' ')}
                        {set.hashtags.length > 5 ? ` ... +${set.hashtags.length - 5} more` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <p>No saved hashtag sets</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Hashtag Tips */}
        <div className="p-4 bg-muted rounded-lg">
          <h3 className="font-medium mb-2">Hashtag Tips</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Mix popular and niche hashtags for better reach</li>
            <li>Use relevant hashtags that accurately describe your content</li>
            <li>Consider using branded or personal hashtags to build recognition</li>
            <li>Avoid banned or flagged hashtags that could limit your post's visibility</li>
            <li>Update your hashtag strategy regularly based on performance</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InstagramHashtagGenerator;