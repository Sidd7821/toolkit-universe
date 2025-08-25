import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Percent, 
  ShoppingCart, 
  Truck,
  CreditCard,
  AlertCircle,
  Info,
  Save,
  Download,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfitCalculation {
  productCost: number;
  shippingCost: number;
  platformFees: number;
  marketingCost: number;
  sellingPrice: number;
  profit: number;
  profitMargin: number;
  roi: number;
  breakEvenQuantity: number;
}

interface Platform {
  name: string;
  feePercentage: number;
  transactionFee: number;
  monthlyFee: number;
}

const DropshippingProfitCalculator = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("calculator");
  const [calculations, setCalculations] = useState<ProfitCalculation>({
    productCost: 0,
    shippingCost: 0,
    platformFees: 0,
    marketingCost: 0,
    sellingPrice: 0,
    profit: 0,
    profitMargin: 0,
    roi: 0,
    breakEvenQuantity: 0
  });
  const [selectedPlatform, setSelectedPlatform] = useState<string>("shopify");
  const [quantity, setQuantity] = useState(1);
  const [savedCalculations, setSavedCalculations] = useState<ProfitCalculation[]>([]);

  const platforms: Platform[] = [
    {
      name: "Shopify",
      feePercentage: 2.9,
      transactionFee: 0.30,
      monthlyFee: 29
    },
    {
      name: "WooCommerce",
      feePercentage: 2.9,
      transactionFee: 0.30,
      monthlyFee: 0
    },
    {
      name: "Amazon",
      feePercentage: 15,
      transactionFee: 0,
      monthlyFee: 39.99
    },
    {
      name: "eBay",
      feePercentage: 10,
      transactionFee: 0.30,
      monthlyFee: 0
    },
    {
      name: "Etsy",
      feePercentage: 6.5,
      transactionFee: 0.25,
      monthlyFee: 0
    }
  ];

  const calculateProfit = () => {
    const platform = platforms.find(p => p.name.toLowerCase() === selectedPlatform);
    if (!platform) return;

    const platformFees = (calculations.sellingPrice * platform.feePercentage / 100) + platform.transactionFee;
    const totalCost = calculations.productCost + calculations.shippingCost + platformFees + calculations.marketingCost;
    const profit = calculations.sellingPrice - totalCost;
    const profitMargin = calculations.sellingPrice > 0 ? (profit / calculations.sellingPrice) * 100 : 0;
    const roi = totalCost > 0 ? (profit / totalCost) * 100 : 0;
    const breakEvenQuantity = totalCost > 0 ? Math.ceil(totalCost / profit) : 0;

    setCalculations(prev => ({
      ...prev,
      platformFees,
      profit,
      profitMargin,
      roi,
      breakEvenQuantity
    }));
  };

  const handleInputChange = (field: keyof ProfitCalculation, value: number) => {
    setCalculations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePlatformChange = (platformName: string) => {
    setSelectedPlatform(platformName);
    // Recalculate with new platform
    setTimeout(calculateProfit, 100);
  };

  const saveCalculation = () => {
    const newCalculation = { ...calculations, timestamp: Date.now() };
    setSavedCalculations(prev => [newCalculation, ...prev.slice(0, 9)]);
    toast({
      title: "Calculation Saved!",
      description: "Your profit calculation has been saved",
    });
  };

  const clearCalculation = () => {
    setCalculations({
      productCost: 0,
      shippingCost: 0,
      platformFees: 0,
      marketingCost: 0,
      sellingPrice: 0,
      profit: 0,
      profitMargin: 0,
      roi: 0,
      breakEvenQuantity: 0
    });
    setQuantity(1);
    toast({
      title: "Cleared!",
      description: "All values have been reset",
    });
  };

  const loadCalculation = (calculation: ProfitCalculation) => {
    setCalculations(calculation);
    toast({
      title: "Loaded!",
      description: "Calculation has been loaded",
    });
  };

  const exportToCSV = () => {
    const csvContent = [
      "Product Cost,Shipping Cost,Platform Fees,Marketing Cost,Selling Price,Profit,Profit Margin (%),ROI (%),Break Even Quantity",
      `${calculations.productCost},${calculations.shippingCost},${calculations.platformFees},${calculations.marketingCost},${calculations.sellingPrice},${calculations.profit},${calculations.profitMargin.toFixed(2)},${calculations.roi.toFixed(2)},${calculations.breakEvenQuantity}`
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dropshipping-profit-calculation.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Exported!",
      description: "Calculation exported to CSV",
    });
  };

  useEffect(() => {
    calculateProfit();
  }, [calculations.productCost, calculations.shippingCost, calculations.marketingCost, calculations.sellingPrice, selectedPlatform]);

  const getProfitColor = (profit: number) => {
    if (profit > 0) return 'text-green-600';
    if (profit < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMarginColor = (margin: number) => {
    if (margin > 20) return 'text-green-600';
    if (margin > 10) return 'text-yellow-600';
    if (margin > 0) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Calculator */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Dropshipping Profit Calculator
              </CardTitle>
              <CardDescription>
                Calculate your profit margins, ROI, and break-even points for dropshipping products
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="calculator">Calculator</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="calculator" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product-cost">Product Cost ($)</Label>
                      <Input
                        id="product-cost"
                        type="number"
                        placeholder="0.00"
                        value={calculations.productCost || ''}
                        onChange={(e) => handleInputChange('productCost', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shipping-cost">Shipping Cost ($)</Label>
                      <Input
                        id="shipping-cost"
                        type="number"
                        placeholder="0.00"
                        value={calculations.shippingCost || ''}
                        onChange={(e) => handleInputChange('shippingCost', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="selling-price">Selling Price ($)</Label>
                      <Input
                        id="selling-price"
                        type="number"
                        placeholder="0.00"
                        value={calculations.sellingPrice || ''}
                        onChange={(e) => handleInputChange('sellingPrice', parseFloat(e.target.value) || 0)}
                        step="0.01"
                        min="0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        placeholder="1"
                        value={quantity || ''}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="platform-select">Platform</Label>
                    <Select value={selectedPlatform} onValueChange={handlePlatformChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map((platform) => (
                          <SelectItem key={platform.name.toLowerCase()} value={platform.name.toLowerCase()}>
                            <div className="flex items-center justify-between w-full">
                              <span>{platform.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {platform.feePercentage}% + ${platform.transactionFee}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="marketing-cost">Marketing Cost per Sale ($)</Label>
                    <Input
                      id="marketing-cost"
                      type="number"
                      placeholder="0.00"
                      value={calculations.marketingCost || ''}
                      onChange={(e) => handleInputChange('marketingCost', parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex gap-2">
                <Button onClick={saveCalculation} variant="outline" className="flex-1">
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button onClick={clearCalculation} variant="outline" className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button onClick={exportToCSV} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Display */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">
                    <span className={getProfitColor(calculations.profit)}>
                      ${calculations.profit.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Profit per Sale</div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">
                    <span className={getMarginColor(calculations.profitMargin)}>
                      {calculations.profitMargin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">Profit Margin</div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1">
                    <span className={getProfitColor(calculations.roi)}>
                      {calculations.roi.toFixed(1)}%
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">ROI</div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1 text-blue-600">
                    {calculations.breakEvenQuantity}
                  </div>
                  <div className="text-sm text-muted-foreground">Break Even Qty</div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1 text-purple-600">
                    ${(calculations.profit * quantity).toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Profit ({quantity} units)</div>
                </div>

                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-2xl font-bold mb-1 text-gray-600">
                    ${calculations.platformFees.toFixed(2)}
                  </div>
                  <div className="text-sm text-muted-foreground">Platform Fees</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Cost Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Product Cost:</span>
                  <span className="font-medium">${calculations.productCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Shipping Cost:</span>
                  <span className="font-medium">${calculations.shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Platform Fees:</span>
                  <span className="font-medium">${calculations.platformFees.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Marketing Cost:</span>
                  <span className="font-medium">${calculations.marketingCost.toFixed(2)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between items-center font-bold">
                  <span>Total Cost:</span>
                  <span>${(calculations.productCost + calculations.shippingCost + calculations.platformFees + calculations.marketingCost).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Info & Saved Calculations */}
        <div className="space-y-6">
          {/* Platform Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Platform Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(() => {
                const platform = platforms.find(p => p.name.toLowerCase() === selectedPlatform);
                if (!platform) return null;
                
                return (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{platform.name}</span>
                        <Badge variant="secondary">
                          {platform.feePercentage}% + ${platform.transactionFee}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Monthly fee: {platform.monthlyFee > 0 ? `$${platform.monthlyFee}` : 'Free'}
                      </div>
                    </div>
                  </>
                );
              })()}
            </CardContent>
          </Card>

          {/* Saved Calculations */}
          {savedCalculations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="h-5 w-5" />
                  Saved Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {savedCalculations.map((calc, index) => (
                    <div key={index} className="p-3 bg-muted rounded cursor-pointer hover:bg-muted/80 transition-colors">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium">${calc.sellingPrice}</span>
                        <span className={`text-sm font-medium ${getProfitColor(calc.profit)}`}>
                          ${calc.profit.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cost: ${calc.productCost} | Margin: {calc.profitMargin.toFixed(1)}%
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadCalculation(calc)}
                        className="w-full mt-2"
                      >
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Profit Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p>Aim for at least 20% profit margin for sustainable business</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                <p>Consider shipping costs when pricing products</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <p>Factor in marketing costs for customer acquisition</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                <p>Platform fees can significantly impact profitability</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DropshippingProfitCalculator;
