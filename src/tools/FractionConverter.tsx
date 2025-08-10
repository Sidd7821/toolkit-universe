import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RefreshCw, Copy, Check, Divide, Calculator, TrendingUp, Hash } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const FractionConverter = () => {
  const [numerator, setNumerator] = useState("");
  const [denominator, setDenominator] = useState("");
  const [decimal, setDecimal] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const convertFractionToDecimal = () => {
    if (!numerator || !denominator) {
      toast({
        title: "Missing information",
        description: "Please fill in both numerator and denominator.",
        variant: "destructive"
      });
      return;
    }

    const num = Number(numerator);
    const den = Number(denominator);

    if (isNaN(num) || isNaN(den)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers.",
        variant: "destructive"
      });
      return;
    }

    if (den === 0) {
      toast({
        title: "Invalid denominator",
        description: "Denominator cannot be zero.",
        variant: "destructive"
      });
      return;
    }

    const decimalValue = num / den;
    const percentage = decimalValue * 100;
    
    // Find the simplest fraction form
    const gcd = findGCD(Math.abs(num), Math.abs(den));
    const simplifiedNum = num / gcd;
    const simplifiedDen = den / gcd;

    setResult({
      fraction: `${num}/${den}`,
      simplifiedFraction: `${simplifiedNum}/${simplifiedDen}`,
      decimal: decimalValue,
      percentage: percentage,
      mixedNumber: getMixedNumber(num, den)
    });
  };

  const convertDecimalToFraction = () => {
    if (!decimal) {
      toast({
        title: "Missing information",
        description: "Please enter a decimal number.",
        variant: "destructive"
      });
      return;
    }

    const decimalValue = Number(decimal);
    if (isNaN(decimalValue)) {
      toast({
        title: "Invalid value",
        description: "Please enter a valid decimal number.",
        variant: "destructive"
      });
      return;
    }

    // Convert decimal to fraction
    const fraction = decimalToFraction(decimalValue);
    const percentage = decimalValue * 100;

    setResult({
      decimal: decimalValue,
      fraction: fraction,
      percentage: percentage,
      mixedNumber: getMixedNumber(fraction.numerator, fraction.denominator)
    });
  };

  const findGCD = (a: number, b: number): number => {
    return b === 0 ? a : findGCD(b, a % b);
  };

  const getMixedNumber = (num: number, den: number): string => {
    if (Math.abs(num) < Math.abs(den)) {
      return `${num}/${den}`;
    }
    
    const wholePart = Math.floor(num / den);
    const remainder = num % den;
    
    if (remainder === 0) {
      return wholePart.toString();
    }
    
    return `${wholePart} ${Math.abs(remainder)}/${Math.abs(den)}`;
  };

  const decimalToFraction = (decimal: number): { numerator: number; denominator: number } => {
    const tolerance = 1e-10;
    let numerator = 1;
    let denominator = 1;
    
    // Find the best fraction approximation
    for (let d = 1; d <= 1000; d++) {
      const n = Math.round(decimal * d);
      if (Math.abs(decimal - n / d) < tolerance) {
        numerator = n;
        denominator = d;
        break;
      }
    }
    
    return { numerator, denominator };
  };

  const copyResult = async () => {
    if (!result) return;
    
    let textToCopy = "";
    if (result.fraction) {
      textToCopy = `Fraction Conversion:
${result.fraction} = ${result.decimal}
Simplified: ${result.simplifiedFraction}
Percentage: ${result.percentage.toFixed(2)}%
Mixed Number: ${result.mixedNumber}`;
    } else {
      textToCopy = `Decimal Conversion:
${result.decimal} = ${result.fraction.numerator}/${result.fraction.denominator}
Percentage: ${result.percentage.toFixed(2)}%
Mixed Number: ${result.mixedNumber}`;
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Conversion results copied to clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually.",
        variant: "destructive"
      });
    }
  };

  const resetTool = () => {
    setNumerator("");
    setDenominator("");
    setDecimal("");
    setResult(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Divide className="h-5 w-5" />
            Fraction to Decimal Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="numerator">Numerator</Label>
              <Input
                id="numerator"
                type="number"
                placeholder="3"
                value={numerator}
                onChange={(e) => setNumerator(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="denominator">Denominator</Label>
              <Input
                id="denominator"
                type="number"
                placeholder="4"
                value={denominator}
                onChange={(e) => setDenominator(e.target.value)}
              />
            </div>
          </div>
          
          <div className="text-center text-muted-foreground">OR</div>
          
          <div className="space-y-2">
            <Label htmlFor="decimal">Decimal Number</Label>
            <Input
              id="decimal"
              type="number"
              step="0.01"
              placeholder="0.75"
              value={decimal}
              onChange={(e) => setDecimal(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={convertFractionToDecimal} 
              className="flex-1"
              disabled={!numerator || !denominator}
            >
              Convert Fraction to Decimal
            </Button>
            <Button 
              onClick={convertDecimalToFraction} 
              className="flex-1"
              disabled={!decimal}
            >
              Convert Decimal to Fraction
            </Button>
            <Button onClick={resetTool} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Conversion Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {result.fraction && (
                <div className="space-y-3">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary mb-2">
                      {result.fraction}
                    </div>
                    <p className="text-sm text-muted-foreground">Original Fraction</p>
                  </div>
                  
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      {result.simplifiedFraction}
                    </div>
                    <p className="text-sm text-muted-foreground">Simplified Form</p>
                  </div>
                </div>
              )}
              
              <div className="space-y-3">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {result.decimal.toFixed(6)}
                  </div>
                  <p className="text-sm text-muted-foreground">Decimal Value</p>
                </div>
                
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-2">
                    {result.percentage.toFixed(2)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Percentage</p>
                </div>
              </div>
            </div>
            
            <div className="text-center p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="text-lg font-semibold text-primary mb-1">
                Mixed Number Form
              </div>
              <div className="text-2xl font-bold">
                {result.mixedNumber}
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button onClick={copyResult} variant="outline" size="sm">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Result"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Common Fractions Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Common Fractions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/2</div>
              <div className="text-muted-foreground">0.5 (50%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/3</div>
              <div className="text-muted-foreground">0.333... (33.33%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/4</div>
              <div className="text-muted-foreground">0.25 (25%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/5</div>
              <div className="text-muted-foreground">0.2 (20%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">2/3</div>
              <div className="text-muted-foreground">0.666... (66.67%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">3/4</div>
              <div className="text-muted-foreground">0.75 (75%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/8</div>
              <div className="text-muted-foreground">0.125 (12.5%)</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">1/10</div>
              <div className="text-muted-foreground">0.1 (10%)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            About Fractions and Decimals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Fractions</strong> represent parts of a whole, while <strong>decimals</strong> are another way to express the same values.
          </p>
          <div className="space-y-2">
            <p><strong>Conversion Methods:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Fraction to Decimal:</strong> Divide numerator by denominator</li>
              <li><strong>Decimal to Fraction:</strong> Find the best fraction approximation</li>
              <li><strong>Simplification:</strong> Divide both numbers by their greatest common divisor (GCD)</li>
              <li><strong>Mixed Numbers:</strong> Combine whole numbers with proper fractions</li>
            </ul>
          </div>
          <p className="text-xs mt-4 p-3 bg-muted rounded-lg">
            💡 <strong>Tip:</strong> Fractions are often more precise than decimal approximations, especially for repeating decimals like 1/3 = 0.333...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default FractionConverter;
