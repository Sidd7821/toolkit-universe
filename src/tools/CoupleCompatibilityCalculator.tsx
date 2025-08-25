import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Sparkles, Star, Zap, ArrowRight, RefreshCw } from "lucide-react";

interface CompatibilityResult {
  overall: number;
  love: number;
  communication: number;
  trust: number;
  passion: number;
  friendship: number;
  message: string;
  compatibility: 'excellent' | 'good' | 'fair' | 'poor';
}

interface PersonData {
  name: string;
  birthDate: string;
  zodiacSign: string;
  personality: string;
  interests: string[];
  values: string[];
}

const CoupleCompatibilityCalculator = () => {
  const [person1, setPerson1] = useState<PersonData>({
    name: '',
    birthDate: '',
    zodiacSign: '',
    personality: '',
    interests: [],
    values: []
  });

  const [person2, setPerson2] = useState<PersonData>({
    name: '',
    birthDate: '',
    zodiacSign: '',
    personality: '',
    interests: [],
    values: []
  });

  const [result, setResult] = useState<CompatibilityResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const zodiacSigns = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  ];

  const personalityTypes = [
    'Extroverted', 'Introverted', 'Analytical', 'Creative', 'Practical', 'Idealistic',
    'Spontaneous', 'Planned', 'Competitive', 'Cooperative', 'Traditional', 'Progressive'
  ];

  const interestCategories = [
    'Art & Music', 'Sports & Fitness', 'Technology', 'Nature & Outdoors',
    'Reading & Learning', 'Travel', 'Cooking', 'Gaming', 'Fashion', 'Science'
  ];

  const valueCategories = [
    'Family', 'Career', 'Adventure', 'Stability', 'Creativity', 'Security',
    'Independence', 'Community', 'Growth', 'Tradition', 'Innovation', 'Balance'
  ];

  const handlePersonChange = (person: 'person1' | 'person2', field: keyof PersonData, value: any) => {
    if (person === 'person1') {
      setPerson1(prev => ({ ...prev, [field]: value }));
    } else {
      setPerson2(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleInterestToggle = (person: 'person1' | 'person2', interest: string) => {
    const currentPerson = person === 'person1' ? person1 : person2;
    const currentInterests = currentPerson.interests;
    
    if (currentInterests.includes(interest)) {
      const newInterests = currentInterests.filter(i => i !== interest);
      handlePersonChange(person, 'interests', newInterests);
    } else {
      const newInterests = [...currentInterests, interest];
      handlePersonChange(person, 'interests', newInterests);
    }
  };

  const handleValueToggle = (person: 'person1' | 'person2', value: string) => {
    const currentPerson = person === 'person1' ? person1 : person2;
    const currentValues = currentPerson.values;
    
    if (currentValues.includes(value)) {
      const newValues = currentValues.filter(v => v !== value);
      handlePersonChange(person, 'values', newValues);
    } else {
      const newValues = [...currentValues, value];
      handlePersonChange(person, 'values', newValues);
    }
  };

  const calculateCompatibility = () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    setTimeout(() => {
      const compatibility = performCompatibilityCalculation();
      setResult(compatibility);
      setIsCalculating(false);
    }, 2000);
  };

  const performCompatibilityCalculation = (): CompatibilityResult => {
    // This is a fun, fictional calculation for entertainment purposes
    let love = 0;
    let communication = 0;
    let trust = 0;
    let passion = 0;
    let friendship = 0;

    // Zodiac compatibility (simplified)
    if (person1.zodiacSign && person2.zodiacSign) {
      const compatibleSigns: { [key: string]: string[] } = {
        'Aries': ['Leo', 'Sagittarius', 'Gemini'],
        'Taurus': ['Virgo', 'Capricorn', 'Cancer'],
        'Gemini': ['Libra', 'Aquarius', 'Aries'],
        'Cancer': ['Scorpio', 'Pisces', 'Taurus'],
        'Leo': ['Aries', 'Sagittarius', 'Libra'],
        'Virgo': ['Taurus', 'Capricorn', 'Scorpio'],
        'Libra': ['Gemini', 'Aquarius', 'Leo'],
        'Scorpio': ['Cancer', 'Pisces', 'Virgo'],
        'Sagittarius': ['Aries', 'Leo', 'Aquarius'],
        'Capricorn': ['Taurus', 'Virgo', 'Pisces'],
        'Aquarius': ['Gemini', 'Libra', 'Sagittarius'],
        'Pisces': ['Cancer', 'Scorpio', 'Capricorn']
      };

      if (compatibleSigns[person1.zodiacSign]?.includes(person2.zodiacSign)) {
        love += 20;
        passion += 15;
      }
    }

    // Interest compatibility
    const commonInterests = person1.interests.filter(i => person2.interests.includes(i));
    const interestScore = (commonInterests.length / Math.max(person1.interests.length, person2.interests.length)) * 30;
    friendship += interestScore;
    love += interestScore * 0.5;

    // Value compatibility
    const commonValues = person1.values.filter(v => person2.values.includes(v));
    const valueScore = (commonValues.length / Math.max(person1.values.length, person2.values.length)) * 25;
    trust += valueScore;
    communication += valueScore * 0.8;

    // Random factors for fun
    const randomFactor = Math.random() * 20;
    love += randomFactor;
    passion += randomFactor * 0.7;
    communication += randomFactor * 0.5;
    trust += randomFactor * 0.6;
    friendship += randomFactor * 0.8;

    // Ensure scores are within 0-100 range
    love = Math.min(100, Math.max(0, love));
    communication = Math.min(100, Math.max(0, communication));
    trust = Math.min(100, Math.max(0, trust));
    passion = Math.min(100, Math.max(0, passion));
    friendship = Math.min(100, Math.max(0, friendship));

    const overall = Math.round((love + communication + trust + passion + friendship) / 5);

    let message = '';
    let compatibility: 'excellent' | 'good' | 'fair' | 'poor' = 'fair';

    if (overall >= 80) {
      compatibility = 'excellent';
      message = "🌟 Amazing! You two are a perfect match made in heaven! Your connection is incredibly strong and you're destined for a beautiful relationship together.";
    } else if (overall >= 65) {
      compatibility = 'good';
      message = "💕 Great compatibility! You have a strong foundation for a loving relationship. With some effort and communication, you can build something truly special.";
    } else if (overall >= 50) {
      compatibility = 'fair';
      message = "🤝 Good potential! While you have some differences, there's definitely room for growth. Focus on understanding each other better.";
    } else {
      compatibility = 'poor';
      message = "💭 Interesting challenge! You're quite different, which can lead to growth or conflicts. Communication and compromise will be key.";
    }

    return {
      overall,
      love: Math.round(love),
      communication: Math.round(communication),
      trust: Math.round(trust),
      passion: Math.round(passion),
      friendship: Math.round(friendship),
      message,
      compatibility
    };
  };

  const resetCalculator = () => {
    setPerson1({
      name: '',
      birthDate: '',
      zodiacSign: '',
      personality: '',
      interests: [],
      values: []
    });
    setPerson2({
      name: '',
      birthDate: '',
      zodiacSign: '',
      personality: '',
      interests: [],
      values: []
    });
    setResult(null);
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 65) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCompatibilityIcon = (score: number) => {
    if (score >= 80) return <Heart className="h-6 w-6 text-red-500" />;
    if (score >= 65) return <Star className="h-6 w-6 text-yellow-500" />;
    if (score >= 50) return <Zap className="h-6 w-6 text-blue-500" />;
    return <Sparkles className="h-6 w-6 text-purple-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Heart className="h-10 w-10 text-red-500" />
          Couple Compatibility Calculator
          <Heart className="h-10 w-10 text-red-500" />
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover your love compatibility percentage and explore the different aspects of your relationship potential
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Person 1 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-pink-600">
                <Heart className="h-5 w-5" />
                Person 1
              </CardTitle>
              <CardDescription>
                Enter the first person's details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="person1-name">Name</Label>
                <Input
                  id="person1-name"
                  value={person1.name}
                  onChange={(e) => handlePersonChange('person1', 'name', e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="person1-birth">Birth Date</Label>
                <Input
                  id="person1-birth"
                  type="date"
                  value={person1.birthDate}
                  onChange={(e) => handlePersonChange('person1', 'birthDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Zodiac Sign</Label>
                <Select value={person1.zodiacSign} onValueChange={(value) => handlePersonChange('person1', 'zodiacSign', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map(sign => (
                      <SelectItem key={sign} value={sign}>
                        {sign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Personality Type</Label>
                <Select value={person1.personality} onValueChange={(value) => handlePersonChange('person1', 'personality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select personality type" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interests</CardTitle>
              <CardDescription>
                Select interests that apply to Person 1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {interestCategories.map(interest => (
                  <button
                    key={interest}
                    className={`p-2 text-sm rounded border transition-all ${
                      person1.interests.includes(interest)
                        ? 'bg-pink-100 border-pink-300 text-pink-700'
                        : 'bg-background border-border hover:border-pink-300'
                    }`}
                    onClick={() => handleInterestToggle('person1', interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Values</CardTitle>
              <CardDescription>
                Select values that are important to Person 1
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {valueCategories.map(value => (
                  <button
                    key={value}
                    className={`p-2 text-sm rounded border transition-all ${
                      person1.values.includes(value)
                        ? 'bg-pink-100 border-pink-300 text-pink-700'
                        : 'bg-background border-border hover:border-pink-300'
                    }`}
                    onClick={() => handleValueToggle('person1', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Person 2 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Heart className="h-5 w-5" />
                Person 2
              </CardTitle>
              <CardDescription>
                Enter the second person's details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="person2-name">Name</Label>
                <Input
                  id="person2-name"
                  value={person2.name}
                  onChange={(e) => handlePersonChange('person2', 'name', e.target.value)}
                  placeholder="Enter name"
                />
              </div>
              
              <div>
                <Label htmlFor="person2-birth">Birth Date</Label>
                <Input
                  id="person2-birth"
                  type="date"
                  value={person2.birthDate}
                  onChange={(e) => handlePersonChange('person2', 'birthDate', e.target.value)}
                />
              </div>
              
              <div>
                <Label>Zodiac Sign</Label>
                <Select value={person2.zodiacSign} onValueChange={(value) => handlePersonChange('person2', 'zodiacSign', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select zodiac sign" />
                  </SelectTrigger>
                  <SelectContent>
                    {zodiacSigns.map(sign => (
                      <SelectItem key={sign} value={sign}>
                        {sign}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Personality Type</Label>
                <Select value={person2.personality} onValueChange={(value) => handlePersonChange('person2', 'personality', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select personality type" />
                  </SelectTrigger>
                  <SelectContent>
                    {personalityTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interests</CardTitle>
              <CardDescription>
                Select interests that apply to Person 2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {interestCategories.map(interest => (
                  <button
                    key={interest}
                    className={`p-2 text-sm rounded border transition-all ${
                      person2.interests.includes(interest)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-background border-border hover:border-blue-300'
                    }`}
                    onClick={() => handleInterestToggle('person2', interest)}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Values</CardTitle>
              <CardDescription>
                Select values that are important to Person 2
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {valueCategories.map(value => (
                  <button
                    key={value}
                    className={`p-2 text-sm rounded border transition-all ${
                      person2.values.includes(value)
                        ? 'bg-blue-100 border-blue-300 text-blue-700'
                        : 'bg-background border-border hover:border-blue-300'
                    }`}
                    onClick={() => handleValueToggle('person2', value)}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="text-center mt-8">
        <Button 
          onClick={calculateCompatibility} 
          size="lg" 
          disabled={!person1.name || !person2.name || isCalculating}
          className="px-8 py-4 text-lg"
        >
          {isCalculating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Calculating Love...
            </>
          ) : (
            <>
              Calculate Compatibility
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>
        
        <Button 
          onClick={resetCalculator} 
          variant="outline" 
          className="ml-4"
        >
          Reset
        </Button>
      </div>

      {/* Results */}
      {result && (
        <div className="mt-12">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-3">
                {getCompatibilityIcon(result.overall)}
                Compatibility Result
                {getCompatibilityIcon(result.overall)}
              </CardTitle>
              <CardDescription>
                Your love compatibility analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Overall Score */}
              <div className="text-center">
                <div className="text-6xl font-bold text-pink-600 mb-2">
                  {result.overall}%
                </div>
                <div className="text-xl font-medium text-muted-foreground mb-4">
                  Overall Compatibility
                </div>
                <div className="text-lg text-center max-w-2xl mx-auto">
                  {result.message}
                </div>
              </div>

              {/* Detailed Scores */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-red-600">{result.love}%</div>
                  <div className="text-sm text-muted-foreground">Love</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-600">{result.passion}%</div>
                  <div className="text-sm text-muted-foreground">Passion</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Star className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-600">{result.friendship}%</div>
                  <div className="text-sm text-muted-foreground">Friendship</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Sparkles className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-600">{result.communication}%</div>
                  <div className="text-sm text-muted-foreground">Communication</div>
                </div>
                
                <div className="text-center p-4 border rounded-lg">
                  <Heart className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-600">{result.trust}%</div>
                  <div className="text-sm text-muted-foreground">Trust</div>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>⚠️ This is a fun, entertainment tool and should not be taken as professional relationship advice.</p>
                <p>True compatibility comes from communication, understanding, and mutual respect.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CoupleCompatibilityCalculator;
