import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Bitcoin,
  Bell,
  RefreshCw,
  Star,
  StarOff,
  Info,
  BarChart3,
  Globe,
  Clock,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Currency {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number;
  priceInr: number;
  change24h: number;
  changePercent24h: number;
  marketCap?: number;
  volume24h?: number;
  isFavorite: boolean;
}

interface PriceAlert {
  id: string;
  currencyId: string;
  targetPrice: number;
  condition: "above" | "below";
  isActive: boolean;
}

const CurrencyPriceTracker = () => {
  const { toast } = useToast();
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [filteredCurrencies, setFilteredCurrencies] = useState<Currency[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [currencyView, setCurrencyView] = useState<"usd" | "inr">("usd");

  // Fetch live data from CoinGecko
  const fetchCurrencies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=20&page=1&sparkline=false&vs_currencies=usd,inr"
      );
      if (!res.ok) throw new Error("Failed to fetch data");
      const data = await res.json();

      const mapped: Currency[] = data.map((c: any) => ({
        id: c.id,
        symbol: c.symbol.toUpperCase(),
        name: c.name,
        priceUsd: c.current_price,
        priceInr: c.current_price * 83, // rough conversion, or use /simple/price with inr
        change24h: c.price_change_24h,
        changePercent24h: c.price_change_percentage_24h,
        marketCap: c.market_cap,
        volume24h: c.total_volume,
        isFavorite: currencies.find((cur) => cur.id === c.id)?.isFavorite || false,
      }));

      setCurrencies(mapped);
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Could not fetch live prices",
        variant: "destructive",
      });
    }
  };

  // 🔍 Search new coin dynamically
  const searchNewCurrency = async (query: string) => {
    if (!query) return;
    try {
      const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${query}`);
      const data = await res.json();
      if (data.coins.length === 0) {
        toast({ title: "Not Found", description: "No matching currency found" });
        return;
      }
      const first = data.coins[0]; // take top result
      const priceRes = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${first.id}&vs_currencies=usd,inr&include_24hr_change=true`
      );
      const priceData = await priceRes.json();

      const newCurrency: Currency = {
        id: first.id,
        symbol: first.symbol.toUpperCase(),
        name: first.name,
        priceUsd: priceData[first.id].usd,
        priceInr: priceData[first.id].inr,
        change24h: 0,
        changePercent24h: priceData[first.id].usd_24h_change || 0,
        isFavorite: false,
      };

      setCurrencies((prev) => {
        if (prev.some((c) => c.id === newCurrency.id)) return prev;
        return [...prev, newCurrency];
      });

      toast({ title: "Added", description: `${newCurrency.name} added to list` });
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Failed to fetch currency" });
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchCurrencies();
      }, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Filtering
  useEffect(() => {
    let filtered = currencies;

    if (searchQuery) {
      filtered = filtered.filter(
        (currency) =>
          currency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          currency.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory === "crypto") {
      filtered = filtered.filter((currency) => currency.marketCap);
    }

    setFilteredCurrencies(filtered);
  }, [searchQuery, selectedCategory, currencies]);

  // Favorites
  const toggleFavorite = (currencyId: string) => {
    setCurrencies((prev) =>
      prev.map((currency) =>
        currency.id === currencyId ? { ...currency, isFavorite: !currency.isFavorite } : currency
      )
    );
  };

  const formatPrice = (price: number) => {
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center gap-1 ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
        {isPositive ? "+" : ""}
        {change.toFixed(2)}%
      </span>
    );
  };

  const getCurrencyIcon = (symbol: string) => {
    if (symbol === "BTC") return <Bitcoin className="h-6 w-6 text-orange-500" />;
    if (symbol === "ETH")
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
          E
        </div>
      );
    if (symbol.includes("/")) return <Globe className="h-6 w-6 text-blue-500" />;
    return <DollarSign className="h-6 w-6 text-green-500" />;
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
                Price Tracker
              </CardTitle>
              <CardDescription>Live cryptocurrency prices</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Currencies</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button onClick={() => searchNewCurrency(searchQuery)}>Search</Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="crypto">Cryptos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="auto-refresh">Auto Refresh</Label>
                <Switch id="auto-refresh" checked={autoRefresh} onCheckedChange={setAutoRefresh} />
              </div>

              {autoRefresh && (
                <div className="space-y-2">
                  <Label>Refresh Interval: {refreshInterval}s</Label>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              )}

              <Button onClick={fetchCurrencies} className="w-full" disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                {isLoading ? "Refreshing..." : "Refresh Now"}
              </Button>

              <div className="flex items-center justify-between pt-4">
                <Label>Currency View</Label>
                <Select value={currencyView} onValueChange={(val) => setCurrencyView(val as "usd" | "inr")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="inr">INR (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Live Prices
              </CardTitle>
              <CardDescription>{filteredCurrencies.length} currencies found</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredCurrencies.map((currency) => (
                  <div
                    key={currency.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getCurrencyIcon(currency.symbol)}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{currency.name}</h3>
                          <Badge variant="secondary">{currency.symbol}</Badge>
                          {currency.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                        </div>
                        {currency.marketCap && (
                          <p className="text-xs text-muted-foreground">
                            MC: ${(currency.marketCap / 1e9).toFixed(1)}B
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {currencyView === "usd"
                          ? `$${formatPrice(currency.priceUsd)}`
                          : `₹${formatPrice(currency.priceInr)}`}
                      </div>
                      <div className="text-sm">{formatChange(currency.changePercent24h)}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleFavorite(currency.id)}>
                        {currency.isFavorite ? (
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                        ) : (
                          <StarOff className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CurrencyPriceTracker;
