export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  featured: boolean;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "outcome-indexed-vs-token-routing",
    title: "Why Token-Price Routing Fails: The Outcome-Indexed Alternative",
    excerpt:
      "Most AI gateways route prompts simply to the lowest cost per token. We explain mathematically why that causes downstream pipeline loss and how Thompson Sampling fixes it.",
    author: "Arjun Mehta",
    date: "Aug 20, 2026",
    readTime: "6 min read",
    category: "AI Economics",
    featured: true
  },
  {
    slug: "semantic-prompt-caching-at-scale",
    title: "Building Sub-5ms Semantic Prompt Caching with pgvector and Redis",
    excerpt:
      "A technical deep-dive into exact hashing vs cosine embedding thresholds for conversational AI pipelines, saving 35% on redundant queries.",
    author: "Elena Rostova",
    date: "Aug 14, 2026",
    readTime: "8 min read",
    category: "Engineering",
    featured: false
  },
  {
    slug: "context-compression-algorithms",
    title: "Context Compression: Cutting 30% of Prompt Tokens Without Semantic Loss",
    excerpt:
      "How heuristic deduplication, system instruction distillation, and token whitespace compression prevent context explosion in multi-turn SaaS agents.",
    author: "Dev Team",
    date: "Aug 08, 2026",
    readTime: "5 min read",
    category: "Architecture",
    featured: false
  },
  {
    slug: "thompson-sampling-llm-routing",
    title: "Thompson Sampling for Multi-Armed LLM Bandit Routing",
    excerpt:
      "How online Bayesian reinforcement learning continuously balances exploration of new open-source models with exploitation of high-converting proprietary flagships.",
    author: "Marcus Vance",
    date: "Jul 28, 2026",
    readTime: "10 min read",
    category: "Machine Learning",
    featured: false
  }
];
