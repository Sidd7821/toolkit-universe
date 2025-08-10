import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/use-toast";
import { Copy, RefreshCw, Shield, Eye, EyeOff } from "lucide-react";

const PasswordGenerator = () => {
  const [password, setPassword] = useState("");
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const generatePassword = () => {
    let charset = "";
    
    if (includeUppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeLowercase) charset += "abcdefghijklmnopqrstuvwxyz";
    if (includeNumbers) charset += "0123456789";
    if (includeSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
    
    if (excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "");
    }

    if (!charset) {
      toast({ title: "Error", description: "Please select at least one character type.", variant: "destructive" });
      return;
    }

    let result = "";
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    setPassword(result);
    toast({ title: "Password generated", description: "New secure password created!" });
  };

  const copyToClipboard = async () => {
    if (!password) return;
    
    try {
      await navigator.clipboard.writeText(password);
      toast({ title: "Copied!", description: "Password copied to clipboard." });
    } catch (err) {
      toast({ title: "Copy failed", description: "Unable to copy to clipboard.", variant: "destructive" });
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { score: 0, label: "No password", color: "text-muted-foreground" };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    
    if (score <= 2) return { score, label: "Weak", color: "text-red-500" };
    if (score <= 4) return { score, label: "Medium", color: "text-yellow-500" };
    return { score, label: "Strong", color: "text-green-500" };
  };

  const strength = getPasswordStrength();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Password Length: {length[0]}</Label>
            <Slider
              value={length}
              onValueChange={setLength}
              max={50}
              min={4}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Character Types</Label>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="uppercase"
                checked={includeUppercase}
                onCheckedChange={setIncludeUppercase}
              />
              <Label htmlFor="uppercase">Uppercase Letters (A-Z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="lowercase"
                checked={includeLowercase}
                onCheckedChange={setIncludeLowercase}
              />
              <Label htmlFor="lowercase">Lowercase Letters (a-z)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="numbers"
                checked={includeNumbers}
                onCheckedChange={setIncludeNumbers}
              />
              <Label htmlFor="numbers">Numbers (0-9)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="symbols"
                checked={includeSymbols}
                onCheckedChange={setIncludeSymbols}
              />
              <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="exclude-similar"
                checked={excludeSimilar}
                onCheckedChange={setExcludeSimilar}
              />
              <Label htmlFor="exclude-similar">Exclude Similar Characters (i, l, 1, L, o, 0, O)</Label>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full" variant="hero">
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {password ? (
            <>
              <div className="relative">
                <Input
                  value={password}
                  readOnly
                  type={showPassword ? "text" : "password"}
                  className="font-mono pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                <span className="text-sm font-medium">Password Strength:</span>
                <span className={`text-sm font-bold ${strength.color}`}>
                  {strength.label}
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    strength.score <= 2 ? 'bg-red-500' :
                    strength.score <= 4 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${(strength.score / 6) * 100}%` }}
                />
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Length: {password.length} characters</p>
                <p>• Estimated time to crack: {getEstimatedCrackTime()}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate Password" to create a secure password</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  function getEstimatedCrackTime() {
    if (!password) return "N/A";
    
    let charset = 0;
    if (includeUppercase) charset += 26;
    if (includeLowercase) charset += 26;
    if (includeNumbers) charset += 10;
    if (includeSymbols) charset += 32;
    
    const combinations = Math.pow(charset, password.length);
    const secondsToCrack = combinations / (2 * 1000000000); // Assuming 1 billion guesses per second
    
    if (secondsToCrack < 60) return "Less than a minute";
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
    return "Centuries";
  }
};

export default PasswordGenerator;