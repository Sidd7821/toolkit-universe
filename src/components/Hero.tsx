import { ArrowRight, Sparkles, Zap, CheckCircle2, Users, Clock } from "lucide-react";
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
    <header ref={ref} className="relative overflow-hidden bg-gradient-to-br from-background via-background to-primary/5">
      <div className="absolute inset-0 hero-spotlight pointer-events-none" aria-hidden="true" />
      
      {/* Floating Icons Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0s' }}>
          <Zap className="h-4 w-4 text-primary" />
        </div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '1s' }}>
          <CheckCircle2 className="h-3 w-3 text-primary" />
        </div>
        <div className="absolute bottom-40 left-20 w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '2s' }}>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <div className="absolute bottom-20 right-10 w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center animate-bounce" style={{ animationDelay: '0.5s' }}>
          <Clock className="h-3 w-3 text-primary" />
        </div>
      </div>

      <div className="container mx-auto py-20 md:py-28 lg:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-8 backdrop-blur-sm">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">New:</span> 200+ tools in one place
            <Sparkles className="h-4 w-4" />
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
            Your All‑in‑One
            <br />
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Online Toolkit
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto leading-relaxed">
            Work faster with image, PDF, developer, SEO, security, and AI tools — all in your browser. 
            <span className="block mt-2 text-lg">No installs, no downloads, just results.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button asChild variant="hero" size="lg" className="text-lg px-8 py-6">
              <Link to="/tools" aria-label="Browse all tools">
                <Zap className="mr-2 h-5 w-5" />
                Browse all tools
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="premium" size="lg" className="text-lg px-8 py-6">
              <Link to="/upgrade" aria-label="View pricing plans">
                <Sparkles className="mr-2 h-5 w-5" />
                Upgrade to Pro
              </Link>
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>100% Free to use</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>No registration required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>Privacy focused</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg className="w-full h-16 text-background" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0V46.29c47.79,22.2,103.59,8.12,149.2-20.69C197.64,8.86,251.88,0,305.67,0s108.03,8.86,156.47,25.6C515.41,54.41,571.21,68.51,619,90.69V0Z" fill="currentColor" opacity=".25"></path>
          <path d="M0,0V15.81C13.36,32.4,27.7,48.86,42.92,64.6C58.14,80.34,74.38,95.18,91.5,109.06C108.62,122.94,126.66,135.78,145.5,147.6C164.34,159.42,184.08,170.22,204.67,180C225.26,189.78,246.7,198.56,269,206.32V0Z" fill="currentColor" opacity=".5"></path>
          <path d="M0,0V5.64C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="currentColor"></path>
        </svg>
      </div>
    </header>
  );
};

export default Hero;
