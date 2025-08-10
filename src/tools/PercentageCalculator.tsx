import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check, Percent, Calculator, TrendingUp, Minus, Plus } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const PercentageCalculator = () => {
  const [calculationType, setCalculationType] = useState("percentage-of-number");
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculatePercentage = () => {
    if (!value1 || !value2) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const num1 = Number(value1);
    const num2 = Number(value2);

    if (isNaN(num1) || isNaN(num2)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers.",
        variant: "destructive"
      });
      return;
    }

    let calculationResult;
    let explanation;

    switch (calculationType) {
      case "percentage-of-number":
        calculationResult = (num1 / 100) * num2;
        explanation = `${num1}% of ${num2} = ${calculationResult.toFixed(2)}`;
        break;
      
      case "what-percentage":
        calculationResult = (num1 / num2) * 100;
        explanation = `${num1} is ${calculationResult.toFixed(2)}% of ${num2}`;
        break;
      
      case "percentage-increase":
        calculationResult = ((num2 - num1) / num1) * 100;
        explanation = `From ${num1} to ${num2} is a ${calculationResult >= 0 ? '+' : ''}${calculationResult.toFixed(2)}% change`;
        break;
      
      case "percentage-decrease":
        calculationResult = ((num1 - num2) / num1) * 100;
        explanation = `From ${num1} to ${num2} is a ${calculationResult.toFixed(2)}% decrease`;
        break;
      
      case "add-percentage":
        calculationResult = num1 + (num1 * num2 / 100);
        explanation = `${num1} + ${num2}% = ${calculationResult.toFixed(2)}`;
        break;
      
      case "subtract-percentage":
        calculationResult = num1 - (num1 * num2 / 100);
        explanation = `${num1} - ${num2}% = ${calculationResult.toFixed(2)}`;
        break;
      
      default:
        calculationResult = 0;
        explanation = "Invalid calculation type";
    }

    setResult({
      calculationType,
      value1: num1,
      value2: num2,
      result: calculationResult,
      explanation
    });
  };

  const copyResult = async () => {
    if (!result) return;
    
    const textToCopy = `Percentage Calculation:
${result.explanation}
Result: ${result.result.toFixed(2)}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Calculation results copied to clipboard.",
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
    setValue1("");
    setValue2("");
    setResult(null);
    setCopied(false);
  };

  const getInputLabels = () => {
    switch (calculationType) {
      case "percentage-of-number":
        return { label1: "Percentage (%)", label2: "Number", placeholder1: "25", placeholder2: "200" };
      case "what-percentage":
        return { label1: "Part", label2: "Whole", placeholder1: "50", placeholder2: "200" };
      case "percentage-increase":
        return { label1: "Original Value", label2: "New Value", placeholder1: "100", placeholder2: "150" };
      case "percentage-decrease":
        return { label1: "Original Value", label2: "New Value", placeholder1: "100", placeholder2: "80" };
      case "add-percentage":
        return { label1: "Number", label2: "Percentage to Add (%)", placeholder1: "100", placeholder2: "25" };
      case "subtract-percentage":
        return { label1: "Number", label2: "Percentage to Subtract (%)", placeholder1: "100", placeholder2: "25" };
      default:
        return { label1: "Value 1", label2: "Value 2", placeholder1: "", placeholder2: "" };
    }
  };

  const inputLabels = getInputLabels();

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5" />
            Percentage Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calculationType">Calculation Type</Label>
            <Select value={calculationType} onValueChange={setCalculationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage-of-number">Calculate X% of a number</SelectItem>
                <SelectItem value="what-percentage">What percentage is X of Y?</SelectItem>
                <SelectItem value="percentage-increase">Percentage increase</SelectItem>
                <SelectItem value="percentage-decrease">Percentage decrease</SelectItem>
                <SelectItem value="add-percentage">Add X% to a number</SelectItem>
                <SelectItem value="subtract-percentage">Subtract X% from a number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value1">{inputLabels.label1}</Label>
              <Input
                id="value1"
                type="number"
                step="0.01"
                placeholder={inputLabels.placeholder1}
                value={value1}
                onChange={(e) => setValue1(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value2">{inputLabels.label2}</Label>
              <Input
                id="value2"
                type="number"
                step="0.01"
                placeholder={inputLabels.placeholder2}
                value={value2}
                onChange={(e) => setValue2(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={calculatePercentage} className="flex-1">
              Calculate
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
              Calculation Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-6 bg-muted rounded-lg">
              <div className="text-3xl font-bold text-primary mb-2">
                {result.result.toFixed(2)}
              </div>
              <p className="text-muted-foreground">{result.explanation}</p>
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

      {/* Quick Calculations Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Common Percentage Values
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">25%</div>
              <div className="text-muted-foreground">Quarter</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">50%</div>
              <div className="text-muted-foreground">Half</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">75%</div>
              <div className="text-muted-foreground">Three Quarters</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">100%</div>
              <div className="text-muted-foreground">Whole</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">10%</div>
              <div className="text-muted-foreground">Tenth</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">20%</div>
              <div className="text-muted-foreground">Fifth</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">33.33%</div>
              <div className="text-muted-foreground">Third</div>
            </div>
            <div className="text-center p-3 bg-muted rounded-lg">
              <div className="font-semibold">66.67%</div>
              <div className="text-muted-foreground">Two Thirds</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            About Percentage Calculations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Percentage</strong> is a way to express a number as a fraction of 100.
          </p>
          <div className="space-y-2">
            <p><strong>Common Formulas:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>X% of Y:</strong> (X ÷ 100) × Y</li>
              <li><strong>What % is X of Y:</strong> (X ÷ Y) × 100</li>
              <li><strong>% Increase:</strong> ((New - Original) ÷ Original) × 100</li>
              <li><strong>% Decrease:</strong> ((Original - New) ÷ Original) × 100</li>
              <li><strong>Add X%:</strong> Original + (Original × X ÷ 100)</li>
              <li><strong>Subtract X%:</strong> Original - (Original × X ÷ 100)</li>
            </ul>
          </div>
          <p className="text-xs mt-4 p-3 bg-muted rounded-lg">
            💡 <strong>Tip:</strong> Percentages are useful for comparing values, calculating discounts, analyzing growth, and understanding proportions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PercentageCalculator;
