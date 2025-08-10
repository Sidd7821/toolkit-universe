import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import ToolCard from "@/components/ToolCard";
import { CATEGORIES, TOOLS } from "@/data/tools";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const cat = CATEGORIES.find((c) => c.slug === slug);
  const list = TOOLS.filter((t) => t.category === slug);

  if (!cat) {
    return (
      <main className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Category not found</h1>
      </main>
    );
  }

  return (
    <main className="container mx-auto py-10">
      <Seo
        title={`${cat.name} — ToolsHub`}
        description={cat.description}
        canonical={`/category/${cat.slug}`}
      />
      <h1 className="text-3xl font-bold mb-2">{cat.name}</h1>
      <p className="text-muted-foreground mb-6">{cat.description}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((t) => (
          <ToolCard key={t.slug} {...t} />
        ))}
      </div>
    </main>
  );
};

export default CategoryPage;
