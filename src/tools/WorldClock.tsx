import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Clock, Globe, Plus, X, Search } from "lucide-react";

interface Timezone {
  id: string;
  name: string;
  city: string;
  country: string;
  offset: number;
  abbreviation: string;
}

const WorldClock = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimezones, setSelectedTimezones] = useState<Timezone[]>([
    { id: "local", name: "Local Time", city: "Your Location", country: "Local", offset: 0, abbreviation: "LOCAL" },
    { id: "utc", name: "UTC", city: "Coordinated Universal Time", country: "Global", offset: 0, abbreviation: "UTC" },
    { id: "est", name: "Eastern Time", city: "New York", country: "USA", offset: -5, abbreviation: "EST" },
    { id: "pst", name: "Pacific Time", city: "Los Angeles", country: "USA", offset: -8, abbreviation: "PST" },
    { id: "gmt", name: "Greenwich Mean Time", city: "London", country: "UK", offset: 0, abbreviation: "GMT" },
    { id: "cet", name: "Central European Time", city: "Paris", country: "France", offset: 1, abbreviation: "CET" },
    { id: "jst", name: "Japan Standard Time", city: "Tokyo", country: "Japan", offset: 9, abbreviation: "JST" },
    { id: "aest", name: "Australian Eastern Time", city: "Sydney", country: "Australia", offset: 10, abbreviation: "AEST" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddTimezone, setShowAddTimezone] = useState(false);
  const [customTimezone, setCustomTimezone] = useState({
    city: "",
    country: "",
    offset: 0
  });

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const popularTimezones: Timezone[] = [
    { id: "mst", name: "Mountain Time", city: "Denver", country: "USA", offset: -7, abbreviation: "MST" },
    { id: "cst", name: "Central Time", city: "Chicago", country: "USA", offset: -6, abbreviation: "CST" },
    { id: "ist", name: "India Standard Time", city: "Mumbai", country: "India", offset: 5.5, abbreviation: "IST" },
    { id: "cst-china", name: "China Standard Time", city: "Beijing", country: "China", offset: 8, abbreviation: "CST" },
    { id: "msk", name: "Moscow Time", city: "Moscow", country: "Russia", offset: 3, abbreviation: "MSK" },
    { id: "brt", name: "Brasília Time", city: "São Paulo", country: "Brazil", offset: -3, abbreviation: "BRT" },
    { id: "sast", name: "South Africa Time", city: "Johannesburg", country: "South Africa", offset: 2, abbreviation: "SAST" },
    { id: "nzt", name: "New Zealand Time", city: "Wellington", country: "New Zealand", offset: 12, abbreviation: "NZT" },
  ];

  const getTimeInTimezone = (offset: number) => {
    const utc = currentTime.getTime() + (currentTime.getTimezoneOffset() * 60000);
    const targetTime = new Date(utc + (offset * 3600000));
    return targetTime;
  };

  const formatTime = (date: Date) => {
    return {
      time: date.toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      }),
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      day: date.toLocaleDateString('en-US', { weekday: 'long' })
    };
  };

  const addTimezone = (timezone: Timezone) => {
    if (selectedTimezones.find(t => t.id === timezone.id)) {
      toast({ 
        title: "Already Added", 
        description: "This timezone is already in your list.", 
        variant: "destructive" 
      });
      return;
    }

    setSelectedTimezones([...selectedTimezones, timezone]);
    toast({ title: "Timezone Added", description: `${timezone.city} timezone added to your list.` });
  };

  const removeTimezone = (id: string) => {
    if (id === "local") {
      toast({ 
        title: "Cannot Remove", 
        description: "Local time cannot be removed.", 
        variant: "destructive" 
      });
      return;
    }

    setSelectedTimezones(selectedTimezones.filter(t => t.id !== id));
    toast({ title: "Timezone Removed", description: "Timezone removed from your list." });
  };

  const addCustomTimezone = () => {
    if (!customTimezone.city.trim() || !customTimezone.country.trim()) {
      toast({ 
        title: "Missing Information", 
        description: "Please enter both city and country names.", 
        variant: "destructive" 
      });
      return;
    }

    const newTimezone: Timezone = {
      id: `custom-${Date.now()}`,
      name: `${customTimezone.city} Time`,
      city: customTimezone.city,
      country: customTimezone.country,
      offset: customTimezone.offset,
      abbreviation: `GMT${customTimezone.offset >= 0 ? '+' : ''}${customTimezone.offset}`
    };

    addTimezone(newTimezone);
    setCustomTimezone({ city: "", country: "", offset: 0 });
    setShowAddTimezone(false);
  };

  const filteredPopularTimezones = popularTimezones.filter(tz => 
    !selectedTimezones.find(selected => selected.id === tz.id) &&
    (tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
     tz.country.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            World Clock
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Local Time */}
          <div className="text-center space-y-2 p-4 bg-primary/5 rounded-lg">
            <Label className="text-lg font-medium">Your Local Time</Label>
            <div className="font-mono text-3xl font-bold">
              {formatTime(currentTime).time}
            </div>
            <div className="text-muted-foreground">
              {formatTime(currentTime).day}, {formatTime(currentTime).date}
            </div>
          </div>

          {/* Selected Timezones */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Your Timezones</Label>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {selectedTimezones.map((timezone) => {
                const timezoneTime = getTimeInTimezone(timezone.offset);
                const { time, date, day } = formatTime(timezoneTime);
                
                return (
                  <div 
                    key={timezone.id}
                    className={`p-4 rounded-lg border ${
                      timezone.id === "local" 
                        ? "bg-primary/10 border-primary/20" 
                        : "bg-muted"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="font-semibold">{timezone.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {timezone.country} • {timezone.abbreviation}
                        </div>
                        <div className="font-mono text-xl mt-2">{time}</div>
                        <div className="text-xs text-muted-foreground">
                          {day}, {date}
                        </div>
                      </div>
                      {timezone.id !== "local" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimezone(timezone.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add Custom Timezone */}
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setShowAddTimezone(!showAddTimezone)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Timezone
            </Button>

            {showAddTimezone && (
              <div className="space-y-4 p-4 border rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={customTimezone.city}
                      onChange={(e) => setCustomTimezone({...customTimezone, city: e.target.value})}
                      placeholder="e.g., Dubai"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={customTimezone.country}
                      onChange={(e) => setCustomTimezone({...customTimezone, country: e.target.value})}
                      placeholder="e.g., UAE"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="offset">UTC Offset (hours)</Label>
                  <Select 
                    value={customTimezone.offset.toString()} 
                    onValueChange={(value) => setCustomTimezone({...customTimezone, offset: Number(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select offset" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 25 }, (_, i) => i - 12).map(offset => (
                        <SelectItem key={offset} value={offset.toString()}>
                          GMT{offset >= 0 ? '+' : ''}{offset} ({offset >= 0 ? '+' : ''}{offset}:00)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={addCustomTimezone} 
                    className="flex-1"
                  >
                    Add Timezone
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAddTimezone(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Popular Timezones
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search">Search Timezones</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities or countries..."
                className="pl-10"
              />
            </div>
          </div>

          {/* Popular Timezones List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredPopularTimezones.length > 0 ? (
              filteredPopularTimezones.map((timezone) => {
                const timezoneTime = getTimeInTimezone(timezone.offset);
                const { time, date } = formatTime(timezoneTime);
                
                return (
                  <div 
                    key={timezone.id}
                    className="p-3 rounded-lg border bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="font-semibold">{timezone.city}</div>
                        <div className="text-sm text-muted-foreground">
                          {timezone.country} • {timezone.abbreviation}
                        </div>
                        <div className="font-mono text-lg mt-1">{time}</div>
                        <div className="text-xs text-muted-foreground">{date}</div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addTimezone(timezone)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No timezones found</p>
                <p className="text-sm">Try adjusting your search or add a custom timezone</p>
              </div>
            )}
          </div>

          {filteredPopularTimezones.length === 0 && searchQuery && (
            <div className="text-center py-4 text-muted-foreground">
              <p>No timezones match "{searchQuery}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorldClock;
