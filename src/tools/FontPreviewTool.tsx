import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Type, 
  Copy, 
  Download, 
  Palette, 
  Check,
  Sliders,
  TextCursorInput
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FontPreviewTool = () => {
  const { toast } = useToast();
  
  const [previewText, setPreviewText] = useState<string>("The quick brown fox jumps over the lazy dog.");
  const [customText, setCustomText] = useState<string>("");
  const [fontSize, setFontSize] = useState<number>(24);
  const [fontWeight, setFontWeight] = useState<string>("400");
  const [fontStyle, setFontStyle] = useState<string>("normal");
  const [textAlign, setTextAlign] = useState<string>("left");
  const [lineHeight, setLineHeight] = useState<number>(1.5);
  const [letterSpacing, setLetterSpacing] = useState<number>(0);
  const [textColor, setTextColor] = useState<string>("#000000");
  const [backgroundColor, setBackgroundColor] = useState<string>("#ffffff");
  const [showCustomText, setShowCustomText] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");
  const [selectedFont, setSelectedFont] = useState<string>("Arial");
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  
  // Font categories
  const fontCategories = [
    { id: "popular", name: "Popular" },
    { id: "serif", name: "Serif" },
    { id: "sans-serif", name: "Sans Serif" },
    { id: "display", name: "Display" },
    { id: "handwriting", name: "Handwriting" },
    { id: "monospace", name: "Monospace" },
  ];
  
  // Font collections by category
  const fontCollections: Record<string, string[]> = {
    popular: [
      "Arial", "Helvetica", "Verdana", "Tahoma", "Trebuchet MS", 
      "Times New Roman", "Georgia", "Garamond", 
      "Courier New", "Brush Script MT"
    ],
    serif: [
      "Times New Roman", "Georgia", "Garamond", "Baskerville", "Cambria",
      "Palatino", "Bookman", "Didot", "American Typewriter", "Century Schoolbook"
    ],
    "sans-serif": [
      "Arial", "Helvetica", "Verdana", "Tahoma", "Trebuchet MS",
      "Calibri", "Geneva", "Segoe UI", "Optima", "Futura"
    ],
    display: [
      "Impact", "Comic Sans MS", "Copperplate", "Papyrus", "Broadway",
      "Stencil", "Playbill", "Bauhaus 93", "Chiller", "Snap ITC"
    ],
    handwriting: [
      "Brush Script MT", "Lucida Handwriting", "Bradley Hand", "Pacifico", "Dancing Script",
      "Satisfy", "Great Vibes", "Kaushan Script", "Yellowtail", "Sacramento"
    ],
    monospace: [
      "Courier New", "Courier", "Lucida Console", "Monaco", "Consolas",
      "Inconsolata", "Source Code Pro", "Roboto Mono", "Ubuntu Mono", "Fira Mono"
    ],
  };
  
  // Google Fonts to load
  const googleFonts = [
    "Roboto", "Open Sans", "Lato", "Montserrat", "Oswald", 
    "Raleway", "Poppins", "Nunito", "Playfair Display", "Merriweather",
    "Ubuntu", "Rubik", "Pacifico", "Dancing Script", "Satisfy",
    "Great Vibes", "Kaushan Script", "Yellowtail", "Sacramento",
    "Inconsolata", "Source Code Pro", "Roboto Mono", "Fira Mono"
  ];
  
  // Sample texts for different languages
  const sampleTexts = {
    english: "The quick brown fox jumps over the lazy dog.",
    pangram: "Pack my box with five dozen liquor jugs.",
    lorem: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    numbers: "1234567890 - The quick brown fox jumps over 42 lazy dogs.",
    symbols: "!@#$%^&*()_+-={}[]|\\:;\"'<>,.?/ - Special characters test.",
    multilingual: "Hello / Bonjour / Hola / Ciao / Hallo / こんにちは / 你好",
  };
  
  // Load Google Fonts
  useEffect(() => {
    const loadGoogleFonts = async () => {
      try {
        // Create a link element for Google Fonts
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = `https://fonts.googleapis.com/css2?family=${googleFonts.map(font => 
          font.replace(/ /g, '+') + ':wght@400;700'
        ).join('&')}&display=swap`;
        
        document.head.appendChild(link);
        
        // Mark these fonts as loaded
        const newLoadedFonts = new Set(loadedFonts);
        googleFonts.forEach(font => newLoadedFonts.add(font));
        setLoadedFonts(newLoadedFonts);
      } catch (error) {
        console.error('Error loading Google Fonts:', error);
      }
    };
    
    loadGoogleFonts();
  }, []);
  
  const handleFontCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Set the first font in the category as selected
    if (fontCollections[category] && fontCollections[category].length > 0) {
      setSelectedFont(fontCollections[category][0]);
    }
  };
  
  const handleSampleTextChange = (textKey: string) => {
    setPreviewText(sampleTexts[textKey as keyof typeof sampleTexts] || sampleTexts.english);
  };
  
  const copyCSS = () => {
    const css = `font-family: ${selectedFont}, sans-serif;
font-size: ${fontSize}px;
font-weight: ${fontWeight};
font-style: ${fontStyle};
text-align: ${textAlign};
line-height: ${lineHeight};
letter-spacing: ${letterSpacing}px;
color: ${textColor};
background-color: ${backgroundColor};`;
    
    navigator.clipboard.writeText(css).then(() => {
      toast({
        title: "CSS Copied",
        description: "Font styles copied to clipboard"
      });
    }).catch(err => {
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    });
  };
  
  const downloadImage = () => {
    try {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Set canvas dimensions
      const width = 800;
      const height = 400;
      canvas.width = width;
      canvas.height = height;
      
      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, width, height);
      
      // Set font properties
      ctx.fillStyle = textColor;
      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${selectedFont}", sans-serif`;
      ctx.textAlign = textAlign === 'center' ? 'center' : textAlign === 'right' ? 'right' : 'left';
      
      // Calculate text position
      const x = textAlign === 'center' ? width / 2 : textAlign === 'right' ? width - 40 : 40;
      const y = height / 2;
      
      // Draw text
      const displayText = showCustomText && customText ? customText : previewText;
      const words = displayText.split(' ');
      let line = '';
      let lineY = y - (fontSize * lineHeight * (words.length / 5)) / 2; // Approximate centering
      
      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > width - 80 && i > 0) {
          ctx.fillText(line, x, lineY);
          line = words[i] + ' ';
          lineY += fontSize * lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, lineY);
      
      // Convert canvas to image and download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `font-preview-${selectedFont.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Image Downloaded",
        description: "Font preview image has been downloaded"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not generate preview image",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="h-6 w-6" />
          <span>Font Preview Tool</span>
        </CardTitle>
        <CardDescription>
          Preview and compare different fonts with customizable text and styling options
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Font selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Font Category</Label>
              <div className="flex flex-wrap gap-2">
                {fontCategories.map(category => (
                  <Button 
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFontCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="font-select">Select Font</Label>
              <Select 
                value={selectedFont} 
                onValueChange={setSelectedFont}
              >
                <SelectTrigger id="font-select">
                  <SelectValue placeholder="Select a font" />
                </SelectTrigger>
                <SelectContent>
                  {fontCollections[selectedCategory]?.map(font => (
                    <SelectItem 
                      key={font} 
                      value={font}
                      style={{ fontFamily: `"${font}", sans-serif` }}
                    >
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Sample Text</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('english')}
                >
                  English
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('pangram')}
                >
                  Pangram
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('lorem')}
                >
                  Lorem Ipsum
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('numbers')}
                >
                  Numbers
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('symbols')}
                >
                  Symbols
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleSampleTextChange('multilingual')}
                >
                  Multilingual
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch 
                id="custom-text" 
                checked={showCustomText}
                onCheckedChange={setShowCustomText}
              />
              <Label htmlFor="custom-text">Use Custom Text</Label>
            </div>
            
            {showCustomText && (
              <div className="space-y-2">
                <Label htmlFor="custom-text-input">Custom Text</Label>
                <Textarea 
                  id="custom-text-input"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your custom text here..."
                  rows={3}
                />
              </div>
            )}
          </div>
          
          {/* Middle column - Font preview */}
          <div className="md:col-span-2 space-y-4">
            <div 
              className="p-6 border rounded-md min-h-[200px] flex items-center justify-center overflow-hidden"
              style={{
                fontFamily: `"${selectedFont}", sans-serif`,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                fontStyle: fontStyle,
                textAlign: textAlign as any,
                lineHeight: lineHeight,
                letterSpacing: `${letterSpacing}px`,
                color: textColor,
                backgroundColor: backgroundColor
              }}
            >
              {showCustomText && customText ? customText : previewText}
            </div>
            
            <Tabs defaultValue="typography">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="typography">
                  <TextCursorInput className="h-4 w-4 mr-2" /> Typography
                </TabsTrigger>
                <TabsTrigger value="colors">
                  <Palette className="h-4 w-4 mr-2" /> Colors
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="typography" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="font-size">Font Size</Label>
                      <span className="text-sm">{fontSize}px</span>
                    </div>
                    <Slider
                      id="font-size"
                      min={8}
                      max={72}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="font-weight">Font Weight</Label>
                    <Select 
                      value={fontWeight} 
                      onValueChange={setFontWeight}
                    >
                      <SelectTrigger id="font-weight">
                        <SelectValue placeholder="Select weight" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">Thin (100)</SelectItem>
                        <SelectItem value="200">Extra Light (200)</SelectItem>
                        <SelectItem value="300">Light (300)</SelectItem>
                        <SelectItem value="400">Regular (400)</SelectItem>
                        <SelectItem value="500">Medium (500)</SelectItem>
                        <SelectItem value="600">Semi Bold (600)</SelectItem>
                        <SelectItem value="700">Bold (700)</SelectItem>
                        <SelectItem value="800">Extra Bold (800)</SelectItem>
                        <SelectItem value="900">Black (900)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-style">Font Style</Label>
                    <Select 
                      value={fontStyle} 
                      onValueChange={setFontStyle}
                    >
                      <SelectTrigger id="font-style">
                        <SelectValue placeholder="Select style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="italic">Italic</SelectItem>
                        <SelectItem value="oblique">Oblique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="text-align">Text Alignment</Label>
                    <Select 
                      value={textAlign} 
                      onValueChange={setTextAlign}
                    >
                      <SelectTrigger id="text-align">
                        <SelectValue placeholder="Select alignment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                        <SelectItem value="justify">Justify</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="line-height">Line Height</Label>
                      <span className="text-sm">{lineHeight.toFixed(1)}</span>
                    </div>
                    <Slider
                      id="line-height"
                      min={0.8}
                      max={3}
                      step={0.1}
                      value={[lineHeight]}
                      onValueChange={(value) => setLineHeight(value[0])}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="letter-spacing">Letter Spacing</Label>
                      <span className="text-sm">{letterSpacing}px</span>
                    </div>
                    <Slider
                      id="letter-spacing"
                      min={-5}
                      max={10}
                      step={0.5}
                      value={[letterSpacing]}
                      onValueChange={(value) => setLetterSpacing(value[0])}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="text-color">Text Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="text-color" 
                        type="color" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        type="text" 
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="background-color">Background Color</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="background-color" 
                        type="color" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 p-1"
                      />
                      <Input 
                        type="text" 
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => { setTextColor("#000000"); setBackgroundColor("#ffffff"); }}
                  >
                    Black on White
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setTextColor("#ffffff"); setBackgroundColor("#000000"); }}
                  >
                    White on Black
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setTextColor("#0000ff"); setBackgroundColor("#ffffff"); }}
                  >
                    Blue on White
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => { setTextColor("#ffffff"); setBackgroundColor("#0000ff"); }}
                  >
                    White on Blue
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex gap-2 pt-4">
              <Button onClick={copyCSS} className="flex-1">
                <Copy className="h-4 w-4 mr-2" /> Copy CSS
              </Button>
              <Button onClick={downloadImage} variant="outline" className="flex-1">
                <Download className="h-4 w-4 mr-2" /> Download Preview
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FontPreviewTool;