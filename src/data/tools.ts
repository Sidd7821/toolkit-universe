export type ToolMeta = {
  slug: string;
  name: string;
  shortDescription: string;
  description?: string;
  category: string;
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime?: string;
  isPremium?: boolean;
  isFeatured?: boolean;
};

export type CategoryMeta = {
  slug: string;
  name: string;
  description: string;
  icon: string; // lucide icon name
};

export const CATEGORIES: CategoryMeta[] = [
  { slug: 'images', name: 'Image Tools', description: 'Compress, convert, resize, and more — all in the browser.', icon: 'Image' },
  { slug: 'pdf', name: 'PDF Tools', description: 'Merge, split, compress, convert, and sign PDFs securely.', icon: 'FileText' },
  { slug: 'developer', name: 'Developer Tools', description: 'Formatters, validators, encoders, and generators.', icon: 'Laptop' },
  { slug: 'seo', name: 'SEO & Marketing', description: 'Meta tags, schema, sitemap, and optimization helpers.', icon: 'LineChart' },
  { slug: 'security', name: 'Security', description: 'Passwords, hashes, certificates, and privacy helpers.', icon: 'Shield' },
  { slug: 'ai', name: 'AI Assist', description: 'Content writing, summarizing, alt text, and more.', icon: 'Sparkles' },
  { slug: 'utility', name: 'Utilities', description: 'Converters, calculators, and handy everyday tools.', icon: 'Wrench' },
];

export const TOOLS: ToolMeta[] = [
  {
    slug: 'word-counter',
    name: 'Word Counter',
    shortDescription: 'Count words, characters, and reading time instantly.',
    category: 'utility',
    tags: ['text', 'analysis'],
    isFeatured: true,
  },
  {
    slug: 'json-formatter',
    name: 'JSON Formatter',
    shortDescription: 'Validate and pretty-print JSON with highlights.',
    category: 'developer',
    tags: ['json', 'format'],
    isFeatured: true,
  },
  // More tools coming soon...
  {
    slug: 'ai-assist',
    name: 'AI Assist',
    shortDescription: 'Chat with Gemini 1.5 Flash for writing, code, and ideas.',
    category: 'ai',
    tags: ['ai', 'chat', 'gemini'],
    isFeatured: true,
  },
];
