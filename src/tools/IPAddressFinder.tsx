import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  RefreshCw,
  MapPin,
  Globe,
  Shield,
  Wifi,
  Server,
  Clock,
  Search,
  Mail,
  Satellite,
  Hash,
  Building,
} from "lucide-react";

interface IPInfo {
  ip: string;
  country_name: string;
  region: string;
  city: string;
  timezone: string;
  org: string;
  asn: string;
  latitude: number;
  longitude: number;
  postal: string;
  country_code: string;
}

const IPAddressFinder = () => {
  const [currentIP, setCurrentIP] = useState<IPInfo | null>(null);
  const [customIP, setCustomIP] = useState("");
  const [customIPInfo, setCustomIPInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCurrentIP = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://ipapi.co/json/`);
      if (!res.ok) throw new Error("Failed to fetch IP data");
      const data = await res.json();
      setCurrentIP({
        ip: data.ip,
        country_name: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        org: data.org,
        asn: data.asn,
        latitude: data.latitude,
        longitude: data.longitude,
        postal: data.postal,
        country_code: data.country_code,
      });
    } catch {
      setError("Failed to fetch IP information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const lookupCustomIP = async () => {
    if (!customIP.trim()) {
      setError("Please enter an IP address");
      return;
    }
    const ipRegex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(customIP)) {
      setError("Please enter a valid IP address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`https://ipapi.co/${customIP}/json/`);
      if (!res.ok) throw new Error("Failed to fetch custom IP data");
      const data = await res.json();
      if (data.error) throw new Error(data.reason || "Lookup failed");
      setCustomIPInfo({
        ip: data.ip,
        country_name: data.country_name,
        region: data.region,
        city: data.city,
        timezone: data.timezone,
        org: data.org,
        asn: data.asn,
        latitude: data.latitude,
        longitude: data.longitude,
        postal: data.postal,
        country_code: data.country_code,
      });
    } catch {
      setError("Failed to lookup IP address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const InfoRow = ({
    icon: Icon,
    color,
    label,
    value,
  }: {
    icon: any;
    color: string;
    label: string;
    value: string | number;
  }) => (
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color}`} />
      <span className="text-sm font-medium">{label}:</span>
      <span className="text-sm">{value}</span>
    </div>
  );

  useEffect(() => {
    getCurrentIP();
  }, []);

  return (
    <div className="space-y-6">
      {/* Current IP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-blue-600" />
            Your Current IP Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentIP ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-lg font-mono">
                  {currentIP.ip}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={getCurrentIP}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow
                  icon={MapPin}
                  color="text-red-500"
                  label="Location"
                  value={`${currentIP.city}, ${currentIP.region}`}
                />
                <InfoRow
                  icon={Globe}
                  color="text-green-500"
                  label="Country"
                  value={`${currentIP.country_name} (${currentIP.country_code})`}
                />
                <InfoRow
                  icon={Server}
                  color="text-purple-500"
                  label="ISP"
                  value={currentIP.org}
                />
                <InfoRow
                  icon={Clock}
                  color="text-orange-500"
                  label="Timezone"
                  value={currentIP.timezone}
                />
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Loading IP information...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Custom IP Lookup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-indigo-600" />
            Lookup Custom IP Address
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter IP address (e.g., 8.8.8.8)"
              value={customIP}
              onChange={(e) => setCustomIP(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && lookupCustomIP()}
              className="font-mono"
            />
            <Button onClick={lookupCustomIP} disabled={loading}>
              {loading ? "Looking up..." : "Lookup"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </CardContent>
      </Card>

      {/* Custom IP Results */}
      {customIPInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-yellow-600" />
              IP Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InfoRow
              icon={Wifi}
              color="text-blue-500"
              label="IP"
              value={customIPInfo.ip}
            />
            <InfoRow
              icon={MapPin}
              color="text-red-500"
              label="Location"
              value={`${customIPInfo.city}, ${customIPInfo.region}`}
            />
            <InfoRow
              icon={Globe}
              color="text-green-500"
              label="Country"
              value={`${customIPInfo.country_name} (${customIPInfo.country_code})`}
            />
            <InfoRow
              icon={Clock}
              color="text-orange-500"
              label="Timezone"
              value={customIPInfo.timezone}
            />
            <InfoRow
              icon={Mail}
              color="text-pink-500"
              label="Postal Code"
              value={customIPInfo.postal}
            />
            <InfoRow
              icon={Server}
              color="text-purple-500"
              label="ISP"
              value={customIPInfo.org}
            />
            <InfoRow
              icon={Building}
              color="text-teal-500"
              label="ASN"
              value={customIPInfo.asn}
            />
            <InfoRow
              icon={Satellite}
              color="text-gray-500"
              label="Coordinates"
              value={`${customIPInfo.latitude}, ${customIPInfo.longitude}`}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IPAddressFinder;
