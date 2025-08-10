import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, RefreshCw, Copy, Check } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UnitConverter = () => {
  const [category, setCategory] = useState("length");
  const [fromUnit, setFromUnit] = useState("");
  const [toUnit, setToUnit] = useState("");
  const [fromValue, setFromValue] = useState("");
  const [result, setResult] = useState("");
  const [copied, setCopied] = useState(false);

  const conversionCategories = {
    length: {
      name: "Length",
      units: {
        meter: { name: "Meter (m)", factor: 1 },
        kilometer: { name: "Kilometer (km)", factor: 1000 },
        centimeter: { name: "Centimeter (cm)", factor: 0.01 },
        millimeter: { name: "Millimeter (mm)", factor: 0.001 },
        mile: { name: "Mile (mi)", factor: 1609.344 },
        yard: { name: "Yard (yd)", factor: 0.9144 },
        foot: { name: "Foot (ft)", factor: 0.3048 },
        inch: { name: "Inch (in)", factor: 0.0254 },
        nauticalMile: { name: "Nautical Mile", factor: 1852 },
        lightYear: { name: "Light Year", factor: 9.461e15 }
      }
    },
    weight: {
      name: "Weight",
      units: {
        kilogram: { name: "Kilogram (kg)", factor: 1 },
        gram: { name: "Gram (g)", factor: 0.001 },
        milligram: { name: "Milligram (mg)", factor: 0.000001 },
        pound: { name: "Pound (lb)", factor: 0.45359237 },
        ounce: { name: "Ounce (oz)", factor: 0.028349523125 },
        ton: { name: "Metric Ton (t)", factor: 1000 },
        stone: { name: "Stone (st)", factor: 6.35029318 }
      }
    },
    temperature: {
      name: "Temperature",
      units: {
        celsius: { name: "Celsius (°C)", factor: 1, offset: 0 },
        fahrenheit: { name: "Fahrenheit (°F)", factor: 1, offset: 32 },
        kelvin: { name: "Kelvin (K)", factor: 1, offset: 273.15 }
      }
    },
    area: {
      name: "Area",
      units: {
        squareMeter: { name: "Square Meter (m²)", factor: 1 },
        squareKilometer: { name: "Square Kilometer (km²)", factor: 1000000 },
        squareCentimeter: { name: "Square Centimeter (cm²)", factor: 0.0001 },
        squareMile: { name: "Square Mile (mi²)", factor: 2589988.110336 },
        acre: { name: "Acre", factor: 4046.8564224 },
        hectare: { name: "Hectare (ha)", factor: 10000 },
        squareYard: { name: "Square Yard (yd²)", factor: 0.83612736 },
        squareFoot: { name: "Square Foot (ft²)", factor: 0.09290304 }
      }
    },
    volume: {
      name: "Volume",
      units: {
        liter: { name: "Liter (L)", factor: 1 },
        milliliter: { name: "Milliliter (mL)", factor: 0.001 },
        cubicMeter: { name: "Cubic Meter (m³)", factor: 1000 },
        gallon: { name: "US Gallon (gal)", factor: 3.785411784 },
        quart: { name: "US Quart (qt)", factor: 0.946352946 },
        pint: { name: "US Pint (pt)", factor: 0.473176473 },
        cup: { name: "US Cup", factor: 0.236588236 },
        tablespoon: { name: "US Tablespoon (tbsp)", factor: 0.0147867647813 },
        teaspoon: { name: "US Teaspoon (tsp)", factor: 0.00492892159375 }
      }
    },
    speed: {
      name: "Speed",
      units: {
        meterPerSecond: { name: "Meter/Second (m/s)", factor: 1 },
        kilometerPerHour: { name: "Kilometer/Hour (km/h)", factor: 0.27777777777778 },
        milePerHour: { name: "Mile/Hour (mph)", factor: 0.44704 },
        knot: { name: "Knot (kn)", factor: 0.51444444444444 },
        feetPerSecond: { name: "Feet/Second (ft/s)", factor: 0.3048 }
      }
    }
  };

  const handleCategoryChange = (newCategory: string) => {
    setCategory(newCategory);
    setFromUnit("");
    setToUnit("");
    setFromValue("");
    setResult("");
  };

  const convert = () => {
    if (!fromUnit || !toUnit || !fromValue || isNaN(Number(fromValue))) {
      toast({
        title: "Invalid input",
        description: "Please fill in all fields with valid values.",
        variant: "destructive"
      });
      return;
    }

    const categoryData = conversionCategories[category as keyof typeof conversionCategories];
    const fromUnitData = categoryData.units[fromUnit as keyof typeof categoryData.units];
    const toUnitData = categoryData.units[toUnit as keyof typeof categoryData.units];

    if (category === "temperature") {
      // Special handling for temperature conversions
      let celsius: number;
      
      if (fromUnit === "celsius") {
        celsius = Number(fromValue);
      } else if (fromUnit === "fahrenheit") {
        celsius = (Number(fromValue) - 32) * 5/9;
      } else if (fromUnit === "kelvin") {
        celsius = Number(fromValue) - 273.15;
      } else {
        celsius = Number(fromValue);
      }

      let convertedValue: number;
      if (toUnit === "celsius") {
        convertedValue = celsius;
      } else if (toUnit === "fahrenheit") {
        convertedValue = celsius * 9/5 + 32;
      } else if (toUnit === "kelvin") {
        convertedValue = celsius + 273.15;
      } else {
        convertedValue = celsius;
      }

      setResult(convertedValue.toFixed(6));
    } else {
      // Standard conversion for other categories
      const baseValue = Number(fromValue) * fromUnitData.factor;
      const convertedValue = baseValue / toUnitData.factor;
      setResult(convertedValue.toFixed(6));
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
    if (result) {
      setFromValue(result);
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
    setFromUnit("");
    setToUnit("");
    setFromValue("");
    setResult("");
  };

  const currentCategory = conversionCategories[category as keyof typeof conversionCategories];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Unit Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(conversionCategories).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>From Unit</Label>
            <Select value={fromUnit} onValueChange={setFromUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select from unit" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currentCategory.units).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Value</Label>
            <Input
              type="number"
              placeholder="Enter value"
              value={fromValue}
              onChange={(e) => setFromValue(e.target.value)}
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={swapUnits}
              variant="outline"
              size="icon"
              className="rounded-full"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <Label>To Unit</Label>
            <Select value={toUnit} onValueChange={setToUnit}>
              <SelectTrigger>
                <SelectValue placeholder="Select to unit" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(currentCategory.units).map(([key, value]) => (
                  <SelectItem key={key} value={key}>
                    {value.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button onClick={convert} className="flex-1" variant="hero">
              Convert
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
                <p className="text-2xl font-bold text-primary">{result}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {fromValue} {currentCategory.units[fromUnit as keyof typeof currentCategory.units]?.name} = 
                  {" "}{result} {currentCategory.units[toUnit as keyof typeof currentCategory.units]?.name}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={copyResult} className="flex-1" variant="outline">
                  {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy Result"}
                </Button>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Conversion Formula</h4>
                <p className="text-sm text-muted-foreground">
                  {category === "temperature" 
                    ? "Temperature conversions use specific formulas (Celsius ↔ Fahrenheit ↔ Kelvin)"
                    : `Converted using standard conversion factors: ${fromValue} × ${currentCategory.units[fromUnit as keyof typeof currentCategory.units]?.factor} ÷ ${currentCategory.units[toUnit as keyof typeof currentCategory.units]?.factor}`
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select units and enter a value to convert</p>
              <p className="text-xs mt-2">Choose from {Object.keys(conversionCategories).length} categories</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UnitConverter;
