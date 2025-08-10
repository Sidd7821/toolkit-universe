import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Copy, Check, TrendingUp, TrendingDown } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const CurrencyConverter = () => {
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [rate, setRate] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const currencies = {
    USD: { name: "US Dollar", symbol: "$", flag: "🇺🇸" },
    EUR: { name: "Euro", symbol: "€", flag: "🇪🇺" },
    GBP: { name: "British Pound", symbol: "£", flag: "🇬🇧" },
    JPY: { name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
    CAD: { name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
    AUD: { name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
    CHF: { name: "Swiss Franc", symbol: "CHF", flag: "🇨🇭" },
    CNY: { name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
    INR: { name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
    BRL: { name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
    MXN: { name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
    KRW: { name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
    SGD: { name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
    SEK: { name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
    NOK: { name: "Norwegian Krone", symbol: "kr", flag: "🇳🇴" },
    RUB: { name: "Russian Ruble", symbol: "₽", flag: "🇷🇺" },
    ZAR: { name: "South African Rand", symbol: "R", flag: "🇿🇦" },
    TRY: { name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
    PLN: { name: "Polish Złoty", symbol: "zł", flag: "🇵🇱" },
    CZK: { name: "Czech Koruna", symbol: "Kč", flag: "🇨🇿" }
  };

  // Mock exchange rates (in a real app, you'd use an API like exchangerate-api.com)
  const mockRates: Record<string, Record<string, number>> = {
    USD: {
      EUR: 0.85, GBP: 0.73, JPY: 110.50, CAD: 1.25, AUD: 1.35,
      CHF: 0.92, CNY: 6.45, INR: 74.50, BRL: 5.25, MXN: 20.15,
      KRW: 1180.00, SGD: 1.35, SEK: 8.65, NOK: 8.45, RUB: 73.50,
      ZAR: 14.85, TRY: 8.75, PLN: 3.85, CZK: 21.75
    },
    EUR: {
      USD: 1.18, GBP: 0.86, JPY: 130.00, CAD: 1.47, AUD: 1.59,
      CHF: 1.08, CNY: 7.59, INR: 87.65, BRL: 6.18, MXN: 23.71,
      KRW: 1388.24, SGD: 1.59, SEK: 10.18, NOK: 9.94, RUB: 86.47,
      ZAR: 17.47, TRY: 10.29, PLN: 4.53, CZK: 25.59
    }
  };

  // Generate rates for all currencies (mock data)
  const generateRates = () => {
    const allRates: Record<string, Record<string, number>> = {};
    
    Object.keys(currencies).forEach(base => {
      allRates[base] = {};
      Object.keys(currencies).forEach(target => {
        if (base === target) {
          allRates[base][target] = 1;
        } else if (mockRates[base] && mockRates[base][target]) {
          allRates[base][target] = mockRates[base][target];
        } else if (mockRates[target] && mockRates[target][base]) {
          allRates[base][target] = 1 / mockRates[target][base];
        } else {
          // Generate random realistic rates
          allRates[base][target] = Math.random() * 10 + 0.1;
        }
      });
    });
    
    return allRates;
  };

  const [exchangeRates] = useState(generateRates());

  const convertCurrency = async () => {
    if (!amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid number.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentRate = exchangeRates[fromCurrency]?.[toCurrency] || 1;
      const convertedAmount = Number(amount) * currentRate;
      
      setRate(currentRate);
      setResult(convertedAmount.toFixed(2));
      setLastUpdated(new Date());
      
      toast({
        title: "Conversion complete",
        description: `Converted ${amount} ${fromCurrency} to ${convertedAmount.toFixed(2)} ${toCurrency}`
      });
    } catch (error) {
      toast({
        title: "Conversion failed",
        description: "An error occurred while converting the currency.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    if (result) {
      setAmount(result);
      setResult("");
    }
  };

  const copyResult = async () => {
    if (result) {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Result copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetTool = () => {
    setAmount("");
    setResult("");
    setRate(0);
    setLastUpdated(null);
  };

  const formatCurrency = (value: string, currency: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return "";
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Currency Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>From Currency</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      <span>{info.flag}</span>
                      <span>{code}</span>
                      <span className="text-muted-foreground">({info.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
            />
            {amount && (
              <p className="text-sm text-muted-foreground">
                {formatCurrency(amount, fromCurrency)}
              </p>
            )}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={swapCurrencies}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To Currency</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currencies).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center gap-2">
                      <span>{info.flag}</span>
                      <span>{code}</span>
                      <span className="text-muted-foreground">({info.name})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={convertCurrency} 
              className="flex-1" 
              variant="hero"
              disabled={loading}
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Converting...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Convert
                </>
              )}
            </Button>
            <Button onClick={resetTool} variant="outline">
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Conversion Result</CardTitle>
        </CardHeader>
        <CardContent>
          {result ? (
            <div className="space-y-4">
              <div className="p-6 bg-accent rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(result, toCurrency)}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {formatCurrency(amount, fromCurrency)} = {formatCurrency(result, toCurrency)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Exchange Rate</p>
                  <p className="font-medium">1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Reverse Rate</p>
                  <p className="font-medium">1 {toCurrency} = {(1/rate).toFixed(4)} {fromCurrency}</p>
                </div>
              </div>

              {lastUpdated && (
                <div className="p-3 bg-primary/10 rounded-lg text-center">
                  <p className="text-xs text-primary">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Rates are updated every hour
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={copyResult} className="flex-1" variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Result"}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Popular Conversions</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span>USD → EUR</span>
                    <span className="text-muted-foreground">1.00 → 0.85</span>
                  </div>
                  <div className="flex justify-between">
                    <span>EUR → GBP</span>
                    <span className="text-muted-foreground">1.00 → 0.86</span>
                  </div>
                  <div className="flex justify-between">
                    <span>USD → JPY</span>
                    <span className="text-muted-foreground">1.00 → 110.50</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GBP → EUR</span>
                    <span className="text-muted-foreground">1.00 → 1.16</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select currencies and enter amount to convert</p>
              <p className="text-xs mt-2">Supports {Object.keys(currencies).length} currencies</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;
