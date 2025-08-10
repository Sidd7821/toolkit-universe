import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import ToolCard from "@/components/ToolCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Grid3X3, 
  List, 
  Filter,
  SortAsc,
  Star,
  Zap,
  ArrowRight,
  X,
  Grid3X3 as GridIcon,
  List as ListIcon,
  Sparkles,
  Shield,
  Code,
  Palette,
  Calculator,
  Clock,
  ShoppingCart,
  Eye,
  Smartphone,
  Gamepad2,
  FolderOpen,
  BarChart3,
  PenTool,
  Wrench,
  Image,
  Video,
  FileText,
  LineChart,
  Share2
} from "lucide-react";
import { TOOLS, CATEGORIES } from "@/data/tools";

type SortOption = "name" | "category" | "featured" | "newest";
type ViewMode = "grid" | "list";

const Tools = () => {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedPremium, setSelectedPremium] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const filteredAndSortedTools = useMemo(() => {
    let filtered = TOOLS.filter((tool) => {
      // Search query filter
      const matchesQuery = !query || 
        tool.name.toLowerCase().includes(query.toLowerCase()) ||
        tool.shortDescription.toLowerCase().includes(query.toLowerCase()) ||
        tool.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()));

      // Category filter
      const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || tool.difficulty === selectedDifficulty;

      // Premium filter
      const matchesPremium = selectedPremium === "all" || 
        (selectedPremium === "free" && !tool.isPremium) ||
        (selectedPremium === "premium" && tool.isPremium);

      return matchesQuery && matchesCategory && matchesDifficulty && matchesPremium;
    });

    // Sort tools
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "category":
          return a.category.localeCompare(b.category);
        case "featured":
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return a.name.localeCompare(b.name);
        case "newest":
          // For now, sort by name since we don't have date field
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    return filtered;
  }, [query, selectedCategory, selectedDifficulty, selectedPremium, sortBy]);

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Image, Video, FileText, LineChart, Shield, Sparkles, Share2, Code,
      Calculator, Clock, ShoppingCart, Eye, Smartphone, Gamepad2, FolderOpen,
      BarChart3, Palette, PenTool, Wrench, Grid3X3
    };
    return iconMap[iconName] || Grid3X3;
  };

  const getCategoryName = (categorySlug: string) => {
    const category = CATEGORIES.find(c => c.slug === categorySlug);
    return category?.name || categorySlug;
  };

  const clearAllFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedDifficulty("all");
    setSelectedPremium("all");
    setSortBy("name");
  };

  const hasActiveFilters = query || selectedCategory !== "all" || selectedDifficulty !== "all" || selectedPremium !== "all";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "All Tools — ToolsHub",
    description: "Browse all online tools across images, PDFs, developer, SEO, security and AI.",
    url: "/tools",
  };

  return (
    <main className="min-h-screen">
      <Seo
        title="All Tools — ToolsHub"
        description="Browse all online tools across images, PDFs, developer, SEO, security and AI."
        canonical="/tools"
        keywords={["all tools", "tool directory", "web tools", "online tools"]}
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Grid3X3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">All Tools</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover our complete collection of {TOOLS.length}+ professional tools. Find exactly what you need to boost your productivity.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools by name, description, or tags..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 h-14 text-lg border-2 focus:border-primary transition-all duration-300"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="flex items-center gap-2"
            >
              <GridIcon className="h-4 w-4" />
              Grid View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <ListIcon className="h-4 w-4" />
              List View
            </Button>
          </div>
        </div>
      </section>

      {/* Filters and Results Section */}
      <section className="container mx-auto py-16 px-4">
        {/* Filters Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {query || hasActiveFilters ? `Search Results (${filteredAndSortedTools.length})` : `All Tools (${TOOLS.length})`}
            </h2>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="featured">Featured First</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 p-4 bg-muted/50 rounded-lg">
            <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
            {query && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Search: "{query}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuery("")}
                  className="h-auto p-0 px-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Category: {getCategoryName(selectedCategory)}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory("all")}
                  className="h-auto p-0 px-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedDifficulty !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Difficulty: {selectedDifficulty}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDifficulty("all")}
                  className="h-auto p-0 px-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {selectedPremium !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-2">
                Type: {selectedPremium === "free" ? "Free" : "Premium"}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPremium("all")}
                  className="h-auto p-0 px-1 hover:bg-transparent"
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}

        {/* Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Category Filter */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Difficulty Filter */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Difficulty</label>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Premium Filter */}
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Tool Type</label>
            <Select value={selectedPremium} onValueChange={setSelectedPremium}>
              <SelectTrigger>
                <SelectValue placeholder="All Tools" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tools</SelectItem>
                <SelectItem value="free">Free Tools</SelectItem>
                <SelectItem value="premium">Premium Tools</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Stats */}
          <div className="flex items-end">
            <div className="text-center w-full">
              <div className="text-2xl font-bold text-primary">{filteredAndSortedTools.length}</div>
              <div className="text-sm text-muted-foreground">Tools Found</div>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredAndSortedTools.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or filters to find what you're looking for
            </p>
            <Button onClick={clearAllFilters} variant="outline">
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
            {filteredAndSortedTools.map((tool) => (
              <div key={tool.slug} className={viewMode === "list" ? "flex items-start gap-4 p-4 border border-border rounded-lg hover:shadow-md transition-shadow" : ""}>
                <ToolCard {...tool} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ToolsHub Statistics</h2>
            <p className="text-lg text-muted-foreground">
              Discover the scope of our tool collection
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{TOOLS.length}+</div>
              <div className="text-sm text-muted-foreground">Total Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{CATEGORIES.length}+</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{TOOLS.filter(t => t.isFeatured).length}</div>
              <div className="text-sm text-muted-foreground">Featured Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{TOOLS.filter(t => t.isPremium).length}</div>
              <div className="text-sm text-muted-foreground">Premium Tools</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Can't find what you're looking for?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Browse our categories or suggest a new tool that would help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="hero">
              <Link to="/categories">
                Browse Categories
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Tools;
