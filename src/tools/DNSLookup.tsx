import { useState } from "react";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Copy, Globe, Server, Mail, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DNSAnswer {
  name: string;
  type: number;
  TTL: number;
  data: string;
}

const recordTypes = [
  { value: "ALL", label: "All Types", description: "Fetch all common records" },
  { value: "A", label: "A Record", description: "IPv4 address" },
  { value: "AAAA", label: "AAAA Record", description: "IPv6 address" },
  { value: "CNAME", label: "CNAME Record", description: "Canonical name" },
  { value: "MX", label: "MX Record", description: "Mail exchange" },
  { value: "TXT", label: "TXT Record", description: "Text information" },
  { value: "NS", label: "NS Record", description: "Name server" },
  { value: "SOA", label: "SOA Record", description: "Start of authority" },
];

const typeMap: Record<string, number> = {
  A: 1,
  NS: 2,
  CNAME: 5,
  SOA: 6,
  MX: 15,
  TXT: 16,
  AAAA: 28
};

const getIcon = (type: string) => {
  switch (type) {
    case "A":
    case "AAAA":
      return <Globe className="h-4 w-4" />;
    case "MX":
      return <Mail className="h-4 w-4" />;
    case "NS":
      return <Server className="h-4 w-4" />;
    case "TXT":
      return <Lock className="h-4 w-4" />;
    default:
      return <Globe className="h-4 w-4" />;
  }
};

const typeNumberToName = (type: number) => {
  const entry = Object.entries(typeMap).find(([, code]) => code === type);
  return entry ? entry[0] : type.toString();
};

export default function DNSLookup() {
  const [domain, setDomain] = useState("");
  const [recordType, setRecordType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<DNSAnswer[]>([]);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const validateDomain = (dn: string) =>
    /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(dn);

  const fetchDNSRecords = async (dn: string, type: string) => {
    const typeCode = typeMap[type];
    const res = await fetch(`https://dns.google/resolve?name=${dn}&type=${typeCode}`);
    const data = await res.json();
    return data.Answer || [];
  };

  const lookupDNS = async () => {
    const dn = domain.trim();
    if (!dn) return setError("Please enter a domain name");
    if (!validateDomain(dn)) return setError("Please enter a valid domain name");

    setIsLoading(true);
    setError("");
    setResults([]);

    try {
      let allResults: DNSAnswer[] = [];

      if (recordType === "ALL") {
        const allTypes = Object.keys(typeMap);
        const responses = await Promise.allSettled(allTypes.map(t => fetchDNSRecords(dn, t)));
        responses.forEach((res, idx) => {
          if (res.status === "fulfilled") {
            allResults = [...allResults, ...res.value];
          }
        });
      } else {
        allResults = await fetchDNSRecords(dn, recordType);
      }

      if (allResults.length === 0) throw new Error("No DNS records found.");
      setResults(allResults);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied!", description: "DNS record copied to clipboard" });
    } catch {
      toast({ title: "Copy failed", description: "Could not copy", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" /> DNS Lookup Tool
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                placeholder="example.com"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && lookupDNS()}
              />
            </div>
            <div>
              <Label htmlFor="recordType">Record Type</Label>
              <Select value={recordType} onValueChange={setRecordType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {recordTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-muted-foreground">{type.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>&nbsp;</Label>
              <Button onClick={lookupDNS} disabled={isLoading} className="w-full">
                {isLoading ? "Looking up..." : "Lookup DNS"}
              </Button>
            </div>
          </div>
          {error && <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md"><p className="text-sm text-destructive">{error}</p></div>}
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card>
          <CardHeader><CardTitle>DNS Records for {domain}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {results.map((rec, idx) => (
                <div key={idx} className="p-4 border rounded-lg bg-muted/30 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {getIcon(typeNumberToName(rec.type))}
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{typeNumberToName(rec.type)}</Badge>
                        <span className="font-mono text-sm">{rec.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 break-all">{rec.data}</p>
                      {rec.TTL !== undefined && <p className="text-xs text-muted-foreground mt-1">TTL: {rec.TTL}s</p>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${typeNumberToName(rec.type)}\t${rec.name}\t${rec.data}`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
