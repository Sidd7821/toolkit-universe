import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface JWTPayload {
  [key: string]: any;
}

interface JWTHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

const JWTDecoder = () => {
  const [jwtToken, setJwtToken] = useState("");
  const [decodedHeader, setDecodedHeader] = useState<JWTHeader | null>(null);
  const [decodedPayload, setDecodedPayload] = useState<JWTPayload | null>(null);
  const [signature, setSignature] = useState("");
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();

  const decodeJWT = () => {
    try {
      if (!jwtToken.trim()) {
        toast({
          title: "Error",
          description: "Please enter a JWT token",
          variant: "destructive",
        });
        return;
      }

      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        setIsValid(false);
        toast({
          title: "Invalid JWT",
          description: "JWT must have 3 parts separated by dots",
          variant: "destructive",
        });
        return;
      }

      // Decode header
      const header = JSON.parse(atob(parts[0]));
      setDecodedHeader(header);

      // Decode payload
      const payload = JSON.parse(atob(parts[1]));
      setDecodedPayload(payload);

      // Get signature
      setSignature(parts[2]);
      setIsValid(true);

      toast({
        title: "Success!",
        description: "JWT token decoded successfully",
      });
    } catch (error) {
      setIsValid(false);
      setDecodedHeader(null);
      setDecodedPayload(null);
      setSignature("");
      toast({
        title: "Error",
        description: "Invalid JWT token format",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const clearAll = () => {
    setJwtToken("");
    setDecodedHeader(null);
    setDecodedPayload(null);
    setSignature("");
    setIsValid(null);
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp * 1000).toLocaleString();
  };

  const isExpired = (exp: number) => {
    if (!exp) return false;
    return Date.now() / 1000 > exp;
  };

  const isNotYetValid = (nbf: number) => {
    if (!nbf) return false;
    return Date.now() / 1000 < nbf;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>JWT Decoder</CardTitle>
          <CardDescription>
            Decode and inspect JSON Web Tokens to view their contents and verify their structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="jwt-input" className="text-sm font-medium">
              JWT Token
            </label>
            <Textarea
              id="jwt-input"
              placeholder="Enter your JWT token here (e.g., eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...)"
              value={jwtToken}
              onChange={(e) => setJwtToken(e.target.value)}
              className="min-h-[120px] font-mono text-sm"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={decodeJWT} disabled={!jwtToken.trim()}>
              Decode JWT
            </Button>
            <Button variant="outline" onClick={clearAll}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          {isValid !== null && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={isValid ? "default" : "destructive"}>
                {isValid ? "Valid JWT" : "Invalid JWT"}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {decodedHeader && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Header
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(JSON.stringify(decodedHeader, null, 2), "Header")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap break-all text-sm font-mono">
                {JSON.stringify(decodedHeader, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {decodedPayload && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Payload
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(JSON.stringify(decodedPayload, null, 2), "Payload")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap break-all text-sm font-mono">
                {JSON.stringify(decodedPayload, null, 2)}
              </pre>
            </div>
            
            {/* Common JWT Claims */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Common Claims:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {decodedPayload.iss && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issuer (iss):</span>
                    <span className="font-mono">{decodedPayload.iss}</span>
                  </div>
                )}
                {decodedPayload.sub && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subject (sub):</span>
                    <span className="font-mono">{decodedPayload.sub}</span>
                  </div>
                )}
                {decodedPayload.aud && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Audience (aud):</span>
                    <span className="font-mono">{decodedPayload.aud}</span>
                  </div>
                )}
                {decodedPayload.exp && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expiration (exp):</span>
                    <span className="font-mono">
                      {formatDate(decodedPayload.exp)}
                      {isExpired(decodedPayload.exp) && (
                        <Badge variant="destructive" className="ml-2">Expired</Badge>
                      )}
                    </span>
                  </div>
                )}
                {decodedPayload.nbf && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Not Before (nbf):</span>
                    <span className="font-mono">
                      {formatDate(decodedPayload.nbf)}
                      {isNotYetValid(decodedPayload.nbf) && (
                        <Badge variant="secondary" className="ml-2">Not Yet Valid</Badge>
                      )}
                    </span>
                  </div>
                )}
                {decodedPayload.iat && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Issued At (iat):</span>
                    <span className="font-mono">{formatDate(decodedPayload.iat)}</span>
                  </div>
                )}
                {decodedPayload.jti && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">JWT ID (jti):</span>
                    <span className="font-mono">{decodedPayload.jti}</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {signature && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Signature
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => copyToClipboard(signature, "Signature")}
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between">
                <pre className="whitespace-pre-wrap break-all text-sm font-mono flex-1">
                  {signature}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSecret(!showSecret)}
                  className="ml-2"
                >
                  {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {!showSecret && (
                <p className="text-xs text-muted-foreground mt-2">
                  Signature is hidden for security. Click the eye icon to reveal.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About JWT Tokens</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            JSON Web Tokens (JWT) are a compact, URL-safe means of representing claims to be transferred between two parties.
            They consist of three parts:
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Header:</strong> Contains metadata about the token type and signing algorithm</li>
            <li><strong>Payload:</strong> Contains the claims (user data, permissions, etc.)</li>
            <li><strong>Signature:</strong> Verifies the token hasn't been tampered with</li>
          </ul>
          <p className="pt-2">
            <strong>Note:</strong> This tool only decodes JWT tokens. It cannot verify signatures without the secret key.
            Never share your JWT secret keys or tokens containing sensitive information.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default JWTDecoder;
