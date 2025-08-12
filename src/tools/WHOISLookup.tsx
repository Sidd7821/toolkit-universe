import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Copy,
  Search,
  Globe,
  CalendarDays,
  ShieldCheck,
  Building2,
  Server,
  ExternalLink,
  Mail,
  MapPin
} from "lucide-react";

interface WHOISApiResponse {
  domain_name: string;
  registrar?: string;
  registrar_url?: string;
  whois_server?: string;
  updated_date?: number[]; // UNIX timestamps
  creation_date?: number[];
  expiration_date?: number[];
  name_servers?: string[];
  emails?: string[];
  dnssec?: string;
  org?: string;
  country?: string;
}

const WHOISLookup = () => {
  const [domain, setDomain] = useState("");
  const [whoisData, setWhoisData] = useState<WHOISApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const validateDomain = (d: string) => {
    const regex =
      /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return regex.test(d);
  };

  const lookupDomain = async () => {
    setError("");
    if (!domain.trim()) return setError("Please enter a domain name");
    if (!validateDomain(domain))
      return setError("Please enter a valid domain name");

    setLoading(true);
    setWhoisData(null);

    try {
      const res = await fetch(
        `https://api.api-ninjas.com/v1/whois?domain=${encodeURIComponent(
          domain
        )}`,{
        headers: { "X-Api-Key": "17/50/hi2nt5iXHg+UdHEg==OFTqW6Whcrm1Pen8" },}
      );
      if (!res.ok) throw new Error(`Error: ${res.statusText}`);
      const data: WHOISApiResponse = await res.json();
      setWhoisData(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch WHOIS data");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      console.error("Clipboard copy failed");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) =>
    e.key === "Enter" && lookupDomain();

  const formatUnix = (unix: number) => {
    const d = new Date(unix * 1000);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short"
    });
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> WHOIS Lookup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., example.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              className="flex-1"
            />
            <Button onClick={lookupDomain} disabled={loading}>
              {loading ? "Looking up..." : "Lookup"}
            </Button>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
      </Card>

      {/* WHOIS Results */}
      {whoisData && (
        <>
          {/* Domain Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" /> Domain Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="font-mono">
                  {whoisData.domain_name}
                </Badge>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(whoisData.domain_name)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(`https://${whoisData.domain_name}`, "_blank")
                    }
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">Registrar:</span>
                  <Badge variant="secondary">
                    {whoisData.registrar || "-"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Organization:</span>
                  <Badge variant="secondary">
                    {whoisData.org || "-"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">Country:</span>
                  <Badge variant="secondary">
                    {whoisData.country?.toUpperCase() || "-"}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-red-500" />
                  <span className="text-sm">DNSSEC:</span>
                  <Badge variant="secondary">
                    {whoisData.dnssec || "-"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" /> Registration Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Created
                </div>
                {whoisData.creation_date?.length
                  ? whoisData.creation_date.map((ts, i) => (
                      <div key={i} className="text-sm">
                        {formatUnix(ts)}
                      </div>
                    ))
                  : "-"}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Expires
                </div>
                {whoisData.expiration_date?.length
                  ? whoisData.expiration_date.map((ts, i) => (
                      <div key={i} className="text-sm">
                        {formatUnix(ts)}
                      </div>
                    ))
                  : "-"}
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Updated
                </div>
                {whoisData.updated_date?.length
                  ? whoisData.updated_date.map((ts, i) => (
                      <div key={i} className="text-sm">
                        {formatUnix(ts)}
                      </div>
                    ))
                  : "-"}
              </div>
            </CardContent>
          </Card>

          {/* Name Servers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" /> Name Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {whoisData.name_servers?.length
                  ? whoisData.name_servers.map((ns, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {ns}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(ns)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))
                  : "-"}
              </div>
            </CardContent>
          </Card>

          {/* Emails */}
          {whoisData.emails && whoisData.emails.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" /> Contact Emails
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {whoisData.emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Badge variant="outline">{email}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(email)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default WHOISLookup;
