import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ToolCard from "@/components/ToolCard";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Zap, 
  Users, 
  TrendingUp, 
  Shield, 
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  CheckCircle2,
  Quote,
  Heart
} from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TOOLS;
    return TOOLS.filter((t) =>
      [t.name, t.shortDescription, t.category, ...(t.tags || [])]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  const featuredTools = TOOLS.filter(t => t.isFeatured).slice(0, 6);
  const popularCategories = CATEGORIES.slice(0, 6);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "ToolsHub",
    url: "/",
    potentialAction: {
      "@type": "SearchAction",
      target: "/search?q={query}",
      "query-input": "required name=query",
    },
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Web Developer",
      content: "ToolsHub has saved me hours of work. The JSON formatter and PDF tools are my daily go-to!",
      rating: 5,
      avatar: "SC"
    },
    {
      name: "Mike Rodriguez",
      role: "Digital Marketer",
      content: "The SEO tools are incredibly helpful. I use them for all my client projects.",
      rating: 5,
      avatar: "MR"
    },
    {
      name: "Emma Thompson",
      role: "Content Creator",
      content: "Love the AI tools and image compression features. Makes my workflow so much smoother.",
      rating: 5,
      avatar: "ET"
    }
  ];

  return (
    <main className="min-h-screen">
      <Seo
        title="ToolsHub — 200+ Free Online Tools"
        description="Work faster with 200+ image, PDF, developer, SEO, security and AI tools. All in your browser."
        canonical="/"
        keywords={["online tools", "image tools", "PDF tools", "developer tools", "SEO", "AI tools"]}
        jsonLd={jsonLd}
      />

      <Hero />

      {/* Enhanced Search Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Search className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Find the perfect tool</h2>
          </div>
          <p className="text-lg text-muted-foreground mb-8">
            Search through our collection of 200+ professional tools to boost your productivity
          </p>
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tools (e.g., JSON formatter, PDF merger, image compressor)…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search tools"
              className="pl-12 h-14 text-lg border-2 focus:border-primary transition-all duration-300"
            />
          </div>
          {query && (
            <div className="mt-4 text-sm text-muted-foreground">
              Found {filtered.length} tool{filtered.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </section>

      {/* Search Results Section */}
      {query && (
        <section className="container mx-auto py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-semibold mb-2">Search Results</h3>
              <p className="text-muted-foreground">
                Showing {filtered.length} tool{filtered.length !== 1 ? 's' : ''} for "{query}"
              </p>
            </div>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((tool) => (
                  <ToolCard key={tool.slug} {...tool} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tools found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms or browse our categories below
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Stats Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center group">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">200+</div>
            <div className="text-sm text-muted-foreground">Free Tools</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">50K+</div>
            <div className="text-sm text-muted-foreground">Happy Users</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
            <div className="text-sm text-muted-foreground">Available</div>
          </div>
          <div className="text-center group">
            <div className="text-3xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
            <div className="text-sm text-muted-foreground">Free</div>
          </div>
        </div>
      </section>

      {/* Featured Tools Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <h2 className="text-3xl font-bold">Featured Tools</h2>
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our most popular and powerful tools that users love
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {featuredTools.map((t) => (
            <ToolCard key={t.slug} {...t} />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link to="/tools">
              View All Tools
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Tool Categories</h2>
            <Zap className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore tools by category to find exactly what you need
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {popularCategories.map((c) => (
            <CategoryCard
              key={c.slug}
              slug={c.slug}
              name={c.name}
              description={c.description}
              icon={c.icon as any}
            />
          ))}
        </div>
        <div className="text-center mt-12">
          <Button asChild size="lg" variant="outline">
            <Link to="/categories">
              Browse All Categories
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
            <h2 className="text-3xl font-bold">What Users Say</h2>
            <Heart className="h-6 w-6 text-red-500 fill-red-500" />
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who trust ToolsHub for their daily tasks
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
              <div className="flex items-center gap-2 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <Quote className="h-8 w-8 text-primary/30 mb-4" />
              <p className="text-muted-foreground mb-4 italic">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-sm font-semibold text-primary">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Why Choose ToolsHub?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We provide the best online tools experience with these key benefits
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 group hover-lift">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">100% Secure</h3>
            <p className="text-muted-foreground">
              All tools run in your browser. No data is sent to our servers.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 group hover-lift">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
            <p className="text-muted-foreground">
              Get results in seconds. No waiting, no downloads, no installations.
            </p>
          </div>
          <div className="text-center p-6 rounded-lg border border-border hover:border-primary/50 transition-all duration-300 group hover-lift">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Always Updated</h3>
            <p className="text-muted-foreground">
              New tools added regularly. Stay ahead with the latest technology.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to boost your productivity?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who trust ToolsHub for their daily tasks
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="hero">
              <Link to="/tools">
                Start Using Tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
