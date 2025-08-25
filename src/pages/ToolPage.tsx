import { Suspense, lazy } from "react";
import { useParams } from "react-router-dom";
import Seo from "@/components/Seo";
import { TOOLS } from "@/data/tools";
import { Hourglass } from "lucide-react";

const components: Record<string, ReturnType<typeof lazy>> = {
  "word-counter": lazy(() => import("@/tools/WordCounter")),
  "json-formatter": lazy(() => import("@/tools/JsonFormatter")),
  "ai-assist": lazy(() => import("@/tools/AIAssist")),
  "ai-article-writer": lazy(() => import("@/tools/AIArticleWriter")),
  "ai-code-generator": lazy(() => import("@/tools/AICodeGenerator")),
  "ai-email-writer": lazy(() => import("@/tools/AIEmailWriter")),
  "ai-image-generator": lazy(() => import("@/tools/AIImageGenerator")),
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
  // New utility tools
  "random-number": lazy(() => import("@/tools/RandomNumberGenerator")),
  "barcode-generator": lazy(() => import("@/tools/BarcodeGenerator")),
  "stopwatch": lazy(() => import("@/tools/Stopwatch")),
  "world-clock": lazy(() => import("@/tools/WorldClock")),
  "weather-app": lazy(() => import("@/tools/WeatherApp")),
  "ip-finder": lazy(() => import("@/tools/IPAddressFinder")),
  "whois-lookup": lazy(() => import("@/tools/WHOISLookup")),
  // New utility tools
  "dns-lookup": lazy(() => import("@/tools/DNSLookup")),
  "ping-speed-test": lazy(() => import("@/tools/PingSpeedTest")),
  "clipboard-manager": lazy(() => import("@/tools/ClipboardManager")),
  // New fun tools
  "trivia-quiz-maker": lazy(() => import("@/tools/TriviaQuizMaker")),
  "spin-the-wheel": lazy(() => import("@/tools/SpinTheWheel")),
  // SEO tools
  "meta-generator": lazy(() => import("@/tools/MetaTagGenerator")),
  "meta-extractor": lazy(() => import("@/tools/MetaTagExtractor")),
  "sitemap-generator": lazy(() => import("@/tools/XMLSitemapGenerator")),
  "robots-generator": lazy(() => import("@/tools/RobotsTxtGenerator")),
  "keyword-density-analyzer": lazy(() => import("@/tools/KeywordDensityAnalyzer")),
  "broken-link-checker": lazy(() => import("@/tools/BrokenLinkChecker")),
  "google-serp-preview": lazy(() => import("@/tools/GoogleSERPPreview")),
  "website-speed-test": lazy(() => import("@/tools/WebsiteSpeedTest")),
  "mobile-friendly": lazy(() => import("@/tools/MobileFriendlyTest")),
  "backlink-checker": lazy(() => import("@/tools/BacklinkChecker")),
  // Language & Writing tools
  "grammar-checker": lazy(() => import("@/tools/GrammarChecker")),
  "plagiarism-checker": lazy(() => import("@/tools/PlagiarismChecker")),
  "paraphrase-tool": lazy(() => import("@/tools/ParaphraseTool")),
  "readability-checker": lazy(() => import("@/tools/ReadabilityChecker")),
  "language-translator": lazy(() => import("@/tools/LanguageTranslator")),
  "dictionary-thesaurus": lazy(() => import("@/tools/DictionaryThesaurus")),
  "emoji-translator": lazy(() => import("@/tools/EmojiTranslator")),
  // Data & Analytics tools
  "csv-to-json": lazy(() => import("@/tools/CSVToJSONConverter")),
  "data-visualizer": lazy(() => import("@/tools/DataVisualizer")),
  "ab-testing": lazy(() => import("@/tools/ABTestingTool")),
  // E-commerce tools
  "price-tracker": lazy(() => import("@/tools/CurrencyPriceTracker")),
  "dropshipping-profit-calculator": lazy(() => import("@/tools/DropshippingProfitCalculator")),
  // Privacy & Safety tools
  "adblocker-test": lazy(() => import("@/tools/AdBlockerTestTool")),
  "disposable-email-generator": lazy(() => import("@/tools/DisposableEmailGenerator")),
  // Mobile & App tools
  "permission-checker": lazy(() => import("@/tools/AndroidPermissionChecker")),
  "apk-downloader": lazy(() => import("@/tools/APKDownloader")),
  "app-icon-resizer": lazy(() => import("@/tools/AppIconResizer")),
  "app-store-description-generator": lazy(() => import("@/tools/AppStoreDescriptionGenerator")),
  // Audio tools
  "audio-cutter": lazy(() => import("@/tools/AudioCutter")),
  "audio-joiner": lazy(() => import("@/tools/AudioJoiner")),
  "noise-remover": lazy(() => import("@/tools/AudioNoiseRemover")),
  // Mobile tools
  "battery-checker": lazy(() => import("@/tools/BatteryHealthChecker")),
  // Fun tools
  "birthday-countdown": lazy(() => import("@/tools/BirthdayCountdownTool")),
  // E-commerce tools
  "bulk-resizer": lazy(() => import("@/tools/BulkImageResizer")),
  // Privacy tools
  "anonymous-link": lazy(() => import("@/tools/AnonymousLinkOpener")),
  // New tools
  "business-card-maker": lazy(() => import("@/tools/BusinessCardMaker")),
  "calendar-generator": lazy(() => import("@/tools/CalendarGenerator")),
  "collage-maker": lazy(() => import("@/tools/CollageMaker")),
  "compatibility-calculator": lazy(() => import("@/tools/CoupleCompatibilityCalculator")),
  "event-countdown-timer": lazy(() => import("@/tools/EventCountdownTimer")),
  "excel-formula-tester": lazy(() => import("@/tools/ExcelFormulaTester")),
  // Our six new tools
  "gradient-generator": lazy(() => import("@/tools/GradientGenerator")),
  "https-checker": lazy(() => import("@/tools/HttpsChecker")),
  "heatmap-generator": lazy(() => import("@/tools/HeatmapGenerator")),
  "instagram-hashtag-generator": lazy(() => import("@/tools/InstagramHashtagGenerator")),
  "instagram-story-templates": lazy(() => import("@/tools/InstagramStoryTemplates")),
  "invoice-generator": lazy(() => import("@/tools/InvoiceGenerator")),
  // File management tools
  "duplicate-finder": lazy(() => import("@/tools/DuplicateFileFinder")),
  "ebook-converter": lazy(() => import("@/tools/EbookConverter")),
  "facebook-cover": lazy(() => import("@/tools/FacebookCoverMaker")),
  "file-converter": lazy(() => import("@/tools/FileConverter")),
  "file-previewer": lazy(() => import("@/tools/FilePreviewer")),
  "file-renamer": lazy(() => import("@/tools/FileRenamer")),
  "file-splitter-joiner": lazy(() => import("@/tools/FileSplitterJoiner")),
  "flyer-maker": lazy(() => import("@/tools/FlyerMaker")),
  "font-preview": lazy(() => import("@/tools/FontPreviewTool")),
  "fortune-cookie": lazy(() => import("@/tools/FortuneCookieGenerator")),
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
  {Comp ? (
    <Comp />
  ) : (
    <div className="flex flex-col items-center justify-center p-12 border rounded-2xl bg-gradient-to-br from-muted/50 to-muted shadow-sm text-center max-w-xl mx-auto">
      <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
        <Hourglass size={36} />
      </div>
      <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
      <p className="text-muted-foreground max-w-md">
        We’re crafting the{" "}
        <span className="font-medium">{meta.name}</span> tool to make your
        workflow even better. Check back soon — exciting things are on the way!
      </p>
      <div className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium shadow hover:shadow-md transition">
        Stay Tuned
      </div>
    </div>
  )}
</Suspense>
    </main>
  );
};

export default ToolPage;
