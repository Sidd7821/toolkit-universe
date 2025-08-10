import { useParams, Link } from "react-router-dom";
import Seo from "@/components/Seo";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Grid3X3, Star, Zap } from "lucide-react";
import { CATEGORIES, TOOLS } from "@/data/tools";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const list = TOOLS.filter((t) => t.category === slug);

  if (!cat) {
    return (
      <main className="container mx-auto py-10">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Category not found</h1>
          <p className="text-muted-foreground mb-6">The category you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/categories">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Categories
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const featuredTools = list.filter(t => t.isFeatured);
  const regularTools = list.filter(t => !t.isFeatured);

  return (
    <main className="min-h-screen">
      <Seo
        title={`${cat.name} — ToolsHub`}
        description={cat.description}
        canonical={`/category/${cat.slug}`}
      />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <Button asChild variant="outline" size="sm">
              <Link to="/categories">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Categories
              </Link>
            </Button>
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Grid3X3 className="h-8 w-8 text-primary" />
              <h1 className="text-4xl font-bold">{cat.name}</h1>
            </div>
            <p className="text-xl text-muted-foreground mb-6">{cat.description}</p>
            
            {/* Category Stats */}
            <div className="flex items-center justify-center gap-6">
              <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2">
                <Zap className="h-4 w-4" />
                {list.length} tools
              </Badge>
              {featuredTools.length > 0 && (
                <Badge variant="outline" className="flex items-center gap-2 px-4 py-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  {featuredTools.length} featured
                </Badge>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="container mx-auto py-16 px-4">
        {featuredTools.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
                <h2 className="text-3xl font-bold">Featured Tools</h2>
                <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-lg text-muted-foreground">
                Our most popular and powerful tools in this category
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {featuredTools.map((t) => (
                <ToolCard key={t.slug} {...t} />
              ))}
            </div>
          </div>
        )}

        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-4">
            {featuredTools.length > 0 ? "All Tools" : "Tools in this Category"}
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-2xl mx-auto">
            {featuredTools.length > 0 
              ? "Browse all available tools in this category" 
              : "Discover all the tools available in this category"
            }
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {list.map((t) => (
            <ToolCard key={t.slug} {...t} />
          ))}
        </div>

        {list.length === 0 && (
          <div className="text-center py-20">
            <Grid3X3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No tools found</h3>
            <p className="text-muted-foreground mb-6">
              This category doesn't have any tools yet. Check back later!
            </p>
            <Button asChild variant="outline">
              <Link to="/categories">Browse Other Categories</Link>
            </Button>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="container mx-auto py-16 px-4">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-12 text-center max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Need something else?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Explore our other categories to find more tools that can help you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="hero">
              <Link to="/categories">
                Browse All Categories
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/tools">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CategoryPage;
