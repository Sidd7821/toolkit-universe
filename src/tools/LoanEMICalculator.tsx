import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check, Calculator, TrendingUp, PieChart, DollarSign } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const LoanEMICalculator = () => {
  const [loanAmount, setLoanAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [loanTerm, setLoanTerm] = useState("");
  const [termUnit, setTermUnit] = useState("years");
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const calculateEMI = () => {
    if (!loanAmount || !interestRate || !loanTerm) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields.",
        variant: "destructive"
      });
      return;
    }

    const principal = Number(loanAmount);
    const rate = Number(interestRate);
    const term = Number(loanTerm);

    if (isNaN(principal) || isNaN(rate) || isNaN(term)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers.",
        variant: "destructive"
      });
      return;
    }

    if (principal <= 0 || rate <= 0 || term <= 0) {
      toast({
        title: "Invalid values",
        description: "Values must be greater than 0.",
        variant: "destructive"
      });
      return;
    }

    // Convert term to months if years
    const termInMonths = termUnit === "years" ? term * 12 : term;
    
    // Convert annual interest rate to monthly
    const monthlyRate = rate / 12 / 100;

    // Calculate EMI using the formula: EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, termInMonths) / 
                (Math.pow(1 + monthlyRate, termInMonths) - 1);

    // Calculate total amount and interest
    const totalAmount = emi * termInMonths;
    const totalInterest = totalAmount - principal;

    // Generate amortization schedule (first 12 months)
    const amortizationSchedule = [];
    let remainingBalance = principal;
    
    for (let month = 1; month <= Math.min(12, termInMonths); month++) {
      const interestPayment = remainingBalance * monthlyRate;
      const principalPayment = emi - interestPayment;
      remainingBalance -= principalPayment;
      
      amortizationSchedule.push({
        month,
        emi: emi.toFixed(2),
        principalPayment: principalPayment.toFixed(2),
        interestPayment: interestPayment.toFixed(2),
        remainingBalance: Math.max(0, remainingBalance).toFixed(2)
      });
    }

    setResult({
      emi: emi.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      totalInterest: totalInterest.toFixed(2),
      principal: principal.toFixed(2),
      termInMonths,
      amortizationSchedule
    });
  };

  const copyResult = async () => {
    if (!result) return;
    
    const textToCopy = `Loan EMI Calculation:
Monthly EMI: ₹${result.emi}
Total Amount: ₹${result.totalAmount}
Total Interest: ₹${result.totalInterest}
Principal: ₹${result.principal}
Loan Term: ${result.termInMonths} months`;

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
    setLoanAmount("");
    setInterestRate("");
    setLoanTerm("");
    setTermUnit("years");
    setResult(null);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Loan Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanAmount">Loan Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="loanAmount"
                  type="number"
                  placeholder="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interestRate">Annual Interest Rate (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="5.5"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="loanTerm">Loan Term</Label>
              <Input
                id="loanTerm"
                type="number"
                placeholder="5"
                value={loanTerm}
                onChange={(e) => setLoanTerm(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="termUnit">Term Unit</Label>
              <Select value={termUnit} onValueChange={setTermUnit}>
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
            <Button onClick={calculateEMI} className="flex-1">
              Calculate EMI
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
                  <div className="text-2xl font-bold text-primary">₹{result.emi}</div>
                  <p className="text-sm text-muted-foreground">Monthly EMI</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">₹{result.totalAmount}</div>
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">₹{result.totalInterest}</div>
                  <p className="text-sm text-muted-foreground">Total Interest</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{result.termInMonths}</div>
                  <p className="text-sm text-muted-foreground">Total Months</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Amortization Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Amortization Schedule (First 12 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Month</th>
                      <th className="text-right p-2">EMI</th>
                      <th className="text-right p-2">Principal</th>
                      <th className="text-right p-2">Interest</th>
                      <th className="text-right p-2">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.amortizationSchedule.map((row: any) => (
                      <tr key={row.month} className="border-b hover:bg-muted/50">
                        <td className="p-2">{row.month}</td>
                        <td className="p-2 text-right">₹{row.emi}</td>
                        <td className="p-2 text-right text-green-600">₹{row.principalPayment}</td>
                        <td className="p-2 text-right text-orange-600">₹{row.interestPayment}</td>
                        <td className="p-2 text-right">₹{row.remainingBalance}</td>
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
            <TrendingUp className="h-5 w-5" />
            About EMI Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>EMI (Equated Monthly Installment)</strong> is the fixed amount you pay each month to repay your loan.
          </p>
          <p>
            The calculation uses the formula: <code className="bg-muted px-1 rounded">EMI = P × r × (1 + r)^n / ((1 + r)^n - 1)</code>
          </p>
          <p>Where:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>P</strong> = Principal loan amount</li>
            <li><strong>r</strong> = Monthly interest rate (annual rate ÷ 12 ÷ 100)</li>
            <li><strong>n</strong> = Total number of months</li>
          </ul>
          <p className="text-xs mt-4 p-3 bg-muted rounded-lg">
            💡 <strong>Tip:</strong> Lower interest rates and shorter loan terms result in lower total interest payments.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanEMICalculator;
