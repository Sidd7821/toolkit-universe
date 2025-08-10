import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar, RefreshCw, Copy, Check, Clock, Heart, Cake } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const AgeCalculator = () => {
  const [birthDate, setBirthDate] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculateAge = () => {
    if (!birthDate) {
      toast({
        title: "Invalid input",
        description: "Please select a birth date.",
        variant: "destructive"
      });
      return;
    }

    const birth = new Date(birthDate);
    const today = new Date();

    if (birth > today) {
      toast({
        title: "Invalid date",
        description: "Birth date cannot be in the future.",
        variant: "destructive"
      });
      return;
    }

    // Calculate age
    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();
    let days = today.getDate() - birth.getDate();

    // Adjust for negative months/days
    if (days < 0) {
      months--;
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += lastMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    // Calculate total days
    const totalDays = Math.floor((today.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate next birthday
    const nextBirthday = new Date(today.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBirthday < today) {
      nextBirthday.setFullYear(today.getFullYear() + 1);
    }
    const daysUntilBirthday = Math.ceil((nextBirthday.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    // Calculate various time units
    const totalHours = totalDays * 24;
    const totalMinutes = totalHours * 60;
    const totalSeconds = totalMinutes * 60;
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = years * 12 + months;

    // Zodiac sign calculation
    const zodiacSign = getZodiacSign(birth.getMonth() + 1, birth.getDate());

    setResult({
      years,
      months,
      days,
      totalDays,
      totalWeeks,
      totalMonths,
      totalHours,
      totalMinutes,
      totalSeconds,
      daysUntilBirthday,
      zodiacSign,
      birthDate: birth.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });

    toast({
      title: "Age calculated!",
      description: `You are ${years} years, ${months} months, and ${days} days old.`
    });
  };

  const getZodiacSign = (month: number, day: number): string => {
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries ♈";
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus ♉";
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini ♊";
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer ♋";
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo ♌";
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo ♍";
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra ♎";
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio ♏";
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius ♐";
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn ♑";
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius ♒";
    return "Pisces ♓";
  };

  const copyResult = async () => {
    if (result) {
      const text = `Age: ${result.years} years, ${result.months} months, ${result.days} days\nTotal days: ${result.totalDays.toLocaleString()}\nZodiac: ${result.zodiacSign}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Age details copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetTool = () => {
    setBirthDate("");
    setResult(null);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cake className="h-5 w-5" />
            Age Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Birth Date</Label>
            <Input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Select your date of birth to calculate your exact age
            </p>
          </div>

          <Button onClick={calculateAge} className="w-full" variant="hero">
            <Calendar className="h-4 w-4 mr-2" />
            Calculate Age
          </Button>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">What you'll get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Exact age in years, months, and days</li>
              <li>• Total days, weeks, and months lived</li>
              <li>• Days until your next birthday</li>
              <li>• Your zodiac sign</li>
              <li>• Various time unit conversions</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Age Details</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="p-6 bg-accent rounded-lg text-center">
                <p className="text-3xl font-bold text-primary">
                  {result.years} years, {result.months} months, {result.days} days
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Born on {result.birthDate}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Days</p>
                  <p className="font-medium">{formatNumber(result.totalDays)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Weeks</p>
                  <p className="font-medium">{formatNumber(result.totalWeeks)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Total Months</p>
                  <p className="font-medium">{formatNumber(result.totalMonths)}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Heart className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Next Birthday</p>
                  <p className="font-medium">{result.daysUntilBirthday} days</p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg text-center">
                <p className="text-lg font-medium text-primary">
                  {result.zodiacSign}
                </p>
                <p className="text-sm text-muted-foreground">Your Zodiac Sign</p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Time Lived:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Hours:</span>
                    <span className="font-medium">{formatNumber(result.totalHours)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Minutes:</span>
                    <span className="font-medium">{formatNumber(result.totalMinutes)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-muted rounded">
                    <span>Seconds:</span>
                    <span className="font-medium">{formatNumber(result.totalSeconds)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyResult} className="flex-1" variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Details"}
                </Button>
                <Button onClick={resetTool} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Cake className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select your birth date to calculate your age</p>
              <p className="text-xs mt-2">Get detailed age information and fun facts</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AgeCalculator;
