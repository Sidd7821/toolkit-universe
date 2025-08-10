import Seo from "@/components/Seo";
import ToolCard from "@/components/ToolCard";
import { TOOLS } from "@/data/tools";

const Tools = () => {
  return (
    <main className="container mx-auto py-10">
      <Seo
        title="All Tools — ToolsHub"
        description="Browse all online tools across images, PDFs, developer, SEO, security and AI."
        canonical="/tools"
        keywords={["all tools", "tool directory", "web tools"]}
      />
      <h1 className="text-3xl font-bold mb-6">All tools</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TOOLS.map((t) => (
          <ToolCard key={t.slug} {...t} />
        ))}
      </div>
    </main>
  );
};

export default Tools;
