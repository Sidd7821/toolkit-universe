import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Cookie, 
  Copy, 
  RefreshCw, 
  Share2, 
  Download,
  Heart,
  Sparkles
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FortuneCookieGenerator = () => {
  const { toast } = useToast();
  
  const [fortune, setFortune] = useState<string>("");
  const [category, setCategory] = useState<string>("wisdom");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showLuckyNumbers, setShowLuckyNumbers] = useState<boolean>(true);
  const [luckyNumbers, setLuckyNumbers] = useState<number[]>([]);
  const [customName, setCustomName] = useState<string>("");
  const [useCustomName, setUseCustomName] = useState<boolean>(false);
  const [animation, setAnimation] = useState<boolean>(false);
  
  // Fortune categories
  const categories = [
    { id: "wisdom", name: "Wisdom" },
    { id: "success", name: "Success" },
    { id: "love", name: "Love" },
    { id: "happiness", name: "Happiness" },
    { id: "funny", name: "Funny" },
    { id: "inspirational", name: "Inspirational" },
  ];
  
  // Fortune collections by category
  const fortuneCollections: Record<string, string[]> = {
    wisdom: [
      "The greatest wisdom is in simplicity.",
      "Your road to glory will be rocky but fulfilling.",
      "Courage is not the absence of fear; it is the conquest of it.",
      "Patience is your ally at the moment. Don't worry!",
      "Nothing is impossible to a willing heart.",
      "The wise person shares with others and receives happiness in return.",
      "A problem is a chance for you to do your best.",
      "The greatest risk is not taking one.",
      "You will make many changes before settling down happily.",
      "A lifetime of happiness awaits you.",
      "Your principles mean more to you than any money or success.",
      "Small opportunities are often the beginning of great achievements.",
      "A smile is your passport into the hearts of others.",
      "Your ability to juggle many tasks will take you far.",
      "You already know the answer to the questions lingering inside your head."
    ],
    success: [
      "Your hard work is about to pay off. Remember, patience is a virtue.",
      "The greatest achievement in life is to stand up again after falling.",
      "Your talents will be recognized and suitably rewarded.",
      "Good things come to those who wait. Be patient.",
      "You will soon be crossing the great waters.",
      "The smart thing to do is to begin trusting your intuitions.",
      "New financial resources will soon become available to you.",
      "You will conquer obstacles to achieve success.",
      "Success is a journey, not a destination.",
      "Your mentality is alert, practical, and analytical.",
      "Your dynamic and efficient nature will lead you to success.",
      "Your dreams are achievable; the time to pursue them is now.",
      "A lifetime of happiness awaits you.",
      "You will be successful in your work.",
      "Your ingenuity and imagination will get results."
    ],
    love: [
      "The love of your life will appear in front of you unexpectedly!",
      "Your heart will skip a beat when someone special walks into your life.",
      "Love, because it is the only true adventure.",
      "The love of your life is right in front of your eyes.",
      "Follow what calls you and love will follow.",
      "Love asks you to trust what you cannot see.",
      "Love is like wildflowers... it's often found in the most unlikely places.",
      "A very attractive person has a message for you.",
      "The one you love is closer than you think.",
      "You will find your perfect match within the year.",
      "That special someone loves you more than you know.",
      "Love is like a river, always changing but always finding you.",
      "Your heart knows the answer, listen to it.",
      "A dream you have will come true when you least expect it.",
      "The greatest happiness of life is the conviction that we are loved."
    ],
    happiness: [
      "You will always be surrounded by true friends.",
      "Happiness isn't about getting what you want all the time, it's about loving what you have.",
      "Your smile lights up everyone's day.",
      "You will live a long, happy life.",
      "Happiness is not a destination, it is a way of life.",
      "The greatest joy comes from giving joy to others.",
      "You will soon bring joy to someone.",
      "Your happiness is intertwined with your outlook on life.",
      "You will be unusually successful in business.",
      "Your smile brings happiness to everyone you meet.",
      "You will travel to many exotic places in your lifetime.",
      "Happiness is a choice, not a result.",
      "You will live a long, prosperous life.",
      "Your life will be happy and peaceful.",
      "The joy in your heart will stay with you forever."
    ],
    funny: [
      "Help! I'm being held prisoner in a fortune cookie factory!",
      "You will receive a fortune cookie soon.",
      "That wasn't chicken in your chicken noodles.",
      "You are not illiterate.",
      "If a turtle doesn't have a shell, is it naked or homeless?",
      "About time I got out of that cookie.",
      "Run.",
      "The fortune you seek is in another cookie.",
      "A closed mouth gathers no feet.",
      "You will die alone and poorly dressed.",
      "A conclusion is simply the place where you got tired of thinking.",
      "If you think nobody cares if you're alive, try missing a couple of payments.",
      "Never forget a friend. Especially if they owe you.",
      "Ignore previous cookie.",
      "Your pet is planning world domination."
    ],
    inspirational: [
      "Your possibilities are endless.",
      "You are capable of more than you know.",
      "Great things never came from comfort zones.",
      "Dream big and dare to fail.",
      "Every day is a second chance.",
      "The best way to predict the future is to create it.",
      "Believe you can and you're halfway there.",
      "It's not the years in your life that count. It's the life in your years.",
      "Change the world by being yourself.",
      "Every moment is a fresh beginning.",
      "Never regret anything that made you smile.",
      "Die with memories, not dreams.",
      "Aspire to inspire before we expire.",
      "Everything you can imagine is real.",
      "Simplicity is the ultimate sophistication."
    ],
  };
  
  // Generate a new fortune
  const generateFortune = () => {
    setIsLoading(true);
    setAnimation(true);
    
    // Simulate loading delay
    setTimeout(() => {
      try {
        // Get fortunes for selected category
        const fortunes = fortuneCollections[category] || fortuneCollections.wisdom;
        
        // Select random fortune
        const randomIndex = Math.floor(Math.random() * fortunes.length);
        let newFortune = fortunes[randomIndex];
        
        // Add custom name if enabled
        if (useCustomName && customName.trim()) {
          // List of templates to insert the name
          const nameTemplates = [
            `${customName}, {fortune}`,
            `Dear ${customName}, {fortune}`,
            `{fortune}, ${customName}.`,
            `For ${customName}: {fortune}`,
            `${customName} - {fortune}`
          ];
          
          // Select random template
          const templateIndex = Math.floor(Math.random() * nameTemplates.length);
          newFortune = nameTemplates[templateIndex].replace('{fortune}', newFortune.toLowerCase());
        }
        
        setFortune(newFortune);
        
        // Generate lucky numbers if enabled
        if (showLuckyNumbers) {
          generateLuckyNumbers();
        }
        
        toast({
          title: "New Fortune",
          description: "Your fortune has been revealed!"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to generate fortune. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        // Keep animation for a bit longer than loading state
        setTimeout(() => setAnimation(false), 500);
      }
    }, 1000);
  };
  
  // Generate lucky numbers
  const generateLuckyNumbers = () => {
    const numbers: number[] = [];
    const usedNumbers = new Set<number>();
    
    // Generate 6 unique numbers between 1 and 49
    while (numbers.length < 6) {
      const num = Math.floor(Math.random() * 49) + 1;
      if (!usedNumbers.has(num)) {
        usedNumbers.add(num);
        numbers.push(num);
      }
    }
    
    // Sort numbers
    numbers.sort((a, b) => a - b);
    setLuckyNumbers(numbers);
  };
  
  // Copy fortune to clipboard
  const copyFortune = () => {
    let textToCopy = fortune;
    
    if (showLuckyNumbers && luckyNumbers.length > 0) {
      textToCopy += `\n\nLucky Numbers: ${luckyNumbers.join(', ')}`;
    }
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      toast({
        title: "Copied",
        description: "Fortune copied to clipboard"
      });
    }).catch(err => {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };
  
  // Share fortune
  const shareFortune = () => {
    if (navigator.share) {
      let textToShare = fortune;
      
      if (showLuckyNumbers && luckyNumbers.length > 0) {
        textToShare += `\n\nLucky Numbers: ${luckyNumbers.join(', ')}`;
      }
      
      navigator.share({
        title: 'My Fortune Cookie',
        text: textToShare,
      }).then(() => {
        toast({
          title: "Shared",
          description: "Fortune shared successfully"
        });
      }).catch(err => {
        toast({
          title: "Share Failed",
          description: "Could not share fortune",
          variant: "destructive"
        });
      });
    } else {
      copyFortune();
    }
  };
  
  // Download fortune as image
  const downloadFortuneImage = () => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      canvas.width = 600;
      canvas.height = 400;
      
      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#f5f5f5');
      gradient.addColorStop(1, '#e0e0e0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw fortune cookie image
      ctx.fillStyle = '#f0c755';
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, 120, 100, 60, 0, 0, 2 * Math.PI);
      ctx.fill();
      ctx.strokeStyle = '#d4a93e';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw crack line
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 80, 120);
      ctx.bezierCurveTo(
        canvas.width / 2 - 40, 100,
        canvas.width / 2 + 40, 140,
        canvas.width / 2 + 80, 120
      );
      ctx.stroke();
      
      // Draw fortune text
      ctx.fillStyle = '#333';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Your Fortune', canvas.width / 2, 220);
      
      // Draw divider
      ctx.strokeStyle = '#d4a93e';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 100, 240);
      ctx.lineTo(canvas.width / 2 + 100, 240);
      ctx.stroke();
      
      // Draw main fortune text
      ctx.font = '16px Arial';
      
      // Wrap text
      const maxWidth = 400;
      const words = fortune.split(' ');
      let line = '';
      let y = 270;
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && i > 0) {
          ctx.fillText(line, canvas.width / 2, y);
          line = words[i] + ' ';
          y += 25;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, canvas.width / 2, y);
      
      // Draw lucky numbers if enabled
      if (showLuckyNumbers && luckyNumbers.length > 0) {
        y += 40;
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Lucky Numbers', canvas.width / 2, y);
        
        y += 25;
        ctx.font = '16px Arial';
        ctx.fillText(luckyNumbers.join(' - '), canvas.width / 2, y);
      }
      
      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'fortune-cookie.png';
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Image Downloaded",
        description: "Fortune image has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate fortune image",
        variant: "destructive"
      });
    }
  };
  
  // Generate initial fortune on component mount
  useEffect(() => {
    generateFortune();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cookie className="h-6 w-6" />
          <span>Fortune Cookie Generator</span>
        </CardTitle>
        <CardDescription>
          Discover your fortune and lucky numbers with our virtual fortune cookies
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Fortune display */}
          <div className={`relative p-8 border-2 border-amber-200 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-center ${animation ? 'animate-pulse' : ''}`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-background p-2 rounded-full border-2 border-amber-200">
              <Cookie className="h-6 w-6 text-amber-500" />
            </div>
            
            {fortune ? (
              <div className="space-y-4">
                <p className="text-xl font-medium italic">"{fortune}"</p>
                
                {showLuckyNumbers && luckyNumbers.length > 0 && (
                  <div className="pt-4 border-t border-amber-200">
                    <p className="text-sm font-medium text-amber-700 dark:text-amber-300">Lucky Numbers</p>
                    <div className="flex justify-center gap-2 mt-2">
                      {luckyNumbers.map((num, index) => (
                        <div 
                          key={index} 
                          className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold"
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500">Click "Crack Open" to reveal your fortune</p>
            )}
          </div>
          
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Fortune Category</Label>
                <Select 
                  value={category} 
                  onValueChange={setCategory}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="lucky-numbers" 
                  checked={showLuckyNumbers}
                  onCheckedChange={setShowLuckyNumbers}
                />
                <Label htmlFor="lucky-numbers">Show Lucky Numbers</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="custom-name" 
                  checked={useCustomName}
                  onCheckedChange={setUseCustomName}
                />
                <Label htmlFor="custom-name">Personalize Fortune</Label>
              </div>
              
              {useCustomName && (
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input 
                    id="name" 
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4 flex flex-col justify-between">
              <Button 
                onClick={generateFortune} 
                disabled={isLoading}
                className="w-full h-16 text-lg"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Cracking Open...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Crack Open a New Fortune
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  onClick={copyFortune}
                  disabled={!fortune || isLoading}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button 
                  variant="outline" 
                  onClick={shareFortune}
                  disabled={!fortune || isLoading}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share
                </Button>
                <Button 
                  variant="outline" 
                  onClick={downloadFortuneImage}
                  disabled={!fortune || isLoading}
                >
                  <Download className="h-4 w-4 mr-2" /> Save
                </Button>
              </div>
            </div>
          </div>
          
          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            <p>Made with <Heart className="inline h-3 w-3 text-red-500" /> for good fortune</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FortuneCookieGenerator;