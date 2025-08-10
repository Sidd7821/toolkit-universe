import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check, Activity, TrendingUp, Heart, Scale } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [heightUnit, setHeightUnit] = useState("cm");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculateBMI = () => {
    if (!weight || !height || !age || !gender) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers.",
        variant: "destructive"
      });
      return;
    }

    if (weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      toast({
        title: "Invalid values",
        description: "Values must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Convert to metric units for calculation
    let weightKg = weightNum;
    let heightM = heightNum;

    if (weightUnit === "lbs") {
      weightKg = weightNum * 0.453592;
    }
    if (heightUnit === "ft") {
      heightM = heightNum * 0.3048;
    } else if (heightUnit === "in") {
      heightM = heightNum * 0.0254;
    } else if (heightUnit === "cm") {
      heightM = heightNum / 100;
    }

    // Calculate BMI
    const bmi = weightKg / (heightM * heightM);

    // Determine BMI category
    let category = "";
    let color = "";
    let healthRisk = "";
    let recommendation = "";

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-blue-600";
      healthRisk = "Low body weight may indicate malnutrition or underlying health conditions";
      recommendation = "Consider consulting a healthcare provider and focus on healthy weight gain through balanced nutrition";
    } else if (bmi >= 18.5 && bmi < 25) {
      category = "Normal weight";
      color = "text-green-600";
      healthRisk = "Low risk of health problems";
      recommendation = "Maintain your healthy weight with regular exercise and balanced diet";
    } else if (bmi >= 25 && bmi < 30) {
      category = "Overweight";
      color = "text-yellow-600";
      healthRisk = "Increased risk of heart disease, diabetes, and other health issues";
      recommendation = "Focus on weight loss through diet and exercise, consider consulting a healthcare provider";
    } else if (bmi >= 30 && bmi < 35) {
      category = "Obese (Class I)";
      color = "text-orange-600";
      healthRisk = "High risk of serious health conditions";
      recommendation = "Seek medical advice for weight management and lifestyle changes";
    } else if (bmi >= 35 && bmi < 40) {
      category = "Obese (Class II)";
      color = "text-red-600";
      healthRisk = "Very high risk of health complications";
      recommendation = "Immediate medical consultation recommended for comprehensive weight management";
    } else {
      category = "Obese (Class III)";
      color = "text-red-800";
      healthRisk = "Extremely high risk of life-threatening conditions";
      recommendation = "Urgent medical intervention required";
    }

    // Calculate ideal weight range
    const minIdealWeight = 18.5 * heightM * heightM;
    const maxIdealWeight = 24.9 * heightM * heightM;

    // Convert back to user's preferred unit
    let minIdealWeightDisplay = minIdealWeight;
    let maxIdealWeightDisplay = maxIdealWeight;
    let weightToLose = 0;
    let weightToGain = 0;

    if (weightUnit === "lbs") {
      minIdealWeightDisplay = minIdealWeight * 2.20462;
      maxIdealWeightDisplay = maxIdealWeight * 2.20462;
      weightToLose = weightNum > maxIdealWeightDisplay ? weightNum - maxIdealWeightDisplay : 0;
      weightToGain = weightNum < minIdealWeightDisplay ? minIdealWeightDisplay - weightNum : 0;
    } else {
      weightToLose = weightNum > maxIdealWeightDisplay ? weightNum - maxIdealWeightDisplay : 0;
      weightToGain = weightNum < minIdealWeightDisplay ? minIdealWeightDisplay - weightNum : 0;
    }

    setResult({
      bmi: bmi.toFixed(1),
      category,
      color,
      healthRisk,
      recommendation,
      minIdealWeight: minIdealWeightDisplay.toFixed(1),
      maxIdealWeight: maxIdealWeightDisplay.toFixed(1),
      weightToLose: weightToLose.toFixed(1),
      weightToGain: weightToGain.toFixed(1),
      heightM: heightM.toFixed(2),
      weightKg: weightKg.toFixed(1)
    });

    toast({
      title: "BMI calculated!",
      description: `Your BMI is ${bmi.toFixed(1)} - ${category}`
    });
  };

  const copyResult = async () => {
    if (result) {
      const text = `BMI: ${result.bmi}\nCategory: ${result.category}\nHealth Risk: ${result.healthRisk}\nRecommendation: ${result.recommendation}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "BMI results copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetTool = () => {
    setWeight("");
    setHeight("");
    setAge("");
    setGender("");
    setResult(null);
  };

  const getBMIColor = (bmi: number) => {
    if (bmi < 18.5) return "bg-blue-100 text-blue-800";
    if (bmi < 25) return "bg-green-100 text-green-800";
    if (bmi < 30) return "bg-yellow-100 text-yellow-800";
    if (bmi < 35) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            BMI Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                type="number"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Weight Unit</Label>
              <Select value={weightUnit} onValueChange={setWeightUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kg">Kilograms (kg)</SelectItem>
                  <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Height</Label>
              <Input
                type="number"
                placeholder="Enter height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                step="0.1"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label>Height Unit</Label>
              <Select value={heightUnit} onValueChange={setHeightUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cm">Centimeters (cm)</SelectItem>
                  <SelectItem value="ft">Feet (ft)</SelectItem>
                  <SelectItem value="in">Inches (in)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Age</Label>
              <Input
                type="number"
                placeholder="Enter age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min="1"
                max="120"
              />
            </div>
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={calculateBMI} className="w-full" variant="hero">
            <Activity className="h-4 w-4 mr-2" />
            Calculate BMI
          </Button>

          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">What is BMI?</h4>
            <p className="text-sm text-muted-foreground">
              Body Mass Index (BMI) is a measure of body fat based on height and weight. 
              It helps assess if your weight is in a healthy range for your height.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your BMI Results</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="p-6 bg-accent rounded-lg text-center">
                <p className="text-4xl font-bold text-primary mb-2">
                  {result.bmi}
                </p>
                <p className={`text-lg font-medium ${result.color}`}>
                  {result.category}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Height: {result.heightM}m | Weight: {result.weightKg}kg
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">Ideal Weight Range</p>
                  <p className="font-medium text-sm">
                    {result.minIdealWeight} - {result.maxIdealWeight} {weightUnit}
                  </p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <Scale className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xs text-muted-foreground">
                    {result.weightToLose > 0 ? "Weight to Lose" : "Weight to Gain"}
                  </p>
                  <p className="font-medium text-sm">
                    {result.weightToLose > 0 ? result.weightToLose : result.weightToGain} {weightUnit}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-lg">
                <h4 className="font-medium mb-2 text-primary">Health Assessment</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  {result.healthRisk}
                </p>
                <p className="text-sm font-medium">
                  {result.recommendation}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">BMI Categories:</h4>
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between p-2 bg-blue-50 rounded">
                    <span>Underweight:</span>
                    <span className="font-medium text-blue-600">&lt; 18.5</span>
                  </div>
                  <div className="flex justify-between p-2 bg-green-50 rounded">
                    <span>Normal weight:</span>
                    <span className="font-medium text-green-600">18.5 - 24.9</span>
                  </div>
                  <div className="flex justify-between p-2 bg-yellow-50 rounded">
                    <span>Overweight:</span>
                    <span className="font-medium text-yellow-600">25.0 - 29.9</span>
                  </div>
                  <div className="flex justify-between p-2 bg-orange-50 rounded">
                    <span>Obese (Class I):</span>
                    <span className="font-medium text-orange-600">30.0 - 34.9</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-50 rounded">
                    <span>Obese (Class II):</span>
                    <span className="font-medium text-red-600">35.0 - 39.9</span>
                  </div>
                  <div className="flex justify-between p-2 bg-red-100 rounded">
                    <span>Obese (Class III):</span>
                    <span className="font-medium text-red-800">≥ 40.0</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyResult} className="flex-1" variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Results"}
                </Button>
                <Button onClick={resetTool} variant="outline">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  <strong>Note:</strong> BMI is a screening tool and may not be accurate for athletes, 
                  pregnant women, or the elderly. Always consult a healthcare provider for personalized advice.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Enter your details to calculate your BMI</p>
              <p className="text-xs mt-2">Get health insights and recommendations</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BMICalculator;
