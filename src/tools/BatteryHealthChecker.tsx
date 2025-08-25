import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  Battery, 
  BatteryCharging, 
  BatteryFull, 
  BatteryLow, 
  BatteryMedium,
  BatteryWarning,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Info
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface BatteryInfo {
  level: number;
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  supported: boolean;
}

const BatteryHealthChecker = () => {
  const [batteryInfo, setBatteryInfo] = useState<BatteryInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { toast } = useToast();

  const getBatteryIcon = (level: number, charging: boolean) => {
    if (charging) return <BatteryCharging className="h-8 w-8 text-green-500" />;
    if (level <= 0.2) return <BatteryLow className="h-8 w-8 text-red-500" />;
    if (level <= 0.4) return <BatteryMedium className="h-8 w-8 text-yellow-500" />;
    if (level <= 0.8) return <Battery className="h-8 w-8 text-blue-500" />;
    return <BatteryFull className="h-8 w-8 text-green-500" />;
  };

  const getBatteryStatus = (level: number, charging: boolean) => {
    if (charging) return "Charging";
    if (level <= 0.1) return "Critical";
    if (level <= 0.2) return "Low";
    if (level <= 0.4) return "Medium";
    if (level <= 0.8) return "Good";
    return "Excellent";
  };

  const getBatteryHealth = (level: number, charging: boolean) => {
    if (charging) return "Charging";
    if (level <= 0.1) return "Critical - Connect charger immediately";
    if (level <= 0.2) return "Low - Consider charging soon";
    if (level <= 0.4) return "Medium - Battery health is acceptable";
    if (level <= 0.8) return "Good - Battery health is good";
    return "Excellent - Battery health is optimal";
  };

  const getBatteryColor = (level: number, charging: boolean) => {
    if (charging) return "text-green-500";
    if (level <= 0.2) return "text-red-500";
    if (level <= 0.4) return "text-yellow-500";
    if (level <= 0.8) return "text-blue-500";
    return "text-green-500";
  };

  const formatTime = (seconds: number) => {
    if (seconds === Infinity) return "Unknown";
    if (seconds === 0) return "Fully charged";
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const checkBattery = async () => {
    setIsLoading(true);
    
    try {
      // Check if Battery API is supported
      if (!('getBattery' in navigator)) {
        setBatteryInfo({
          level: 0,
          charging: false,
          chargingTime: 0,
          dischargingTime: 0,
          supported: false
        });
        return;
      }

      // Get battery information
      const battery = await (navigator as any).getBattery();
      
      const batteryData: BatteryInfo = {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
        supported: true
      };

      setBatteryInfo(batteryData);
      setLastUpdated(new Date());

      // Add event listeners for battery changes
      battery.addEventListener('levelchange', () => {
        setBatteryInfo(prev => prev ? { ...prev, level: battery.level } : null);
      });

      battery.addEventListener('chargingchange', () => {
        setBatteryInfo(prev => prev ? { ...prev, charging: battery.charging } : null);
      });

      battery.addEventListener('chargingtimechange', () => {
        setBatteryInfo(prev => prev ? { ...prev, chargingTime: battery.chargingTime } : null);
      });

      battery.addEventListener('dischargingtimechange', () => {
        setBatteryInfo(prev => prev ? { ...prev, dischargingTime: battery.dischargingTime } : null);
      });

      toast({
        title: "Battery info updated",
        description: "Successfully retrieved battery information",
      });

    } catch (error) {
      console.error('Error getting battery info:', error);
      toast({
        title: "Error",
        description: "Failed to get battery information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkBattery();
  }, []);

  if (!batteryInfo?.supported) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BatteryWarning className="h-5 w-5 text-yellow-500" />
              Battery API Not Supported
            </CardTitle>
            <CardDescription>
              Your browser doesn't support the Battery API, so we can't access battery information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>This feature requires a browser that supports the Battery API</span>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Supported browsers:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Chrome/Chromium (desktop & mobile)</li>
                  <li>• Edge (desktop & mobile)</li>
                  <li>• Opera (desktop & mobile)</li>
                  <li>• Samsung Internet</li>
                </ul>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Not supported in:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Firefox</li>
                  <li>• Safari</li>
                  <li>• Internet Explorer</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Battery Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {getBatteryIcon(batteryInfo.level, batteryInfo.charging)}
                Battery Status
              </CardTitle>
              <CardDescription>
                Real-time battery information from your device
              </CardDescription>
            </div>
            <Button
              onClick={checkBattery}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Battery Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Battery Level</Label>
              <span className={`text-lg font-bold ${getBatteryColor(batteryInfo.level, batteryInfo.charging)}`}>
                {Math.round(batteryInfo.level * 100)}%
              </span>
            </div>
            <Progress value={batteryInfo.level * 100} className="h-3" />
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant={batteryInfo.charging ? "default" : "secondary"}>
              {batteryInfo.charging ? (
                <>
                  <BatteryCharging className="h-3 w-3 mr-1" />
                  Charging
                </>
              ) : (
                <>
                  <Battery className="h-3 w-3 mr-1" />
                  Discharging
                </>
              )}
            </Badge>
            <Badge variant="outline">
              {getBatteryStatus(batteryInfo.level, batteryInfo.charging)}
            </Badge>
          </div>

          {/* Time Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Time to full charge</span>
              </div>
              <div className="text-lg font-medium">
                {batteryInfo.charging ? formatTime(batteryInfo.chargingTime) : "Not charging"}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Zap className="h-4 w-4" />
                <span>Time remaining</span>
              </div>
              <div className="text-lg font-medium">
                {!batteryInfo.charging ? formatTime(batteryInfo.dischargingTime) : "Charging"}
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className="text-xs text-muted-foreground">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Battery Health Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Battery Health Assessment
          </CardTitle>
          <CardDescription>
            Analysis of your battery's current condition and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-start gap-3">
                {batteryInfo.level <= 0.2 ? (
                  <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                )}
                <div>
                  <h4 className="font-medium mb-1">Current Status</h4>
                  <p className="text-sm text-muted-foreground">
                    {getBatteryHealth(batteryInfo.level, batteryInfo.charging)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="space-y-3">
              <h4 className="font-medium">Recommendations:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {batteryInfo.level <= 0.2 && (
                  <li className="flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>Connect your device to a charger immediately to prevent shutdown</span>
                  </li>
                )}
                {batteryInfo.level <= 0.4 && !batteryInfo.charging && (
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-500 mt-1">•</span>
                    <span>Consider charging your device soon to maintain optimal performance</span>
                  </li>
                )}
                {batteryInfo.charging && batteryInfo.level >= 0.8 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>Your battery is almost full. You can unplug the charger to preserve battery health</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Keep your device between 20% and 80% charge for optimal battery longevity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Avoid extreme temperatures to maintain battery health</span>
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Battery Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Battery Care Tips
          </CardTitle>
          <CardDescription>
            Best practices to maintain your device's battery health
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-medium text-green-600">Do's</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Keep battery between 20-80% for optimal health</li>
                <li>• Use original or certified chargers</li>
                <li>• Charge in a cool, well-ventilated area</li>
                <li>• Update your device software regularly</li>
                <li>• Use battery saver mode when needed</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-medium text-red-600">Don'ts</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Don't let battery drain completely</li>
                <li>• Avoid charging in hot environments</li>
                <li>• Don't use cheap, uncertified chargers</li>
                <li>• Avoid leaving device plugged in overnight</li>
                <li>• Don't expose to extreme temperatures</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BatteryHealthChecker;
