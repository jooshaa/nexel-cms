// ─────────────────────────────────────────────────────────────────────────────
// Nexel CMS — TypeScript types for all Strapi API responses
// Use these in your Next.js storefront (nexel-frontend)
// ─────────────────────────────────────────────────────────────────────────────

// ── Strapi base wrappers ───────────────────────────────────────────────────

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  caption: string | null;
  width: number;
  height: number;
  formats: {
    thumbnail?: StrapiImageFormat;
    small?: StrapiImageFormat;
    medium?: StrapiImageFormat;
    large?: StrapiImageFormat;
  };
  name: string;
  mime: string;
  size: number;
}

export interface StrapiImageFormat {
  url: string;
  width: number;
  height: number;
  size: number;
  mime: string;
}

export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiItem<T> {
  id: number;
  documentId: string;
  attributes?: T; // v4 compat — v5 returns flat
}

// ── Components ────────────────────────────────────────────────────────────────

export interface ProductSpecification {
  id: number;
  label: string;
  value: string;
}

export interface ProductColor {
  id: number;
  name: string;
  hex: string | null;
  image: StrapiImage | null;
  inStock: boolean;
}

// ── Collection Types ──────────────────────────────────────────────────────────

export interface Product {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  subtitle: string | null;
  shortDescription: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  badge: string | null;
  stock: number;
  featured: boolean;
  heroProduct: boolean;
  images: StrapiImage[];
  category: Category | null;
  specifications: ProductSpecification[];
  colors: ProductColor[];
  seoTitle: string | null;
  seoDescription: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  image: StrapiImage | null;
  order: number;
  products?: Product[];
  featuredProducts?: Product[];
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HeroSlide {
  id: number;
  documentId: string;
  title: string;
  subtitle: string | null;
  buttonText: string | null;
  buttonLink: string | null;
  image: StrapiImage;
  mobileImage: StrapiImage | null;
  active: boolean;
  order: number;
  textColor: 'light' | 'dark';
  overlayOpacity: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeaturedSection {
  id: number;
  documentId: string;
  title: string;
  subtitle: string | null;
  styleVariant: 'grid' | 'carousel' | 'hero-split' | 'list' | 'spotlight';
  backgroundStyle: 'default' | 'dark' | 'accent' | 'muted';
  products: Product[];
  active: boolean;
  order: number;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NavbarSection {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  category: Category | null;
  featuredProducts: Product[];
  promoImage: StrapiImage | null;
  promoTitle: string | null;
  promoLink: string | null;
  order: number;
  active: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
