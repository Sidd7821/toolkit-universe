import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Clock, 
  Gift, 
  Cake, 
  PartyPopper,
  Heart,
  Star,
  Zap,
  RefreshCw,
  Save,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BirthdayInfo {
  date: string;
  name: string;
  age: number;
  nextBirthday: Date;
  daysUntil: number;
  hoursUntil: number;
  minutesUntil: number;
  secondsUntil: number;
  progress: number;
}

const BirthdayCountdownTool = () => {
  const [birthdayDate, setBirthdayDate] = useState("");
  const [name, setName] = useState("");
  const [birthdayInfo, setBirthdayInfo] = useState<BirthdayInfo | null>(null);
  const [savedBirthdays, setSavedBirthdays] = useState<BirthdayInfo[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const { toast } = useToast();

  // Load saved birthdays from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('birthday-countdown-data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSavedBirthdays(parsed);
      } catch (error) {
        console.error('Error loading saved birthdays:', error);
      }
    }
  }, []);

  // Save birthdays to localStorage
  const saveToLocalStorage = (birthdays: BirthdayInfo[]) => {
    localStorage.setItem('birthday-countdown-data', JSON.stringify(birthdays));
  };

  const calculateBirthdayInfo = (date: string, personName: string): BirthdayInfo => {
    const today = new Date();
    const birthDate = new Date(date);
    const currentYear = today.getFullYear();
    
    // Calculate age
    const age = currentYear - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();
    
    const actualAge = monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? age - 1 : age;
    
    // Calculate next birthday
    const nextBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    
    // If birthday has passed this year, set to next year
    if (nextBirthday < today) {
      nextBirthday.setFullYear(currentYear + 1);
    }
    
    // Calculate time until next birthday
    const timeDiff = nextBirthday.getTime() - today.getTime();
    const daysUntil = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hoursUntil = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const secondsUntil = Math.floor((timeDiff % (1000 * 60)) / 1000);
    
    // Calculate progress (days since last birthday / days in year)
    const lastBirthday = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
    if (lastBirthday > today) {
      lastBirthday.setFullYear(currentYear - 1);
    }
    const daysSinceLastBirthday = Math.floor((today.getTime() - lastBirthday.getTime()) / (1000 * 60 * 60 * 24));
    const daysInYear = 365;
    const progress = Math.min((daysSinceLastBirthday / daysInYear) * 100, 100);
    
    return {
      date,
      name: personName,
      age: actualAge,
      nextBirthday,
      daysUntil,
      hoursUntil,
      minutesUntil,
      secondsUntil,
      progress
    };
  };

  const handleCalculate = () => {
    if (!birthdayDate || !name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter both name and birthday date",
        variant: "destructive"
      });
      return;
    }

    const info = calculateBirthdayInfo(birthdayDate, name.trim());
    setBirthdayInfo(info);
    
    toast({
      title: "Birthday calculated!",
      description: `Countdown for ${info.name}'s birthday has been set`,
    });
  };

  const handleSave = () => {
    if (!birthdayInfo) return;
    
    const updated = [...savedBirthdays, birthdayInfo];
    setSavedBirthdays(updated);
    saveToLocalStorage(updated);
    
    toast({
      title: "Birthday saved!",
      description: `${birthdayInfo.name}'s birthday has been saved to your list`,
    });
  };

  const handleDelete = (index: number) => {
    const updated = savedBirthdays.filter((_, i) => i !== index);
    setSavedBirthdays(updated);
    saveToLocalStorage(updated);
    
    toast({
      title: "Birthday removed",
      description: "Birthday has been removed from your list",
    });
  };

  const handleLoad = (birthday: BirthdayInfo) => {
    setBirthdayInfo(birthday);
    setBirthdayDate(birthday.date);
    setName(birthday.name);
    setIsEditing(false);
    
    toast({
      title: "Birthday loaded",
      description: `${birthday.name}'s birthday has been loaded`,
    });
  };

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (birthdayInfo) {
        const updated = calculateBirthdayInfo(birthdayInfo.date, birthdayInfo.name);
        setBirthdayInfo(updated);
      }
      
      // Update saved birthdays
      if (savedBirthdays.length > 0) {
        const updated = savedBirthdays.map(birthday => 
          calculateBirthdayInfo(birthday.date, birthday.name)
        );
        setSavedBirthdays(updated);
        saveToLocalStorage(updated);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [birthdayInfo, savedBirthdays]);

  const getAgeEmoji = (age: number) => {
    if (age < 13) return "👶";
    if (age < 20) return "👧👦";
    if (age < 30) return "👩👨";
    if (age < 50) return "👩‍💼👨‍💼";
    if (age < 70) return "👩‍🦳👨‍🦳";
    return "👵👴";
  };

  const getBirthdayMessage = (daysUntil: number) => {
    if (daysUntil === 0) return "🎉 It's your birthday today! 🎉";
    if (daysUntil === 1) return "🎂 Tomorrow is your birthday! 🎂";
    if (daysUntil <= 7) return "🎈 Your birthday is coming up soon! 🎈";
    if (daysUntil <= 30) return "📅 Your birthday is next month! 📅";
    return "⏰ Counting down to your special day! ⏰";
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Birthday Countdown Calculator
          </CardTitle>
          <CardDescription>
            Enter your birthday to see how many days, hours, minutes, and seconds until your next birthday!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthday">Birthday</Label>
              <Input
                id="birthday"
                type="date"
                value={birthdayDate}
                onChange={(e) => setBirthdayDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calculate Countdown
            </Button>
            {birthdayInfo && (
              <Button onClick={handleSave} variant="outline" className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Save Birthday
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Countdown Display */}
      {birthdayInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-pink-500" />
              {birthdayInfo.name}'s Birthday Countdown
            </CardTitle>
            <CardDescription>
              {getBirthdayMessage(birthdayInfo.daysUntil)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Display */}
            <div className="text-center">
              <div className="text-4xl mb-2">{getAgeEmoji(birthdayInfo.age)}</div>
              <div className="text-2xl font-bold text-primary">
                {birthdayInfo.name} will be {birthdayInfo.age + 1} years old!
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress through the year</span>
                <span>{Math.round(birthdayInfo.progress)}%</span>
              </div>
              <Progress value={birthdayInfo.progress} className="h-3" />
            </div>

            {/* Countdown Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{birthdayInfo.daysUntil}</div>
                <div className="text-sm text-muted-foreground">Days</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{birthdayInfo.hoursUntil}</div>
                <div className="text-sm text-muted-foreground">Hours</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{birthdayInfo.minutesUntil}</div>
                <div className="text-sm text-muted-foreground">Minutes</div>
              </div>
              <div className="text-center p-4 bg-primary/10 rounded-lg">
                <div className="text-3xl font-bold text-primary">{birthdayInfo.secondsUntil}</div>
                <div className="text-sm text-muted-foreground">Seconds</div>
              </div>
            </div>

            {/* Next Birthday Date */}
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Next birthday: {birthdayInfo.nextBirthday.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Birthdays */}
      {savedBirthdays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Saved Birthdays
            </CardTitle>
            <CardDescription>
              Your saved birthdays with live countdowns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {savedBirthdays.map((birthday, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getAgeEmoji(birthday.age)}</div>
                    <div>
                      <div className="font-medium">{birthday.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {birthday.daysUntil} days until birthday
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleLoad(birthday)}
                      variant="outline"
                      size="sm"
                    >
                      Load
                    </Button>
                    <Button
                      onClick={() => handleDelete(index)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fun Facts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Birthday Fun Facts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>• You share your birthday with approximately 21 million people worldwide</span>
              </div>
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-pink-500" />
                <span>• The most common birthday is September 16th</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span>• You've been alive for about {birthdayInfo ? Math.floor(birthdayInfo.age * 365.25) : 0} days</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-red-500" />
                <span>• Your heart has beaten about {birthdayInfo ? Math.floor(birthdayInfo.age * 365.25 * 24 * 60 * 80) : 0} times</span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                <span>• You've experienced about {birthdayInfo ? Math.floor(birthdayInfo.age * 365.25 * 24) : 0} sunrises</span>
              </div>
              <div className="flex items-center gap-2">
                <Cake className="h-4 w-4 text-purple-500" />
                <span>• You've celebrated {birthdayInfo ? birthdayInfo.age : 0} birthdays so far</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BirthdayCountdownTool;
