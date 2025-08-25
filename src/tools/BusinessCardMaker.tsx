import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Palette, Type, Image as ImageIcon, Settings, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BusinessCardData {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logo?: string;
}

interface CardStyle {
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  fontSize: number;
  fontFamily: string;
  layout: 'horizontal' | 'vertical' | 'centered';
  borderRadius: number;
  shadow: number;
}

const BusinessCardMaker = () => {
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  
  const [cardData, setCardData] = useState<BusinessCardData>({
    name: 'John Doe',
    title: 'Software Engineer',
    company: 'Tech Solutions Inc.',
    email: 'john.doe@techsolutions.com',
    phone: '+1 (555) 123-4567',
    website: 'www.techsolutions.com',
    address: '123 Tech Street, Silicon Valley, CA 94025'
  });

  const [cardStyle, setCardStyle] = useState<CardStyle>({
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#3b82f6',
    fontSize: 16,
    fontFamily: 'Inter',
    layout: 'horizontal',
    borderRadius: 8,
    shadow: 4
  });

  const [showPreview, setShowPreview] = useState(true);

  const fontOptions = [
    { value: 'Inter', label: 'Inter (Modern)' },
    { value: 'Roboto', label: 'Roboto (Clean)' },
    { value: 'Open Sans', label: 'Open Sans (Friendly)' },
    { value: 'Lato', label: 'Lato (Professional)' },
    { value: 'Poppins', label: 'Poppins (Contemporary)' },
    { value: 'Montserrat', label: 'Montserrat (Elegant)' }
  ];

  const layoutOptions = [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' },
    { value: 'centered', label: 'Centered' }
  ];

  const handleInputChange = (field: keyof BusinessCardData, value: string) => {
    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleStyleChange = (field: keyof CardStyle, value: any) => {
    setCardStyle(prev => ({ ...prev, [field]: value }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCardData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadCard = () => {
    if (!cardRef.current) return;
    
    // For now, we'll just show a toast since actual image download requires html2canvas
    toast({
      title: "Download Feature",
      description: "Business card download feature will be implemented with html2canvas integration.",
    });
  };

  const getCardStyles = () => ({
    backgroundColor: cardStyle.backgroundColor,
    color: cardStyle.textColor,
    fontSize: `${cardStyle.fontSize}px`,
    fontFamily: cardStyle.fontFamily,
    borderRadius: `${cardStyle.borderRadius}px`,
    boxShadow: `0 ${cardStyle.shadow}px ${cardStyle.shadow * 2}px rgba(0,0,0,0.1)`,
    border: `1px solid ${cardStyle.accentColor}20`
  });

  const renderCardContent = () => {
    switch (cardStyle.layout) {
      case 'horizontal':
        return (
          <div className="flex items-center gap-4 p-6">
            {cardData.logo && (
              <div className="flex-shrink-0">
                <img 
                  src={cardData.logo} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain rounded"
                />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1" style={{ color: cardStyle.accentColor }}>
                {cardData.name}
              </h2>
              <p className="text-sm font-medium mb-1">{cardData.title}</p>
              <p className="text-sm mb-2">{cardData.company}</p>
              <div className="space-y-1 text-xs">
                <p>📧 {cardData.email}</p>
                <p>📱 {cardData.phone}</p>
                <p>🌐 {cardData.website}</p>
                <p>📍 {cardData.address}</p>
              </div>
            </div>
          </div>
        );
      
      case 'vertical':
        return (
          <div className="text-center p-6 space-y-3">
            {cardData.logo && (
              <div className="mx-auto mb-3">
                <img 
                  src={cardData.logo} 
                  alt="Logo" 
                  className="w-20 h-20 object-contain rounded mx-auto"
                />
              </div>
            )}
            <h2 className="text-xl font-bold" style={{ color: cardStyle.accentColor }}>
              {cardData.name}
            </h2>
            <p className="text-sm font-medium">{cardData.title}</p>
            <p className="text-sm">{cardData.company}</p>
            <div className="space-y-1 text-xs">
              <p>📧 {cardData.email}</p>
              <p>📱 {cardData.phone}</p>
              <p>🌐 {cardData.website}</p>
              <p>📍 {cardData.address}</p>
            </div>
          </div>
        );
      
      case 'centered':
        return (
          <div className="text-center p-6 space-y-4">
            {cardData.logo && (
              <div className="mx-auto mb-4">
                <img 
                  src={cardData.logo} 
                  alt="Logo" 
                  className="w-24 h-24 object-contain rounded-full mx-auto border-2"
                  style={{ borderColor: cardStyle.accentColor }}
                />
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: cardStyle.accentColor }}>
                {cardData.name}
              </h2>
              <p className="text-lg font-medium mb-1">{cardData.title}</p>
              <p className="text-base mb-3">{cardData.company}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <p>📧 {cardData.email}</p>
              <p>📱 {cardData.phone}</p>
              <p>🌐 {cardData.website}</p>
              <p>📍 {cardData.address}</p>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Business Card Settings
              </CardTitle>
              <CardDescription>
                Customize your business card design and content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="content" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="style">Style</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                </TabsList>
                
                <TabsContent value="content" className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={cardData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="title">Job Title</Label>
                      <Input
                        id="title"
                        value={cardData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        placeholder="Enter your job title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Company</Label>
                      <Input
                        id="company"
                        value={cardData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        placeholder="Enter company name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={cardData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={cardData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={cardData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="Enter your website"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={cardData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter your address"
                        rows={2}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="logo">Company Logo</Label>
                      <Input
                        id="logo"
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Upload a logo to display on your business card
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="style" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label>Background Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={cardStyle.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={cardStyle.backgroundColor}
                          onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Text Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={cardStyle.textColor}
                          onChange={(e) => handleStyleChange('textColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={cardStyle.textColor}
                          onChange={(e) => handleStyleChange('textColor', e.target.value)}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Accent Color</Label>
                      <div className="flex gap-2 mt-2">
                        <Input
                          type="color"
                          value={cardStyle.accentColor}
                          onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                          className="w-16 h-10 p-1"
                        />
                        <Input
                          value={cardStyle.accentColor}
                          onChange={(e) => handleStyleChange('accentColor', e.target.value)}
                          placeholder="#3b82f6"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Font Family</Label>
                      <Select value={cardStyle.fontFamily} onValueChange={(value) => handleStyleChange('fontFamily', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fontOptions.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Font Size: {cardStyle.fontSize}px</Label>
                      <Slider
                        value={[cardStyle.fontSize]}
                        onValueChange={(value) => handleStyleChange('fontSize', value[0])}
                        max={24}
                        min={12}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Border Radius: {cardStyle.borderRadius}px</Label>
                      <Slider
                        value={[cardStyle.borderRadius]}
                        onValueChange={(value) => handleStyleChange('borderRadius', value[0])}
                        max={20}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                    
                    <div>
                      <Label>Shadow: {cardStyle.shadow}px</Label>
                      <Slider
                        value={[cardStyle.shadow]}
                        onValueChange={(value) => handleStyleChange('shadow', value[0])}
                        max={10}
                        min={0}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="layout" className="space-y-4">
                  <div>
                    <Label>Layout Style</Label>
                    <Select value={cardStyle.layout} onValueChange={(value: 'horizontal' | 'vertical' | 'centered') => handleStyleChange('layout', value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutOptions.map(layout => (
                          <SelectItem key={layout.value} value={layout.value}>
                            {layout.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {layoutOptions.map(layout => (
                      <div
                        key={layout.value}
                        className={`p-3 border rounded-lg cursor-pointer transition-all ${
                          cardStyle.layout === layout.value
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => handleStyleChange('layout', layout.value)}
                      >
                        <div className="text-xs font-medium text-center mb-2">{layout.label}</div>
                        <div className="w-full h-8 bg-muted rounded flex items-center justify-center">
                          {layout.value === 'horizontal' && <div className="w-3 h-2 bg-primary rounded-full mx-1" />}
                          {layout.value === 'vertical' && <div className="w-2 h-3 bg-primary rounded-full mx-1" />}
                          {layout.value === 'centered' && <div className="w-2 h-2 bg-primary rounded-full mx-1" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={downloadCard} className="w-full" size="lg">
                <Download className="h-4 w-4 mr-2" />
                Download Business Card
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Download as PNG image for printing or digital use
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Live Preview
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
          </div>
          
          {showPreview && (
            <div className="flex justify-center">
              <div
                ref={cardRef}
                className="w-80 h-48 relative overflow-hidden"
                style={getCardStyles()}
              >
                {renderCardContent()}
              </div>
            </div>
          )}
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Design Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Use high contrast colors for better readability</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Keep text size above 12px for print quality</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Choose fonts that reflect your brand personality</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Standard business card size is 3.5" × 2" (88.9 × 50.8 mm)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BusinessCardMaker;
