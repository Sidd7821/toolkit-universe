import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, RotateCcw, Eye, EyeOff, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const TextEncryption = () => {
  const [inputText, setInputText] = useState("");
  const [outputText, setOutputText] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState("encrypt");
  const [algorithm, setAlgorithm] = useState("caesar");
  const [caesarShift, setCaesarShift] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [encryptionStrength, setEncryptionStrength] = useState<"weak" | "medium" | "strong">("medium");
  const { toast } = useToast();

  // Caesar Cipher
  const caesarEncrypt = (text: string, shift: number): string => {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          return String.fromCharCode(((code - base + shift) % 26) + base);
        }
        return char;
      })
      .join('');
  };

  const caesarDecrypt = (text: string, shift: number): string => {
    return caesarEncrypt(text, 26 - shift);
  };

  // Simple XOR encryption
  const xorEncrypt = (text: string, key: string): string => {
    let result = '';
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length).charCodeAt(0);
      result += String.fromCharCode(charCode);
    }
    return btoa(result); // Convert to base64 for safe display
  };

  const xorDecrypt = (text: string, key: string): string => {
    try {
      const decoded = atob(text);
      let result = '';
      for (let i = 0; i < decoded.length; i++) {
        const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length).charCodeAt(0);
        result += String.fromCharCode(charCode);
      }
      return result;
    } catch (error) {
      throw new Error("Invalid encrypted text format");
    }
  };

  // Vigenère Cipher
  const vigenereEncrypt = (text: string, key: string): string => {
    const keyUpper = key.toUpperCase();
    let result = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0);
        const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length);
        const encryptedChar = String.fromCharCode(((charCode - 65 + keyChar - 65) % 26) + 65);
        result += isUpperCase ? encryptedChar : encryptedChar.toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  const vigenereDecrypt = (text: string, key: string): string => {
    const keyUpper = key.toUpperCase();
    let result = '';
    let keyIndex = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[a-z]/i)) {
        const isUpperCase = char === char.toUpperCase();
        const charCode = char.toUpperCase().charCodeAt(0);
        const keyChar = keyUpper.charCodeAt(keyIndex % keyUpper.length);
        const decryptedChar = String.fromCharCode(((charCode - 65 - (keyChar - 65) + 26) % 26) + 65);
        result += isUpperCase ? decryptedChar : decryptedChar.toLowerCase();
        keyIndex++;
      } else {
        result += char;
      }
    }
    return result;
  };

  // Atbash Cipher
  const atbashEncrypt = (text: string): string => {
    return text
      .split('')
      .map(char => {
        if (char.match(/[a-z]/i)) {
          const code = char.charCodeAt(0);
          const isUpperCase = code >= 65 && code <= 90;
          const base = isUpperCase ? 65 : 97;
          const opposite = isUpperCase ? 90 : 122;
          return String.fromCharCode(opposite - (code - base));
        }
        return char;
      })
      .join('');
  };

  const encryptText = () => {
    try {
      if (!inputText.trim()) {
        toast({
          title: "Error",
          description: "Please enter text to encrypt",
          variant: "destructive",
        });
        return;
      }

      let encrypted = "";
      switch (algorithm) {
        case "caesar":
          encrypted = caesarEncrypt(inputText, caesarShift);
          break;
        case "xor":
          if (!password.trim()) {
            toast({
              title: "Error",
              description: "Password is required for XOR encryption",
              variant: "destructive",
            });
            return;
          }
          encrypted = xorEncrypt(inputText, password);
          break;
        case "vigenere":
          if (!password.trim()) {
            toast({
              title: "Error",
              description: "Password is required for Vigenère encryption",
              variant: "destructive",
            });
            return;
          }
          encrypted = vigenereEncrypt(inputText, password);
          break;
        case "atbash":
          encrypted = atbashEncrypt(inputText);
          break;
        default:
          encrypted = caesarEncrypt(inputText, caesarShift);
      }

      setOutputText(encrypted);
      toast({
        title: "Success!",
        description: "Text encrypted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to encrypt text",
        variant: "destructive",
      });
    }
  };

  const decryptText = () => {
    try {
      if (!inputText.trim()) {
        toast({
          title: "Error",
          description: "Please enter text to decrypt",
          variant: "destructive",
        });
        return;
      }

      let decrypted = "";
      switch (algorithm) {
        case "caesar":
          decrypted = caesarDecrypt(inputText, caesarShift);
          break;
        case "xor":
          if (!password.trim()) {
            toast({
              title: "Error",
              description: "Password is required for XOR decryption",
              variant: "destructive",
            });
            return;
          }
          decrypted = xorDecrypt(inputText, password);
          break;
        case "vigenere":
          if (!password.trim()) {
            toast({
              title: "Error",
              description: "Password is required for Vigenère decryption",
              variant: "destructive",
            });
            return;
          }
          decrypted = vigenereDecrypt(inputText, password);
          break;
        case "atbash":
          decrypted = atbashEncrypt(inputText); // Atbash is symmetric
          break;
        default:
          decrypted = caesarDecrypt(inputText, caesarShift);
      }

      setOutputText(decrypted);
      toast({
        title: "Success!",
        description: "Text decrypted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decrypt text. Check your input and password.",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(outputText);
      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
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
    setInputText("");
    setOutputText("");
    setPassword("");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setInputText("");
    setOutputText("");
  };

  const handleAlgorithmChange = (value: string) => {
    setAlgorithm(value);
    setInputText("");
    setOutputText("");
    setPassword("");
    
    // Set encryption strength based on algorithm
    switch (value) {
      case "caesar":
        setEncryptionStrength("weak");
        break;
      case "atbash":
        setEncryptionStrength("weak");
        break;
      case "vigenere":
        setEncryptionStrength("medium");
        break;
      case "xor":
        setEncryptionStrength("strong");
        break;
      default:
        setEncryptionStrength("medium");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Encryption/Decryption Tool</CardTitle>
          <CardDescription>
            Secure your text with various encryption algorithms. Choose the method that fits your security needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="encrypt">
                <Lock className="w-4 h-4 mr-2" />
                Encrypt
              </TabsTrigger>
              <TabsTrigger value="decrypt">
                <Unlock className="w-4 h-4 mr-2" />
                Decrypt
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="encrypt" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="algorithm-select" className="text-sm font-medium">
                      Encryption Algorithm
                    </label>
                    <Select value={algorithm} onValueChange={handleAlgorithmChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caesar">Caesar Cipher</SelectItem>
                        <SelectItem value="atbash">Atbash Cipher</SelectItem>
                        <SelectItem value="vigenere">Vigenère Cipher</SelectItem>
                        <SelectItem value="xor">XOR Encryption</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Security Level</label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          encryptionStrength === "weak" ? "destructive" : 
                          encryptionStrength === "medium" ? "default" : 
                          "secondary"
                        }
                      >
                        {encryptionStrength.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {algorithm === "caesar" && (
                  <div className="space-y-2">
                    <label htmlFor="caesar-shift" className="text-sm font-medium">
                      Shift Value: {caesarShift}
                    </label>
                    <input
                      id="caesar-shift"
                      type="range"
                      min="1"
                      max="25"
                      value={caesarShift}
                      onChange={(e) => setCaesarShift(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {(algorithm === "xor" || algorithm === "vigenere") && (
                  <div className="space-y-2">
                    <label htmlFor="password-input" className="text-sm font-medium">
                      Password/Key
                    </label>
                    <div className="relative">
                      <Input
                        id="password-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter encryption password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="encrypt-input" className="text-sm font-medium">
                    Text to Encrypt
                  </label>
                  <Textarea
                    id="encrypt-input"
                    placeholder="Enter text to encrypt..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={encryptText} disabled={!inputText.trim()}>
                    <Lock className="w-4 h-4 mr-2" />
                    Encrypt Text
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="decrypt" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="decrypt-algorithm-select" className="text-sm font-medium">
                      Decryption Algorithm
                    </label>
                    <Select value={algorithm} onValueChange={handleAlgorithmChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select algorithm" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caesar">Caesar Cipher</SelectItem>
                        <SelectItem value="atbash">Atbash Cipher</SelectItem>
                        <SelectItem value="vigenere">Vigenère Cipher</SelectItem>
                        <SelectItem value="xor">XOR Encryption</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Security Level</label>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          encryptionStrength === "weak" ? "destructive" : 
                          encryptionStrength === "medium" ? "default" : 
                          "secondary"
                        }
                      >
                        {encryptionStrength.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                </div>

                {algorithm === "caesar" && (
                  <div className="space-y-2">
                    <label htmlFor="decrypt-caesar-shift" className="text-sm font-medium">
                      Shift Value: {caesarShift}
                    </label>
                    <input
                      id="decrypt-caesar-shift"
                      type="range"
                      min="1"
                      max="25"
                      value={caesarShift}
                      onChange={(e) => setCaesarShift(parseInt(e.target.value))}
                      className="w-full"
                    />
                  </div>
                )}

                {(algorithm === "xor" || algorithm === "vigenere") && (
                  <div className="space-y-2">
                    <label htmlFor="decrypt-password-input" className="text-sm font-medium">
                      Password/Key
                    </label>
                    <div className="relative">
                      <Input
                        id="decrypt-password-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter decryption password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="decrypt-input" className="text-sm font-medium">
                    Text to Decrypt
                  </label>
                  <Textarea
                    id="decrypt-input"
                    placeholder="Enter encrypted text to decrypt..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={decryptText} disabled={!inputText.trim()}>
                    <Unlock className="w-4 h-4 mr-2" />
                    Decrypt Text
                  </Button>
                  <Button variant="outline" onClick={clearAll}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {outputText && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Result
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted rounded-lg">
              <pre className="whitespace-pre-wrap break-all text-sm font-mono">{outputText}</pre>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>About Encryption Methods</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Weak</Badge>
              <span><strong>Caesar Cipher:</strong> Simple letter shifting (not secure for real use)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="destructive">Weak</Badge>
              <span><strong>Atbash Cipher:</strong> Reverses alphabet order (not secure for real use)</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default">Medium</Badge>
              <span><strong>Vigenère Cipher:</strong> Uses keyword for polyalphabetic substitution</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Strong</Badge>
              <span><strong>XOR Encryption:</strong> Bit-level encryption with password key</span>
            </div>
          </div>
          <p className="pt-2">
            <strong>Note:</strong> These are educational encryption methods. For real-world security, 
            use established cryptographic libraries and algorithms like AES, RSA, or ChaCha20.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TextEncryption;
