import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";
import { Copy, RefreshCw, Hash, Shuffle } from "lucide-react";

const RandomNumberGenerator = () => {
  const [min, setMin] = useState(1);
  const [max, setMax] = useState(100);
  const [count, setCount] = useState(1);
  const [allowDuplicates, setAllowDuplicates] = useState(false);
  const [generatedNumbers, setGeneratedNumbers] = useState<number[]>([]);
  const [includeDecimals, setIncludeDecimals] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState(2);

  const generateNumbers = () => {
    if (min >= max) {
      toast({ 
        title: "Invalid Range", 
        description: "Minimum value must be less than maximum value.", 
        variant: "destructive" 
      });
      return;
    }

    if (count < 1) {
      toast({ 
        title: "Invalid Count", 
        description: "Count must be at least 1.", 
        variant: "destructive" 
      });
      return;
    }

    if (!allowDuplicates && (max - min + 1) < count) {
      toast({ 
        title: "Range Too Small", 
        description: "Cannot generate unique numbers in this range. Increase range or allow duplicates.", 
        variant: "destructive" 
      });
      return;
    }

    const numbers: number[] = [];
    const usedNumbers = new Set<number>();

    while (numbers.length < count) {
      let randomNum: number;
      
      if (includeDecimals) {
        randomNum = Math.random() * (max - min) + min;
        randomNum = Number(randomNum.toFixed(decimalPlaces));
      } else {
        randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
      }

      if (allowDuplicates || !usedNumbers.has(randomNum)) {
        numbers.push(randomNum);
        usedNumbers.add(randomNum);
      }
    }

    setGeneratedNumbers(numbers);
    toast({ 
      title: "Numbers Generated", 
      description: `${count} random number${count > 1 ? 's' : ''} created!` 
    });
  };

  const copyToClipboard = async () => {
    if (generatedNumbers.length === 0) return;
    
    const text = generatedNumbers.join(', ');
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "Numbers copied to clipboard." });
    } catch (err) {
      toast({ 
        title: "Copy failed", 
        description: "Unable to copy to clipboard.", 
        variant: "destructive" 
      });
    }
  };

  const clearNumbers = () => {
    setGeneratedNumbers([]);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Random Number Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="min">Minimum Value</Label>
              <Input
                id="min"
                type="number"
                value={min}
                onChange={(e) => setMin(Number(e.target.value))}
                placeholder="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="max">Maximum Value</Label>
              <Input
                id="max"
                type="number"
                value={max}
                onChange={(e) => setMax(Number(e.target.value))}
                placeholder="100"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Number of Results</Label>
            <Input
              id="count"
              type="number"
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              min="1"
              max="1000"
              placeholder="1"
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="decimals"
                checked={includeDecimals}
                onCheckedChange={(checked) => setIncludeDecimals(checked as boolean)}
              />
              <Label htmlFor="decimals">Include Decimal Numbers</Label>
            </div>

            {includeDecimals && (
              <div className="space-y-2">
                <Label htmlFor="decimalPlaces">Decimal Places</Label>
                <Input
                  id="decimalPlaces"
                  type="number"
                  value={decimalPlaces}
                  onChange={(e) => setDecimalPlaces(Number(e.target.value))}
                  min="0"
                  max="10"
                  placeholder="2"
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              <Checkbox
                id="duplicates"
                checked={allowDuplicates}
                onCheckedChange={(checked) => setAllowDuplicates(checked as boolean)}
              />
              <Label htmlFor="duplicates">Allow Duplicate Numbers</Label>
            </div>
          </div>

          <Button 
            onClick={generateNumbers} 
            className="w-full"
            size="lg"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Numbers
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            Generated Numbers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedNumbers.length > 0 ? (
            <>
              <div className="space-y-2">
                <Label>Results ({generatedNumbers.length})</Label>
                <div className="p-4 bg-muted rounded-lg font-mono text-lg text-center">
                  {generatedNumbers.join(', ')}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={copyToClipboard} 
                  variant="outline" 
                  className="flex-1"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy All
                </Button>
                <Button 
                  onClick={clearNumbers} 
                  variant="outline" 
                  className="flex-1"
                >
                  Clear
                </Button>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Range: {min} to {max}</p>
                <p>Type: {includeDecimals ? 'Decimal' : 'Integer'}</p>
                {includeDecimals && <p>Precision: {decimalPlaces} decimal places</p>}
                <p>Duplicates: {allowDuplicates ? 'Allowed' : 'Not Allowed'}</p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shuffle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Click "Generate Numbers" to create random numbers</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RandomNumberGenerator;
