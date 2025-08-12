import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Trash2, Star, Search, Plus, Clock, Tag, Pin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ClipboardItem {
  id: string;
  text: string;
  timestamp: Date;
  category: string;
  tags: string[];
  isStarred: boolean;
  isPinned: boolean;
  useCount: number;
}

const ClipboardManager = () => {
  const [items, setItems] = useState<ClipboardItem[]>([]);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newTags, setNewTags] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const categories = [
    { value: "general", label: "General" },
    { value: "code", label: "Code" },
    { value: "urls", label: "URLs" },
    { value: "notes", label: "Notes" },
    { value: "emails", label: "Emails" },
    { value: "passwords", label: "Passwords" },
    { value: "addresses", label: "Addresses" },
    { value: "other", label: "Other" },
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "oldest", label: "Oldest First" },
    { value: "useCount", label: "Most Used" },
    { value: "alphabetical", label: "Alphabetical" },
  ];

  // Load items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem("clipboardManager");
    if (savedItems) {
      try {
        const parsed = JSON.parse(savedItems);
        setItems(parsed.map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        })));
      } catch (error) {
        console.error("Failed to parse saved clipboard items:", error);
      }
    }
  }, []);

  // Save items to localStorage whenever items change
  useEffect(() => {
    localStorage.setItem("clipboardManager", JSON.stringify(items));
  }, [items]);

  const addItem = () => {
    if (!newText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to add",
        variant: "destructive",
      });
      return;
    }

    const tags = newTags
      .split(",")
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const newItem: ClipboardItem = {
      id: Date.now().toString(),
      text: newText.trim(),
      timestamp: new Date(),
      category: newCategory,
      tags,
      isStarred: false,
      isPinned: false,
      useCount: 0,
    };

    setItems(prev => [newItem, ...prev]);
    setNewText("");
    setNewTags("");
    setNewCategory("general");

    toast({
      title: "Added to clipboard",
      description: "Text has been saved to your clipboard manager",
    });
  };

  const copyItem = async (item: ClipboardItem) => {
    try {
      await navigator.clipboard.writeText(item.text);
      
      // Update use count
      setItems(prev => prev.map(prevItem => 
        prevItem.id === item.id 
          ? { ...prevItem, useCount: prevItem.useCount + 1 }
          : prevItem
      ));

      toast({
        title: "Copied!",
        description: "Text copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    toast({
      title: "Deleted",
      description: "Item removed from clipboard manager",
    });
  };

  const toggleStar = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isStarred: !item.isStarred } : item
    ));
  };

  const togglePin = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ));
  };

  const editItem = (id: string, newText: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, text: newText } : item
    ));
  };

  const filteredAndSortedItems = items
    .filter(item => {
      const matchesSearch = item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return b.timestamp.getTime() - a.timestamp.getTime();
        case "oldest":
          return a.timestamp.getTime() - b.timestamp.getTime();
        case "useCount":
          return b.useCount - a.useCount;
        case "alphabetical":
          return a.text.localeCompare(b.text);
        default:
          return 0;
      }
    })
    .sort((a, b) => {
      // Pinned items first, then starred items
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (a.isStarred && !b.isStarred) return -1;
      if (!a.isStarred && b.isStarred) return 1;
      return 0;
    });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "code":
        return "💻";
      case "urls":
        return "🔗";
      case "notes":
        return "📝";
      case "emails":
        return "📧";
      case "passwords":
        return "🔐";
      case "addresses":
        return "📍";
      case "other":
        return "📌";
      default:
        return "📋";
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return timestamp.toLocaleDateString();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      addItem();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Copy className="h-5 w-5" />
            Add New Item
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newText">Text Content</Label>
            <Textarea
              id="newText"
              placeholder="Enter text to save to clipboard manager..."
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyPress={handleKeyPress}
              ref={textareaRef}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Press Ctrl+Enter (or Cmd+Enter on Mac) to save
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="newCategory">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {getCategoryIcon(category.value)} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newTags">Tags (comma-separated)</Label>
              <Input
                id="newTags"
                placeholder="work, important, code"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={addItem} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search text or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="categoryFilter">Category</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {getCategoryIcon(category.value)} {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortBy">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clipboard Items */}
      <Card>
        <CardHeader>
          <CardTitle>
            Clipboard Items ({filteredAndSortedItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedItems.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clipboard items found</p>
              <p className="text-sm">Add some text above to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAndSortedItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 border rounded-lg transition-all hover:shadow-md ${
                    item.isPinned ? 'bg-yellow-50 border-yellow-200' : 
                    item.isStarred ? 'bg-blue-50 border-blue-200' : 'bg-background'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {item.isPinned && <Pin className="h-4 w-4 text-yellow-600" />}
                        {item.isStarred && <Star className="h-4 w-4 text-blue-600" />}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryIcon(item.category)} {item.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {formatTimestamp(item.timestamp)}
                        </span>
                        {item.useCount > 0 && (
                          <span className="text-xs text-muted-foreground">
                            Used {item.useCount} time{item.useCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm mb-2 break-words">
                        {item.text.length > 200 
                          ? `${item.text.substring(0, 200)}...` 
                          : item.text
                        }
                      </div>
                      
                      {item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {item.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        size="sm"
                        onClick={() => copyItem(item)}
                        className="w-full"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                      
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleStar(item.id)}
                          className={item.isStarred ? 'text-blue-600' : ''}
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePin(item.id)}
                          className={item.isPinned ? 'text-yellow-600' : ''}
                        >
                          <Pin className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteItem(item.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>About Clipboard Manager</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            The Clipboard Manager helps you store and organize frequently used text snippets, 
            URLs, code snippets, and other content for quick access.
          </p>
          <p>
            <strong>Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li><strong>Categories:</strong> Organize items by type (code, URLs, notes, etc.)</li>
            <li><strong>Tags:</strong> Add custom tags for better organization</li>
            <li><strong>Star & Pin:</strong> Mark important items for quick access</li>
            <li><strong>Search:</strong> Find items by text content or tags</li>
            <li><strong>Usage Tracking:</strong> See how often each item is used</li>
            <li><strong>Local Storage:</strong> All data is stored locally in your browser</li>
          </ul>
          <p>
            <strong>Tips:</strong> Use Ctrl+Enter to quickly add items, and organize frequently used 
            content with categories and tags for better productivity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClipboardManager;
