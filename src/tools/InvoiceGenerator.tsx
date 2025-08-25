import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, FileText, Plus, Trash2, Receipt, DollarSign, Calendar, User, Building, Mail } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  currency: string;
  tax: number;
  discount: number;
  
  // Company details
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  companyPhone: string;
  companyLogo: string;
  
  // Client details
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  
  // Items
  items: InvoiceItem[];
  
  // Notes
  notes: string;
  terms: string;
}

const defaultInvoiceData: InvoiceData = {
  invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
  date: new Date().toISOString().split('T')[0],
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  currency: "USD",
  tax: 0,
  discount: 0,
  
  companyName: "Your Company Name",
  companyAddress: "123 Business Street\nCity, State 12345\nCountry",
  companyEmail: "contact@yourcompany.com",
  companyPhone: "+1 (555) 123-4567",
  companyLogo: "",
  
  clientName: "Client Name",
  clientAddress: "456 Client Avenue\nClient City, State 67890\nClient Country",
  clientEmail: "client@example.com",
  clientPhone: "+1 (555) 987-6543",
  
  items: [
    {
      id: "item-1",
      description: "Product or Service Description",
      quantity: 1,
      price: 100
    }
  ],
  
  notes: "Thank you for your business!",
  terms: "Payment is due within 30 days of invoice date."
};

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "ZAR", symbol: "R", name: "South African Rand" }
];

const InvoiceGenerator = () => {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(defaultInvoiceData);
  const [activeTab, setActiveTab] = useState<string>("details");
  const [savedInvoices, setSavedInvoices] = useState<InvoiceData[]>([]);
  
  // Load saved invoices from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("saved-invoices");
    if (saved) {
      try {
        setSavedInvoices(JSON.parse(saved));
      } catch (error) {
        console.error("Failed to load saved invoices", error);
      }
    }
  }, []);
  
  // Save invoices to localStorage when updated
  useEffect(() => {
    if (savedInvoices.length > 0) {
      localStorage.setItem("saved-invoices", JSON.stringify(savedInvoices));
    }
  }, [savedInvoices]);
  
  // Render invoice preview when data changes
  useEffect(() => {
    renderInvoicePreview();
  }, [invoiceData]);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  // Calculate tax amount
  const calculateTaxAmount = () => {
    return calculateSubtotal() * (invoiceData.tax / 100);
  };
  
  // Calculate discount amount
  const calculateDiscountAmount = () => {
    return calculateSubtotal() * (invoiceData.discount / 100);
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTaxAmount() - calculateDiscountAmount();
  };
  
  // Get currency symbol
  const getCurrencySymbol = () => {
    const currency = currencies.find(c => c.code === invoiceData.currency);
    return currency ? currency.symbol : "$";
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol()}${amount.toFixed(2)}`;
  };
  
  // Add new item
  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${invoiceData.items.length + 1}-${Date.now()}`,
      description: "",
      quantity: 1,
      price: 0
    };
    
    setInvoiceData({
      ...invoiceData,
      items: [...invoiceData.items, newItem]
    });
  };
  
  // Remove item
  const removeItem = (id: string) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.filter(item => item.id !== id)
    });
  };
  
  // Update item
  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceData({
      ...invoiceData,
      items: invoiceData.items.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value };
        }
        return item;
      })
    });
  };
  
  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (event.target?.result) {
        setInvoiceData({
          ...invoiceData,
          companyLogo: event.target.result as string
        });
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Save current invoice
  const saveInvoice = () => {
    // Check if invoice with same number already exists
    const existingIndex = savedInvoices.findIndex(
      inv => inv.invoiceNumber === invoiceData.invoiceNumber
    );
    
    let updatedInvoices;
    
    if (existingIndex >= 0) {
      // Update existing invoice
      updatedInvoices = [...savedInvoices];
      updatedInvoices[existingIndex] = { ...invoiceData };
      
      toast({
        title: "Invoice Updated",
        description: `Invoice ${invoiceData.invoiceNumber} has been updated`
      });
    } else {
      // Add new invoice
      updatedInvoices = [...savedInvoices, { ...invoiceData }];
      
      toast({
        title: "Invoice Saved",
        description: `Invoice ${invoiceData.invoiceNumber} has been saved`
      });
    }
    
    setSavedInvoices(updatedInvoices);
  };
  
  // Load saved invoice
  const loadInvoice = (invoice: InvoiceData) => {
    setInvoiceData({ ...invoice });
    setActiveTab("details");
    
    toast({
      title: "Invoice Loaded",
      description: `Invoice ${invoice.invoiceNumber} has been loaded`
    });
  };
  
  // Delete saved invoice
  const deleteInvoice = (invoiceNumber: string) => {
    const updatedInvoices = savedInvoices.filter(
      inv => inv.invoiceNumber !== invoiceNumber
    );
    
    setSavedInvoices(updatedInvoices);
    
    toast({
      title: "Invoice Deleted",
      description: `Invoice ${invoiceNumber} has been deleted`
    });
  };
  
  // Create new invoice
  const createNewInvoice = () => {
    setInvoiceData({
      ...defaultInvoiceData,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
    
    toast({
      title: "New Invoice Created",
      description: "Start filling in the details for your new invoice"
    });
  };
  
  // Render invoice preview
  const renderInvoicePreview = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas dimensions (A4 size at 72 DPI)
    const width = 595;
    const height = 842;
    canvas.width = width;
    canvas.height = height;
    
    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    
    // Set default styles
    ctx.fillStyle = "#333333";
    ctx.font = "12px Arial";
    
    // Draw header
    ctx.fillStyle = "#333333";
    ctx.font = "bold 24px Arial";
    ctx.fillText("INVOICE", 50, 50);
    
    // Draw invoice number and dates
    ctx.font = "12px Arial";
    ctx.fillText(`Invoice Number: ${invoiceData.invoiceNumber}`, 50, 80);
    ctx.fillText(`Date: ${invoiceData.date}`, 50, 100);
    ctx.fillText(`Due Date: ${invoiceData.dueDate}`, 50, 120);
    
    // Draw company logo if available
    if (invoiceData.companyLogo) {
      const img = new Image();
      img.src = invoiceData.companyLogo;
      
      if (img.complete) {
        // Draw logo in top right corner
        const logoWidth = 150;
        const logoHeight = 60;
        ctx.drawImage(img, width - logoWidth - 50, 50, logoWidth, logoHeight);
      } else {
        img.onload = renderInvoicePreview;
      }
    }
    
    // Draw company info
    ctx.font = "bold 14px Arial";
    ctx.fillText("From:", 50, 160);
    ctx.font = "12px Arial";
    ctx.fillText(invoiceData.companyName, 50, 180);
    
    // Handle multi-line address
    const companyAddressLines = invoiceData.companyAddress.split("\n");
    let y = 200;
    companyAddressLines.forEach(line => {
      ctx.fillText(line, 50, y);
      y += 20;
    });
    
    ctx.fillText(`Email: ${invoiceData.companyEmail}`, 50, y);
    y += 20;
    ctx.fillText(`Phone: ${invoiceData.companyPhone}`, 50, y);
    
    // Draw client info
    ctx.font = "bold 14px Arial";
    ctx.fillText("Bill To:", width / 2, 160);
    ctx.font = "12px Arial";
    ctx.fillText(invoiceData.clientName, width / 2, 180);
    
    // Handle multi-line address
    const clientAddressLines = invoiceData.clientAddress.split("\n");
    y = 200;
    clientAddressLines.forEach(line => {
      ctx.fillText(line, width / 2, y);
      y += 20;
    });
    
    ctx.fillText(`Email: ${invoiceData.clientEmail}`, width / 2, y);
    y += 20;
    ctx.fillText(`Phone: ${invoiceData.clientPhone}`, width / 2, y);
    
    // Draw items table header
    y = 300;
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(50, y - 20, width - 100, 30);
    
    ctx.fillStyle = "#333333";
    ctx.font = "bold 12px Arial";
    ctx.fillText("Description", 70, y);
    ctx.fillText("Quantity", 350, y);
    ctx.fillText("Price", 420, y);
    ctx.fillText("Amount", 490, y);
    
    // Draw items
    ctx.font = "12px Arial";
    y += 20;
    
    invoiceData.items.forEach((item, index) => {
      const amount = item.quantity * item.price;
      
      // Alternate row background
      if (index % 2 === 1) {
        ctx.fillStyle = "#f9fafb";
        ctx.fillRect(50, y - 15, width - 100, 25);
        ctx.fillStyle = "#333333";
      }
      
      // Truncate description if too long
      let description = item.description;
      if (description.length > 35) {
        description = description.substring(0, 32) + "...";
      }
      
      ctx.fillText(description, 70, y);
      ctx.fillText(item.quantity.toString(), 350, y);
      ctx.fillText(formatCurrency(item.price), 420, y);
      ctx.fillText(formatCurrency(amount), 490, y);
      
      y += 25;
    });
    
    // Draw totals
    y += 20;
    const subtotal = calculateSubtotal();
    const taxAmount = calculateTaxAmount();
    const discountAmount = calculateDiscountAmount();
    const total = calculateTotal();
    
    ctx.fillStyle = "#f3f4f6";
    ctx.fillRect(350, y - 15, width - 400, 100);
    ctx.fillStyle = "#333333";
    
    ctx.fillText("Subtotal:", 370, y);
    ctx.fillText(formatCurrency(subtotal), 490, y);
    y += 25;
    
    if (invoiceData.tax > 0) {
      ctx.fillText(`Tax (${invoiceData.tax}%):\`, 370, y);
      ctx.fillText(formatCurrency(taxAmount), 490, y);
      y += 25;
    }
    
    if (invoiceData.discount > 0) {
      ctx.fillText(`Discount (${invoiceData.discount}%):\`, 370, y);
      ctx.fillText(`-${formatCurrency(discountAmount)}`, 490, y);
      y += 25;
    }
    
    ctx.font = "bold 14px Arial";
    ctx.fillText("Total:", 370, y);
    ctx.fillText(formatCurrency(total), 490, y);
    
    // Draw notes and terms
    y += 50;
    ctx.font = "bold 12px Arial";
    ctx.fillText("Notes:", 50, y);
    ctx.font = "12px Arial";
    ctx.fillText(invoiceData.notes, 50, y + 20);
    
    y += 50;
    ctx.font = "bold 12px Arial";
    ctx.fillText("Terms & Conditions:", 50, y);
    ctx.font = "12px Arial";
    ctx.fillText(invoiceData.terms, 50, y + 20);
  };
  
  // Download invoice as PDF
  const downloadInvoice = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    try {
      // Create a temporary link
      const link = document.createElement("a");
      link.download = `invoice-${invoiceData.invoiceNumber}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({
        title: "Invoice Downloaded",
        description: "Your invoice has been downloaded as a PNG image"
      });
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download invoice",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5" />
          <span>Invoice Generator</span>
        </CardTitle>
        <CardDescription>
          Create professional invoices for your business
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">
              <Building className="h-4 w-4 mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="items">
              <FileText className="h-4 w-4 mr-2" />
              Items
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Receipt className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="saved">
              <DollarSign className="h-4 w-4 mr-2" />
              Saved
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Invoice Information</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="invoice-number">Invoice Number</Label>
                    <Input
                      id="invoice-number"
                      value={invoiceData.invoiceNumber}
                      onChange={(e) => setInvoiceData({ ...invoiceData, invoiceNumber: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select
                      value={invoiceData.currency}
                      onValueChange={(value) => setInvoiceData({ ...invoiceData, currency: value })}
                    >
                      <SelectTrigger id="currency">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name} ({currency.symbol})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Invoice Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={invoiceData.date}
                      onChange={(e) => setInvoiceData({ ...invoiceData, date: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={invoiceData.dueDate}
                      onChange={(e) => setInvoiceData({ ...invoiceData, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax Rate (%)</Label>
                    <Input
                      id="tax"
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceData.tax}
                      onChange={(e) => setInvoiceData({ ...invoiceData, tax: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={invoiceData.discount}
                      onChange={(e) => setInvoiceData({ ...invoiceData, discount: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
              </div>
              
              {/* Company Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Your Company Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={invoiceData.companyName}
                    onChange={(e) => setInvoiceData({ ...invoiceData, companyName: e.target.value })}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-address">Company Address</Label>
                  <textarea
                    id="company-address"
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    rows={3}
                    value={invoiceData.companyAddress}
                    onChange={(e) => setInvoiceData({ ...invoiceData, companyAddress: e.target.value })}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={invoiceData.companyEmail}
                      onChange={(e) => setInvoiceData({ ...invoiceData, companyEmail: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={invoiceData.companyPhone}
                      onChange={(e) => setInvoiceData({ ...invoiceData, companyPhone: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company-logo">Company Logo</Label>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full"
                    >
                      {invoiceData.companyLogo ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {invoiceData.companyLogo && (
                      <Button 
                        variant="outline" 
                        onClick={() => setInvoiceData({ ...invoiceData, companyLogo: "" })}
                        size="icon"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  {invoiceData.companyLogo && (
                    <div className="mt-2 border rounded p-2 flex justify-center">
                      <img 
                        src={invoiceData.companyLogo} 
                        alt="Company Logo" 
                        className="max-h-16 object-contain"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              {/* Client Details */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Client Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-name">Client Name</Label>
                    <Input
                      id="client-name"
                      value={invoiceData.clientName}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientName: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-address">Client Address</Label>
                    <textarea
                      id="client-address"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      value={invoiceData.clientAddress}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientAddress: e.target.value })}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      value={invoiceData.clientEmail}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientEmail: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      value={invoiceData.clientPhone}
                      onChange={(e) => setInvoiceData({ ...invoiceData, clientPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              
              {/* Notes & Terms */}
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-lg font-medium">Additional Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <textarea
                      id="notes"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      value={invoiceData.notes}
                      onChange={(e) => setInvoiceData({ ...invoiceData, notes: e.target.value })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="terms">Terms & Conditions</Label>
                    <textarea
                      id="terms"
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      rows={3}
                      value={invoiceData.terms}
                      onChange={(e) => setInvoiceData({ ...invoiceData, terms: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setActiveTab("items")}>
                Next: Add Items
              </Button>
            </div>
          </TabsContent>
          
          {/* Items Tab */}
          <TabsContent value="items" className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Invoice Items</h3>
                <Button onClick={addItem} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
              
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Quantity</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 w-[80px]"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-2">
                          <Input
                            value={item.description}
                            onChange={(e) => updateItem(item.id, "description", e.target.value)}
                            placeholder="Item description"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.price}
                            onChange={(e) => updateItem(item.id, "price", parseFloat(e.target.value) || 0)}
                            className="text-right"
                          />
                        </td>
                        <td className="p-2 text-right font-medium">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                        <td className="p-2 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.id)}
                            disabled={invoiceData.items.length <= 1}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t">
                      <td colSpan={3} className="p-2 text-right font-medium">
                        Subtotal:
                      </td>
                      <td className="p-2 text-right font-medium">
                        {formatCurrency(calculateSubtotal())}
                      </td>
                      <td></td>
                    </tr>
                    
                    {invoiceData.tax > 0 && (
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          Tax ({invoiceData.tax}%):
                        </td>
                        <td className="p-2 text-right">
                          {formatCurrency(calculateTaxAmount())}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    
                    {invoiceData.discount > 0 && (
                      <tr>
                        <td colSpan={3} className="p-2 text-right">
                          Discount ({invoiceData.discount}%):
                        </td>
                        <td className="p-2 text-right">
                          -{formatCurrency(calculateDiscountAmount())}
                        </td>
                        <td></td>
                      </tr>
                    )}
                    
                    <tr>
                      <td colSpan={3} className="p-2 text-right font-bold">
                        Total:
                      </td>
                      <td className="p-2 text-right font-bold">
                        {formatCurrency(calculateTotal())}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("details")}>
                Back to Details
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("preview")}>
                Preview Invoice
              </Button>
            </div>
          </TabsContent>
          
          {/* Preview Tab */}
          <TabsContent value="preview" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Invoice Preview</h3>
              <div className="flex gap-2">
                <Button variant="outline" onClick={saveInvoice} className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Save Invoice
                </Button>
                <Button onClick={downloadInvoice} className="flex items-center gap-1">
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 flex justify-center bg-gray-50 dark:bg-gray-900">
              <div className="shadow-lg bg-white">
                <canvas 
                  ref={canvasRef} 
                  style={{
                    width: "595px",
                    height: "842px",
                  }}
                />
              </div>
            </div>
            
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setActiveTab("items")}>
                Back to Items
              </Button>
              <Button variant="outline" onClick={() => setActiveTab("saved")}>
                View Saved Invoices
              </Button>
            </div>
          </TabsContent>
          
          {/* Saved Invoices Tab */}
          <TabsContent value="saved" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Saved Invoices</h3>
              <Button onClick={createNewInvoice} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
            
            {savedInvoices.length > 0 ? (
              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-2 text-left">Invoice #</th>
                      <th className="p-2 text-left">Client</th>
                      <th className="p-2 text-left">Date</th>
                      <th className="p-2 text-right">Amount</th>
                      <th className="p-2 w-[120px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedInvoices.map((invoice) => {
                      // Calculate total for this invoice
                      const total = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
                      const taxAmount = total * (invoice.tax / 100);
                      const discountAmount = total * (invoice.discount / 100);
                      const finalTotal = total + taxAmount - discountAmount;
                      
                      // Get currency symbol
                      const currency = currencies.find(c => c.code === invoice.currency);
                      const symbol = currency ? currency.symbol : "$";
                      
                      return (
                        <tr key={invoice.invoiceNumber} className="border-b">
                          <td className="p-2">{invoice.invoiceNumber}</td>
                          <td className="p-2">{invoice.clientName}</td>
                          <td className="p-2">{invoice.date}</td>
                          <td className="p-2 text-right">{`${symbol}${finalTotal.toFixed(2)}`}</td>
                          <td className="p-2">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => loadInvoice(invoice)}
                                title="Edit"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteInvoice(invoice.invoiceNumber)}
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-muted/20">
                <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-medium">No Saved Invoices</h3>
                <p className="text-muted-foreground">Create and save your first invoice</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;