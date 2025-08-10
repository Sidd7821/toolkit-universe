import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check, TrendingUp, PieChart, DollarSign, Calendar } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const SIPCalculator = () => {
  const [monthlyInvestment, setMonthlyInvestment] = useState("");
  const [expectedReturn, setExpectedReturn] = useState("");
  const [timePeriod, setTimePeriod] = useState("");
  const [timeUnit, setTimeUnit] = useState("years");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculateSIP = () => {
    if (!monthlyInvestment || !expectedReturn || !timePeriod) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const monthlyAmount = Number(monthlyInvestment);
    const annualReturn = Number(expectedReturn);
    const period = Number(timePeriod);

    if (isNaN(monthlyAmount) || isNaN(annualReturn) || isNaN(period)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers.",
        variant: "destructive"
      });
      return;
    }

    if (monthlyAmount <= 0 || annualReturn <= 0 || period <= 0) {
      toast({
        title: "Invalid values",
        description: "Values must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Convert time period to months
    const totalMonths = timeUnit === "years" ? period * 12 : period;
    
    // Convert annual return to monthly
    const monthlyReturn = annualReturn / 12 / 100;

    // Calculate future value using SIP formula: FV = P × ((1 + r)^n - 1) / r
    const futureValue = monthlyAmount * (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
    
    // Calculate total investment
    const totalInvestment = monthlyAmount * totalMonths;
    
    // Calculate wealth gained
    const wealthGained = futureValue - totalInvestment;

    // Generate year-wise breakdown
    const yearlyBreakdown = [];
    for (let year = 1; year <= Math.ceil(totalMonths / 12); year++) {
      const monthsInYear = Math.min(12, totalMonths - (year - 1) * 12);
      const yearStartMonth = (year - 1) * 12 + 1;
      
      let yearValue = 0;
      for (let month = yearStartMonth; month < yearStartMonth + monthsInYear; month++) {
        yearValue += monthlyAmount * Math.pow(1 + monthlyReturn, month);
      }
      
      yearlyBreakdown.push({
        year,
        investment: (monthlyAmount * monthsInYear).toFixed(2),
        value: yearValue.toFixed(2),
        gain: (yearValue - monthlyAmount * monthsInYear).toFixed(2)
      });
    }

    setResult({
      monthlyInvestment: monthlyAmount.toFixed(2),
      totalInvestment: totalInvestment.toFixed(2),
      futureValue: futureValue.toFixed(2),
      wealthGained: wealthGained.toFixed(2),
      totalMonths,
      yearlyBreakdown
    });
  };

  const copyResult = async () => {
    if (!result) return;
    
    const textToCopy = `SIP Investment Calculation:
Monthly Investment: ₹${result.monthlyInvestment}
Total Investment: ₹${result.totalInvestment}
Future Value: ₹${result.futureValue}
Wealth Gained: ₹${result.wealthGained}
Investment Period: ${result.totalMonths} months`;

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
    setMonthlyInvestment("");
    setExpectedReturn("");
    setTimePeriod("");
    setTimeUnit("years");
    setResult(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SIP Investment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monthlyInvestment">Monthly Investment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="monthlyInvestment"
                  type="number"
                  placeholder="1000"
                  value={monthlyInvestment}
                  onChange={(e) => setMonthlyInvestment(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="expectedReturn">Expected Annual Return (%)</Label>
              <Input
                id="expectedReturn"
                type="number"
                step="0.01"
                placeholder="12"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timePeriod">Investment Period</Label>
              <Input
                id="timePeriod"
                type="number"
                placeholder="10"
                value={timePeriod}
                onChange={(e) => setTimePeriod(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeUnit">Time Unit</Label>
              <Select value={timeUnit} onValueChange={setTimeUnit}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="years">Years</SelectItem>
                  <SelectItem value="months">Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={calculateSIP} className="flex-1">
              Calculate SIP Returns
            </Button>
            <Button onClick={resetTool} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">₹{result.monthlyInvestment}</div>
                  <p className="text-sm text-muted-foreground">Monthly Investment</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">₹{result.totalInvestment}</div>
                  <p className="text-sm text-muted-foreground">Total Investment</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{result.futureValue}</div>
                  <p className="text-sm text-muted-foreground">Future Value</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{result.wealthGained}</div>
                  <p className="text-sm text-muted-foreground">Wealth Gained</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Yearly Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Yearly Investment Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Year</th>
                      <th className="text-right p-2">Investment</th>
                      <th className="text-right p-2">Value</th>
                      <th className="text-right p-2">Gain</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.yearlyBreakdown.map((row: any) => (
                      <tr key={row.year} className="border-b hover:bg-muted/50">
                        <td className="p-2">{row.year}</td>
                        <td className="p-2 text-right">₹{row.investment}</td>
                        <td className="p-2 text-right text-green-600">₹{row.value}</td>
                        <td className="p-2 text-right text-orange-600">₹{row.gain}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button onClick={copyResult} variant="outline" size="sm">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied!" : "Copy Results"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            About SIP Investment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>SIP (Systematic Investment Plan)</strong> is a method of investing a fixed amount regularly in mutual funds.
          </p>
          <p>
            The calculation uses the formula: <code className="bg-muted px-1 rounded">FV = P × ((1 + r)^n - 1) / r</code>
          </p>
          <p>Where:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>P</strong> = Monthly investment amount</li>
            <li><strong>r</strong> = Monthly return rate (annual return ÷ 12 ÷ 100)</li>
            <li><strong>n</strong> = Total number of months</li>
          </ul>
          <div className="text-xs mt-4 p-3 bg-muted rounded-lg space-y-2">
            <p>💡 <strong>Benefits of SIP:</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Rupee cost averaging reduces market timing risk</li>
              <li>Disciplined approach to investing</li>
              <li>Power of compounding over long periods</li>
              <li>Affordable way to start investing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SIPCalculator;
