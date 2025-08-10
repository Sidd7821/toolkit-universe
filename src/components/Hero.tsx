import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const Hero = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty("--x", `${x}%`);
      el.style.setProperty("--y", `${y}%`);
    };
    const onLeave = () => {
      el.style.setProperty("--x", `50%`);
      el.style.setProperty("--y", `50%`);
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return (
    <header ref={ref} className="relative overflow-hidden">
      <div className="absolute inset-0 hero-spotlight pointer-events-none" aria-hidden="true" />
      <div className="container mx-auto py-16 md:py-24 lg:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-accent/50 px-3 py-1 text-xs md:text-sm text-muted-foreground mb-6">
            <Sparkles className="h-4 w-4" />
            New: 200+ tools in one place
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            ToolsHub — Your All‑in‑One Online Toolkit
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-muted-foreground">
            Work faster with image, PDF, developer, SEO, security, and AI tools — all in your browser. No installs.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild variant="hero" size="lg">
              <Link to="/tools" aria-label="Browse all tools">
                Browse all tools
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="premium" size="lg">
              <Link to="/upgrade" aria-label="View pricing plans">Upgrade to Pro</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
