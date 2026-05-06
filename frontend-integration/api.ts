// ─────────────────────────────────────────────────────────────────────────────
// Nexel CMS — API fetch utilities for Next.js storefront
// Copy this file to: nexel-frontend/lib/cms/api.ts
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Product,
  Category,
  HeroSlide,
  FeaturedSection,
  NavbarSection,
  StrapiResponse,
} from './types';

// ── Config ────────────────────────────────────────────────────────────────────

const CMS_URL = process.env.NEXT_PUBLIC_CMS_URL || 'http://localhost:1337';
const CMS_TOKEN = process.env.CMS_API_TOKEN; // server-side only (read-only token)

// ── Base fetcher ─────────────────────────────────────────────────────────────

async function cmsGet<T>(
  path: string,
  params: Record<string, string> = {},
  revalidate: number = 60
): Promise<T> {
  const url = new URL(`${CMS_URL}/api${path}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...(CMS_TOKEN ? { Authorization: `Bearer ${CMS_TOKEN}` } : {}),
    },
    next: { revalidate }, // Next.js ISR cache control
  });

  if (!res.ok) {
    throw new Error(`CMS fetch failed: ${res.status} ${res.statusText} — ${path}`);
  }

  return res.json();
}

// ── Hero Slides ───────────────────────────────────────────────────────────────

/**
 * Fetches all active hero slides, sorted by order.
 * Used in the homepage hero carousel.
 */
export async function getHeroSlides(): Promise<HeroSlide[]> {
  const data = await cmsGet<StrapiResponse<HeroSlide[]>>(
    '/hero-slides',
    {
      'filters[active][$eq]': 'true',
      'sort': 'order:asc',
      'populate': '*',
      'pagination[pageSize]': '10',
    },
    300 // revalidate every 5 minutes
  );
  return data.data;
}

// ── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetches all published products with full relations.
 */
export async function getProducts(page = 1, pageSize = 24): Promise<StrapiResponse<Product[]>> {
  return cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'populate[images]': '*',
      'populate[category]': '*',
      'populate[colors]': '*',
      'populate[specifications]': '*',
      'sort': 'createdAt:desc',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
    },
    60
  );
}

/**
 * Fetches a single product by slug.
 */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const data = await cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'filters[slug][$eq]': slug,
      'populate[images]': '*',
      'populate[category]': '*',
      'populate[colors][populate]': 'image',
      'populate[specifications]': '*',
    },
    60
  );
  return data.data[0] ?? null;
}

/**
 * Fetches all featured products (featured=true).
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  const data = await cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'filters[featured][$eq]': 'true',
      'populate[images]': '*',
      'populate[category]': '*',
      'sort': 'createdAt:desc',
      'pagination[pageSize]': '12',
    },
    120
  );
  return data.data;
}

/**
 * Fetches all hero products for homepage big-feature areas.
 */
export async function getHeroProducts(): Promise<Product[]> {
  const data = await cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'filters[heroProduct][$eq]': 'true',
      'populate[images]': '*',
      'populate[category]': '*',
      'sort': 'createdAt:desc',
      'pagination[pageSize]': '5',
    },
    120
  );
  return data.data;
}

/**
 * Fetches products by category slug.
 */
export async function getProductsByCategory(
  categorySlug: string,
  page = 1,
  pageSize = 24
): Promise<StrapiResponse<Product[]>> {
  return cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'filters[category][slug][$eq]': categorySlug,
      'populate[images]': '*',
      'populate[category]': '*',
      'sort': 'createdAt:desc',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
    },
    60
  );
}

/**
 * Returns all product slugs — use in generateStaticParams.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  const data = await cmsGet<StrapiResponse<Product[]>>(
    '/products',
    {
      'fields[0]': 'slug',
      'pagination[pageSize]': '200',
    },
    3600 // 1 hour — slugs rarely change
  );
  return data.data.map((p) => p.slug);
}

// ── Categories ────────────────────────────────────────────────────────────────

/**
 * Fetches all categories sorted by order.
 */
export async function getCategories(): Promise<Category[]> {
  const data = await cmsGet<StrapiResponse<Category[]>>(
    '/categories',
    {
      'populate': '*',
      'sort': 'order:asc',
      'pagination[pageSize]': '50',
    },
    300
  );
  return data.data;
}

/**
 * Fetches a single category by slug, with its featured products.
 */
export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const data = await cmsGet<StrapiResponse<Category[]>>(
    '/categories',
    {
      'filters[slug][$eq]': slug,
      'populate[image]': '*',
      'populate[featuredProducts][populate]': 'images,category',
    },
    120
  );
  return data.data[0] ?? null;
}

// ── Featured Sections ─────────────────────────────────────────────────────────

/**
 * Fetches all active featured sections for homepage composition.
 */
export async function getFeaturedSections(): Promise<FeaturedSection[]> {
  const data = await cmsGet<StrapiResponse<FeaturedSection[]>>(
    '/featured-sections',
    {
      'filters[active][$eq]': 'true',
      'sort': 'order:asc',
      'populate[products][populate]': 'images,category',
      'pagination[pageSize]': '20',
    },
    120
  );
  return data.data;
}

// ── Navbar Sections ───────────────────────────────────────────────────────────

/**
 * Fetches all active navbar sections — used for mega menu rendering.
 * High cache: navbar content rarely changes.
 */
export async function getNavbarSections(): Promise<NavbarSection[]> {
  const data = await cmsGet<StrapiResponse<NavbarSection[]>>(
    '/navbar-sections',
    {
      'filters[active][$eq]': 'true',
      'sort': 'order:asc',
      'populate[category]': '*',
      'populate[featuredProducts][populate]': 'images',
      'populate[promoImage]': '*',
      'pagination[pageSize]': '20',
    },
    600 // 10 minutes
  );
  return data.data;
}

// ── Homepage data bundle ──────────────────────────────────────────────────────

/**
 * Single call to prefetch all homepage data in parallel.
 * Use this in your homepage Server Component.
 *
 * @example
 * // app/page.tsx
 * const { heroSlides, featuredSections, categories } = await getHomepageData();
 */
export async function getHomepageData() {
  const [heroSlides, featuredSections, categories, heroProducts] = await Promise.all([
    getHeroSlides(),
    getFeaturedSections(),
    getCategories(),
    getHeroProducts(),
  ]);

  return { heroSlides, featuredSections, categories, heroProducts };
}
