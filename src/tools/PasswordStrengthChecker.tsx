import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, Shield, CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

const PasswordStrengthChecker = () => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePassword = (password: string) => {
    if (!password) return null;

    let score = 0;
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
      feedback.push("✓ At least 8 characters");
    } else {
      feedback.push("✗ At least 8 characters");
      suggestions.push("Make your password at least 8 characters long");
    }

    if (password.length >= 12) {
      score += 1;
      feedback.push("✓ At least 12 characters");
    } else {
      suggestions.push("Consider making your password 12+ characters for better security");
    }

    if (password.length >= 16) {
      score += 1;
      feedback.push("✓ At least 16 characters");
    }

    // Character variety checks
    if (/[a-z]/.test(password)) {
      score += 1;
      feedback.push("✓ Contains lowercase letters");
    } else {
      feedback.push("✗ Contains lowercase letters");
      suggestions.push("Add lowercase letters (a-z)");
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
      feedback.push("✓ Contains uppercase letters");
    } else {
      feedback.push("✗ Contains uppercase letters");
      suggestions.push("Add uppercase letters (A-Z)");
    }

    if (/[0-9]/.test(password)) {
      score += 1;
      feedback.push("✓ Contains numbers");
    } else {
      feedback.push("✗ Contains numbers");
      suggestions.push("Add numbers (0-9)");
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
      feedback.push("✓ Contains special characters");
    } else {
      feedback.push("✗ Contains special characters");
      suggestions.push("Add special characters (!@#$%^&*)");
    }

    // Additional checks
    if (!/(.)\1{2,}/.test(password)) {
      score += 1;
      feedback.push("✓ No repeated characters");
    } else {
      feedback.push("✗ No repeated characters");
      suggestions.push("Avoid repeating the same character multiple times");
    }

    if (!/(.)(.)\1\2/.test(password)) {
      score += 1;
      feedback.push("✓ No common patterns");
    } else {
      feedback.push("✗ No common patterns");
      suggestions.push("Avoid common patterns like '1234' or 'abcd'");
    }

    // Dictionary check (simple)
    const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein'];
    if (!commonPasswords.includes(password.toLowerCase())) {
      score += 1;
      feedback.push("✓ Not a common password");
    } else {
      feedback.push("✗ Not a common password");
      suggestions.push("Avoid common passwords like 'password' or '123456'");
    }

    // Calculate strength level
    let strength: 'Very Weak' | 'Weak' | 'Fair' | 'Good' | 'Strong' | 'Very Strong';
    let color: string;
    let icon: React.ReactNode;

    if (score <= 3) {
      strength = 'Very Weak';
      color = 'text-red-600';
      icon = <XCircle className="h-5 w-5 text-red-600" />;
    } else if (score <= 5) {
      strength = 'Weak';
      color = 'text-orange-600';
      icon = <XCircle className="h-5 w-5 text-orange-600" />;
    } else if (score <= 7) {
      strength = 'Fair';
      color = 'text-yellow-600';
      icon = <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    } else if (score <= 9) {
      strength = 'Good';
      color = 'text-blue-600';
      icon = <CheckCircle className="h-5 w-5 text-blue-600" />;
    } else if (score <= 11) {
      strength = 'Strong';
      color = 'text-green-600';
      icon = <CheckCircle className="h-5 w-5 text-green-600" />;
    } else {
      strength = 'Very Strong';
      color = 'text-emerald-600';
      icon = <CheckCircle className="h-5 w-5 text-emerald-600" />;
    }

    // Calculate estimated crack time
    const estimatedCrackTime = getEstimatedCrackTime(score, password.length);

    return {
      score,
      strength,
      color,
      icon,
      feedback,
      suggestions,
      estimatedCrackTime
    };
  };

  const getEstimatedCrackTime = (score: number, length: number) => {
    // Simplified calculation based on score and length
    const baseTime = Math.pow(2, score + length - 8);
    const secondsToCrack = baseTime / 1000000000; // Assuming 1 billion guesses per second

    if (secondsToCrack < 1) return "Less than a second";
    if (secondsToCrack < 60) return `${Math.round(secondsToCrack)} seconds`;
    if (secondsToCrack < 3600) return `${Math.round(secondsToCrack / 60)} minutes`;
    if (secondsToCrack < 86400) return `${Math.round(secondsToCrack / 3600)} hours`;
    if (secondsToCrack < 31536000) return `${Math.round(secondsToCrack / 86400)} days`;
    if (secondsToCrack < 31536000000) return `${Math.round(secondsToCrack / 31536000)} years`;
    return "Centuries";
  };

  const handleAnalyze = () => {
    if (!password.trim()) {
      toast({ title: "Error", description: "Please enter a password to analyze.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    // Simulate analysis delay
    setTimeout(() => setIsAnalyzing(false), 500);
  };

  const clearPassword = () => {
    setPassword("");
  };

  const analysis = analyzePassword(password);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Password Strength Checker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password-input">Enter Password</Label>
            <div className="relative">
              <Input
                id="password-input"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password to check..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleAnalyze} 
              className="flex-1" 
              variant="hero"
              disabled={isAnalyzing || !password.trim()}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isAnalyzing ? "Analyzing..." : "Check Strength"}
            </Button>
            <Button onClick={clearPassword} variant="outline">
              Clear
            </Button>
          </div>

          {password && (
            <div className="p-3 bg-accent rounded-lg">
              <p className="text-sm font-medium mb-1">Password Info:</p>
              <p className="text-xs text-muted-foreground">
                Length: {password.length} characters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Strength Analysis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <>
              <div className="flex items-center gap-3 p-4 bg-accent rounded-lg">
                {analysis.icon}
                <div>
                  <p className="font-semibold">Strength: <span className={analysis.color}>{analysis.strength}</span></p>
                  <p className="text-sm text-muted-foreground">Score: {analysis.score}/12</p>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    analysis.score <= 3 ? 'bg-red-500' :
                    analysis.score <= 5 ? 'bg-orange-500' :
                    analysis.score <= 7 ? 'bg-yellow-500' :
                    analysis.score <= 9 ? 'bg-blue-500' :
                    analysis.score <= 11 ? 'bg-green-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${(analysis.score / 12) * 100}%` }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
                  <span className="text-sm font-medium">Estimated Crack Time:</span>
                  <span className="text-sm font-bold text-blue-600">
                    {analysis.estimatedCrackTime}
                  </span>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Requirements Check:</Label>
                  <div className="space-y-1">
                    {analysis.feedback.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {analysis.suggestions.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Suggestions for Improvement:
                    </Label>
                    <div className="space-y-1">
                      {analysis.suggestions.map((suggestion, index) => (
                        <div key={index} className="text-sm text-muted-foreground pl-6">
                          • {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter a password and click "Check Strength" to analyze</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordStrengthChecker;
