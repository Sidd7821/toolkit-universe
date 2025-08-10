import { useState, useEffect } from "react";
import { Copy, Clock, Globe, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Timezone {
  value: string;
  label: string;
  offset: string;
}

const TimezoneConverter = () => {
  const [sourceTimezone, setSourceTimezone] = useState<string>("");
  const [targetTimezone, setTargetTimezone] = useState<string>("");
  const [sourceTime, setSourceTime] = useState<string>("");
  const [targetTime, setTargetTime] = useState<string>("");
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  const timezones: Timezone[] = [
    { value: "UTC", label: "UTC (Coordinated Universal Time)", offset: "+00:00" },
    { value: "America/New_York", label: "Eastern Time (ET)", offset: "-05:00" },
    { value: "America/Chicago", label: "Central Time (CT)", offset: "-06:00" },
    { value: "America/Denver", label: "Mountain Time (MT)", offset: "-07:00" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)", offset: "-08:00" },
    { value: "America/Anchorage", label: "Alaska Time (AKT)", offset: "-09:00" },
    { value: "Pacific/Honolulu", label: "Hawaii Time (HST)", offset: "-10:00" },
    { value: "Europe/London", label: "Greenwich Mean Time (GMT)", offset: "+00:00" },
    { value: "Europe/Paris", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Berlin", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Rome", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Madrid", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Amsterdam", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Brussels", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Vienna", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Zurich", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Stockholm", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Oslo", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Copenhagen", label: "Central European Time (CET)", offset: "+01:00" },
    { value: "Europe/Helsinki", label: "Eastern European Time (EET)", offset: "+02:00" },
    { value: "Europe/Athens", label: "Eastern European Time (EET)", offset: "+02:00" },
    { value: "Europe/Bucharest", label: "Eastern European Time (EET)", offset: "+02:00" },
    { value: "Europe/Sofia", label: "Eastern European Time (EET)", offset: "+02:00" },
    { value: "Europe/Kiev", label: "Eastern European Time (EET)", offset: "+02:00" },
    { value: "Europe/Moscow", label: "Moscow Standard Time (MSK)", offset: "+03:00" },
    { value: "Asia/Dubai", label: "Gulf Standard Time (GST)", offset: "+04:00" },
    { value: "Asia/Tashkent", label: "Uzbekistan Time (UZT)", offset: "+05:00" },
    { value: "Asia/Kolkata", label: "India Standard Time (IST)", offset: "+05:30" },
    { value: "Asia/Dhaka", label: "Bangladesh Standard Time (BST)", offset: "+06:00" },
    { value: "Asia/Bangkok", label: "Indochina Time (ICT)", offset: "+07:00" },
    { value: "Asia/Singapore", label: "Singapore Time (SGT)", offset: "+08:00" },
    { value: "Asia/Shanghai", label: "China Standard Time (CST)", offset: "+08:00" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)", offset: "+09:00" },
    { value: "Asia/Seoul", label: "Korea Standard Time (KST)", offset: "+09:00" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)", offset: "+10:00" },
    { value: "Australia/Melbourne", label: "Australian Eastern Time (AET)", offset: "+10:00" },
    { value: "Australia/Perth", label: "Australian Western Time (AWT)", offset: "+08:00" },
    { value: "Pacific/Auckland", label: "New Zealand Standard Time (NZST)", offset: "+12:00" },
    { value: "Pacific/Fiji", label: "Fiji Time (FJT)", offset: "+12:00" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Set default timezones
    if (!sourceTimezone) {
      setSourceTimezone("UTC");
    }
    if (!targetTimezone) {
      setTargetTimezone("America/New_York");
    }
  }, [sourceTimezone, targetTimezone]);

  useEffect(() => {
    if (sourceTimezone && targetTimezone && sourceTime) {
      convertTime();
    }
  }, [sourceTimezone, targetTimezone, sourceTime]);

  const convertTime = () => {
    if (!sourceTime || !sourceTimezone || !targetTimezone) return;

    try {
      // Create a date object from the source time
      const [hours, minutes] = sourceTime.split(":").map(Number);
      const sourceDate = new Date();
      sourceDate.setHours(hours, minutes, 0, 0);

      // Get timezone offsets
      const sourceOffset = getTimezoneOffset(sourceTimezone);
      const targetOffset = getTimezoneOffset(targetTimezone);

      // Calculate the difference in minutes
      const offsetDiff = targetOffset - sourceOffset;

      // Apply the offset difference
      const targetDate = new Date(sourceDate.getTime() + offsetDiff * 60000);

      // Format the target time
      const targetHours = targetDate.getHours().toString().padStart(2, "0");
      const targetMinutes = targetDate.getMinutes().toString().padStart(2, "0");
      setTargetTime(`${targetHours}:${targetMinutes}`);
    } catch (error) {
      console.error("Error converting time:", error);
      setTargetTime("");
    }
  };

  const getTimezoneOffset = (timezone: string): number => {
    try {
      const date = new Date();
      const utc = date.getTime() + (date.getTimezoneOffset() * 60000);
      const targetTime = new Date(utc + (date.toLocaleString("en-US", { timeZone: timezone }).split(", ")[1] === "PM" ? 12 : 0) * 3600000);
      return (targetTime.getTime() - utc) / 60000;
    } catch {
      // Fallback to manual offset calculation
      const timezoneObj = timezones.find(tz => tz.value === timezone);
      if (timezoneObj) {
        const offsetStr = timezoneObj.offset;
        const hours = parseInt(offsetStr.slice(1, 3));
        const minutes = parseInt(offsetStr.slice(4, 6));
        return offsetStr.startsWith("+") ? (hours * 60 + minutes) : -(hours * 60 + minutes);
      }
      return 0;
    }
  };

  const setCurrentTimeInTimezone = (timezone: string) => {
    try {
      const now = new Date();
      const timeInZone = now.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });
      setSourceTime(timeInZone);
    } catch (error) {
      console.error("Error getting current time for timezone:", error);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${type} copied to clipboard!`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const clearAll = () => {
    setSourceTime("");
    setTargetTime("");
  };

  const getCurrentTimeInTimezone = (timezone: string): string => {
    try {
      return currentTime.toLocaleTimeString("en-US", {
        timeZone: timezone,
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Time Zone Converter</h2>
        <p className="text-muted-foreground">
          Convert times between different time zones around the world
        </p>
      </div>

      <div className="flex gap-4 justify-center">
        <Button 
          onClick={() => setCurrentTimeInTimezone(sourceTimezone)} 
          variant="outline" 
          size="sm"
          disabled={!sourceTimezone}
        >
          <Clock className="w-4 h-4 mr-2" />
          Set Current Time
        </Button>
        <Button onClick={clearAll} variant="outline" size="sm">
          Clear All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Timezone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Source Time Zone
            </CardTitle>
            <CardDescription>
              Select the time zone and enter the time you want to convert
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="source-timezone">Time Zone</Label>
              <Select value={sourceTimezone} onValueChange={setSourceTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="source-time">Time</Label>
              <div className="flex gap-2">
                <Input
                  id="source-time"
                  type="time"
                  value={sourceTime}
                  onChange={(e) => setSourceTime(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={() => copyToClipboard(sourceTime, "Source time")}
                  variant="outline"
                  size="icon"
                  disabled={!sourceTime}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Current time in {sourceTimezone}: {getCurrentTimeInTimezone(sourceTimezone)}
            </div>
          </CardContent>
        </Card>

        {/* Target Timezone */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Target Time Zone
            </CardTitle>
            <CardDescription>
              Select the time zone you want to convert to
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="target-timezone">Time Zone</Label>
              <Select value={targetTimezone} onValueChange={setTargetTimezone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label} ({tz.offset})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target-time">Converted Time</Label>
              <div className="flex gap-2">
                <Input
                  id="target-time"
                  type="time"
                  value={targetTime}
                  readOnly
                  className="flex-1 bg-muted"
                />
                <Button
                  onClick={() => copyToClipboard(targetTime, "Converted time")}
                  variant="outline"
                  size="icon"
                  disabled={!targetTime}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              Current time in {targetTimezone}: {getCurrentTimeInTimezone(targetTimezone)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Result Display */}
      {sourceTime && targetTime && (
        <Card>
          <CardHeader>
            <CardTitle>Conversion Result</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <div className="text-2xl font-mono">
                {sourceTime} in {sourceTimezone}
              </div>
              <div className="text-4xl font-bold text-primary">
                ↓
              </div>
              <div className="text-2xl font-mono">
                {targetTime} in {targetTimezone}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Time Zones */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Time Zones - Current Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {["UTC", "America/New_York", "Europe/London", "Asia/Tokyo", "Australia/Sydney"].map((tz) => (
              <div key={tz} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">{timezones.find(t => t.value === tz)?.label || tz}</span>
                <span className="text-sm font-mono">{getCurrentTimeInTimezone(tz)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How to Use */}
      <Card>
        <CardHeader>
          <CardTitle>How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• Select a source time zone from the dropdown menu</p>
          <p>• Enter the time you want to convert in the time input field</p>
          <p>• Select a target time zone from the second dropdown</p>
          <p>• The converted time will appear automatically</p>
          <p>• Use "Set Current Time" to quickly set the current time in the source timezone</p>
          <p>• Use the copy buttons to copy times to your clipboard</p>
          <p>• The tool shows current times in popular time zones for reference</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TimezoneConverter;
