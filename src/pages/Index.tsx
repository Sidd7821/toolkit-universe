import { useMemo, useState } from "react";
import Seo from "@/components/Seo";
import Hero from "@/components/Hero";
import CategoryCard from "@/components/CategoryCard";
import ToolCard from "@/components/ToolCard";
import { CATEGORIES, TOOLS } from "@/data/tools";
import { Input } from "@/components/ui/input";

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

  return (
    <main>
      <Seo
        title="ToolsHub — 200+ Free Online Tools"
        description="Work faster with 200+ image, PDF, developer, SEO, security and AI tools. All in your browser."
        canonical="/"
        keywords={["online tools", "image tools", "PDF tools", "developer tools", "SEO", "AI tools"]}
        jsonLd={jsonLd}
      />

      <Hero />

      <section className="container mx-auto py-10">
        <h2 className="sr-only">Search</h2>
        <div className="max-w-2xl mx-auto">
          <Input
            type="search"
            placeholder="Search tools (e.g., JSON, PDF, Image)…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search tools"
          />
        </div>
      </section>

      <section className="container mx-auto py-6">
        <h2 className="text-2xl font-semibold mb-4">Featured tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 6).map((t) => (
            <ToolCard key={t.slug} {...t} />
          ))}
        </div>
      </section>

      <section className="container mx-auto py-12">
        <h2 className="text-2xl font-semibold mb-4">Categories</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CATEGORIES.map((c) => (
            <CategoryCard
              key={c.slug}
              slug={c.slug}
              name={c.name}
              description={c.description}
              icon={c.icon as any}
            />
          ))}
        </div>
      </section>
    </main>
  );
};

export default Index;
