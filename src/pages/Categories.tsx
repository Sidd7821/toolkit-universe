import { useState } from "react";
import { Link } from "react-router-dom";
import Seo from "@/components/Seo";
import ToolCard from "@/components/ToolCard";
import CategoryCard from "@/components/CategoryCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Grid3X3, 
  List, 
  Zap, 
  ArrowRight,
  Star,
  TrendingUp,
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
import { CATEGORIES, TOOLS } from "@/data/tools";

const Categories = () => {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredCategories = CATEGORIES.filter((category) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      category.name.toLowerCase().includes(q) ||
      category.description.toLowerCase().includes(q) ||
      TOOLS.filter(t => t.category === category.slug).some(tool =>
        tool.name.toLowerCase().includes(q) ||
        tool.shortDescription.toLowerCase().includes(q) ||
        tool.tags.some(tag => tag.toLowerCase().includes(q))
      )?.length > 0
    );
  });

  const getCategoryIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      Image, Video, FileText, LineChart, Shield, Sparkles, Share2, Code,
      Calculator, Clock, ShoppingCart, Eye, Smartphone, Gamepad2, FolderOpen,
      BarChart3, Palette, PenTool, Wrench, Grid3X3, TrendingUp
    };
    return iconMap[iconName] || Grid3X3;
  };

  const getCategoryStats = (categorySlug: string) => {
    const tools = TOOLS.filter(t => t.category === categorySlug);
    const featuredTools = tools.filter(t => t.isFeatured).length;
    const totalTools = tools.length;
    return { totalTools, featuredTools };
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Browse All Categories — ToolsHub",
    description: "Explore 200+ free online tools organized by category. Find the perfect tool for your needs.",
    url: "/categories",
  };

  return (
    <main className="min-h-screen">
      <Seo
        title="Browse All Categories — ToolsHub"
        description="Explore 200+ free online tools organized by category. Find the perfect tool for your needs."
        canonical="/categories"
        keywords={["tool categories", "online tools", "free tools", "productivity tools"]}
        jsonLd={jsonLd}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Grid3X3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">Browse All Categories</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Discover 200+ professional tools organized into 20+ categories. Find exactly what you need to boost your productivity.
          </p>
          
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search categories or tools..."
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
              <Grid3X3 className="h-4 w-4" />
              Grid View
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold">
              {query ? `Search Results (${filteredCategories.length})` : "All Categories"}
            </h2>
            {query && (
              <Button
                variant="outline"
                onClick={() => setQuery("")}
                className="flex items-center gap-2"
              >
                Clear Search
              </Button>
            )}
          </div>
          
          {query && (
            <p className="text-muted-foreground">
              Showing categories matching "{query}"
            </p>
          )}
        </div>

        {filteredCategories.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No categories found</h3>
            <p className="text-muted-foreground mb-6">
              Try adjusting your search terms or browse all categories below
            </p>
            <Button onClick={() => setQuery("")} variant="outline">
              View All Categories
            </Button>
          </div>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" : "space-y-6"}>
            {filteredCategories.map((category) => {
              const { totalTools, featuredTools } = getCategoryStats(category.slug);
              const IconComponent = getCategoryIcon(category.icon);
              
              return (
                <div
                  key={category.slug}
                  className={`bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group ${
                    viewMode === "list" ? "flex items-start gap-4" : ""
                  }`}
                >
                  {/* Category Header */}
                  <div className={`${viewMode === "list" ? "flex-shrink-0" : "text-center mb-6"}`}>
                    <div className={`w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 ${
                      viewMode === "list" ? "mx-0" : ""
                    }`}>
                      <IconComponent className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                    <p className="text-muted-foreground text-sm">{category.description}</p>
                  </div>

                  {/* Stats */}
                  <div className={`flex items-center gap-4 mb-4 ${viewMode === "list" ? "ml-4" : "justify-center"}`}>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      {totalTools} tools
                    </Badge>
                    {featuredTools > 0 && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-yellow-500" />
                        {featuredTools} featured
                      </Badge>
                    )}
                  </div>

                  {/* Sample Tools Preview */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3">
                      Popular tools in this category:
                    </h4>
                    <div className="space-y-2">
                      {TOOLS.filter(t => t.category === category.slug)
                        .slice(0, 3)
                        .map((tool) => (
                          <div key={tool.slug} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-primary/30 rounded-full"></div>
                            <span className="text-muted-foreground">{tool.name}</span>
                            {tool.isFeatured && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                        ))}
                      {totalTools > 3 && (
                        <div className="text-xs text-muted-foreground mt-2">
                          +{totalTools - 3} more tools
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className={`${viewMode === "list" ? "ml-4" : "text-center"}`}>
                    <Button asChild size="sm" className="w-full">
                      <Link to={`/category/${category.slug}`} className="flex items-center gap-2">
                        Browse {category.name}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quick Stats Section */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">ToolsHub by the Numbers</h2>
            <p className="text-lg text-muted-foreground">
              Discover why thousands of users trust our platform
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{CATEGORIES.length}+</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{TOOLS.length}+</div>
              <div className="text-sm text-muted-foreground">Free Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{TOOLS.filter(t => t.isFeatured).length}</div>
              <div className="text-sm text-muted-foreground">Featured Tools</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to explore our tools?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start with our most popular categories or search for specific tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="hero">
              <Link to="/tools">
                View All Tools
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

export default Categories;
