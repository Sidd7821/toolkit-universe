import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { TOOLS } from "@/data/tools";

const components: Record<string, ReturnType<typeof lazy>> = {
  "word-counter": lazy(() => import("@/tools/WordCounter")),
  "json-formatter": lazy(() => import("@/tools/JsonFormatter")),
  "ai-assist": lazy(() => import("@/tools/AIAssist")),
  "image-compressor": lazy(() => import("@/tools/ImageCompressor")),
  "image-converter": lazy(() => import("@/tools/ImageFormatConverter")),
  "image-cropper": lazy(() => import("@/tools/ImageCropper")),
  "background-remover": lazy(() => import("@/tools/BackgroundRemover")),
  "color-picker": lazy(() => import("@/tools/ImageColorPicker")),
  "image-to-pdf": lazy(() => import("@/tools/ImageToPdfConverter")),
  "gif-maker": lazy(() => import("@/tools/GifMaker")),
  "watermark-tool": lazy(() => import("@/tools/ImageWatermarkTool")),
  "image-rotator": lazy(() => import("@/tools/ImageRotator")),
  "unit-converter": lazy(() => import("@/tools/UnitConverter")),
  "currency-converter": lazy(() => import("@/tools/CurrencyConverter")),
  "age-calculator": lazy(() => import("@/tools/AgeCalculator")),
  "bmi-calculator": lazy(() => import("@/tools/BMICalculator")),
  "password-generator": lazy(() => import("@/tools/PasswordGenerator")),
  "pdf-merger": lazy(() => import("@/tools/PDFMerger")),
  "number-converter": lazy(() => import("@/tools/NumberConverter")),
  "timezone-converter": lazy(() => import("@/tools/TimezoneConverter")),
  "fraction-converter": lazy(() => import("@/tools/FractionConverter")),
  "percentage-calculator": lazy(() => import("@/tools/PercentageCalculator")),
  "sip-calculator": lazy(() => import("@/tools/SIPCalculator")),
  "loan-calculator": lazy(() => import("@/tools/LoanEMICalculator")),
  "md5-generator": lazy(() => import("@/tools/MD5HashGenerator")),
  "sha256-generator": lazy(() => import("@/tools/SHA256HashGenerator")),
  "password-checker": lazy(() => import("@/tools/PasswordStrengthChecker")),
  "base64-encoder": lazy(() => import("@/tools/Base64Encoder")),
  "url-encoder": lazy(() => import("@/tools/URLEncoder")),
  "qr-generator": lazy(() => import("@/tools/QRCodeGenerator")),
  "qr-scanner": lazy(() => import("@/tools/QRCodeScanner")),
  "jwt-decoder": lazy(() => import("@/tools/JWTDecoder")),
  "text-encryption": lazy(() => import("@/tools/TextEncryption")),
  "html-minifier": lazy(() => import("@/tools/HtmlMinifier")),
  "css-minifier": lazy(() => import("@/tools/CssMinifier")),
  "js-minifier": lazy(() => import("@/tools/JavaScriptMinifier")),
  "regex-tester": lazy(() => import("@/tools/RegexTester")),
  // New tools
  "api-tester": lazy(() => import("@/tools/APITester")),
  "code-diff": lazy(() => import("@/tools/CodeDiffChecker")),
  "lorem-picsum": lazy(() => import("@/tools/LoremPicsumImageGenerator")),
  "color-palette": lazy(() => import("@/tools/ColorPaletteGenerator")),
  "favicon-generator": lazy(() => import("@/tools/FaviconGenerator")),
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
