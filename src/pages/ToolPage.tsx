import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { TOOLS } from "@/data/tools";

const components: Record<string, ReturnType<typeof lazy>> = {
  "word-counter": lazy(() => import("@/tools/WordCounter")),
  "json-formatter": lazy(() => import("@/tools/JsonFormatter")),
  "ai-assist": lazy(() => import("@/tools/AIAssist")),
  "image-compressor": lazy(() => import("@/tools/ImageCompressor")),
  "password-generator": lazy(() => import("@/tools/PasswordGenerator")),
  "pdf-merger": lazy(() => import("@/tools/PDFMerger")),
};

const Fallback = () => (
  <div className="container mx-auto py-10">
    <div className="animate-pulse rounded-lg h-44 bg-accent" />
  </div>
);

const ToolPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const meta = TOOLS.find((t) => t.slug === slug);

  if (!slug || !meta) {
    return (
      <main className="container mx-auto py-10">
        <h1 className="text-2xl font-bold">Tool not found</h1>
        <p className="text-muted-foreground mt-2">The requested tool does not exist.</p>
      </main>
    );
  }

  const Comp = components[slug];

  return (
    <main className="container mx-auto py-10">
      <Seo
        title={`${meta.name} — ToolsHub`}
        description={meta.shortDescription}
        canonical={`/tool/${meta.slug}`}
        keywords={[meta.category, ...meta.tags]}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: meta.name,
          applicationCategory: meta.category,
          description: meta.shortDescription,
          offers: { "@type": "Offer", price: meta.isPremium ? "9.99" : "0", priceCurrency: "USD" },
        }}
      />
      <h1 className="text-3xl font-bold mb-4">{meta.name}</h1>
      <p className="text-muted-foreground mb-6">{meta.shortDescription}</p>
      <Suspense fallback={<Fallback />}>
        {Comp ? <Comp /> : <p className="text-sm text-muted-foreground">Work in progress…</p>}
      </Suspense>
    </main>
  );
};

export default ToolPage;
