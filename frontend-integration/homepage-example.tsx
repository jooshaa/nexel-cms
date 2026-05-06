// ─────────────────────────────────────────────────────────────────────────────
// Nexel — Next.js homepage Server Component
// Demonstrates full CMS data integration
// Save as: nexel-frontend/app/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { getHomepageData } from '@/lib/cms/api';
import type { HeroSlide, FeaturedSection, Category, Product } from '@/lib/cms/types';

// ── ISR: revalidate homepage every 2 minutes ──────────────────────────────────
export const revalidate = 120;

export default async function HomePage() {
  const { heroSlides, featuredSections, categories, heroProducts } =
    await getHomepageData();

  return (
    <main>
      {/* Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Category Strip */}
      <CategoryStrip categories={categories} />

      {/* Hero Products (big-feature rows) */}
      {heroProducts.map((product) => (
        <HeroProductRow key={product.id} product={product} />
      ))}

      {/* Dynamic Featured Sections from CMS */}
      {featuredSections.map((section) => (
        <FeaturedSectionBlock key={section.id} section={section} />
      ))}
    </main>
  );
}

// ── Sub-components (wire to your existing UI) ─────────────────────────────────

function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  return (
    <section aria-label="Hero carousel">
      {slides.map((slide) => (
        <div key={slide.id} data-slide-id={slide.id}>
          {/* Pass slide.image.url to your existing <Image> component */}
          {/* slide.title, slide.subtitle, slide.buttonText, slide.buttonLink */}
        </div>
      ))}
    </section>
  );
}

function CategoryStrip({ categories }: { categories: Category[] }) {
  return (
    <nav aria-label="Category navigation">
      {categories.map((cat) => (
        <a key={cat.id} href={`/categories/${cat.slug}`}>
          {cat.name}
        </a>
      ))}
    </nav>
  );
}

function HeroProductRow({ product }: { product: Product }) {
  const primaryImage = product.images[0]?.url;
  return (
    <section>
      {/* wire to your existing premium hero-product layout */}
      <h2>{product.title}</h2>
      <p>{product.subtitle}</p>
      <a href={`/products/${product.slug}`}>Shop now</a>
    </section>
  );
}

function FeaturedSectionBlock({ section }: { section: FeaturedSection }) {
  return (
    <section data-variant={section.styleVariant} data-bg={section.backgroundStyle}>
      <h2>{section.title}</h2>
      {section.subtitle && <p>{section.subtitle}</p>}
      <div className="products-grid">
        {section.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: Product }) {
  const img = product.images[0];
  return (
    <article>
      {img && <img src={img.url} alt={img.alternativeText ?? product.title} />}
      <h3>{product.title}</h3>
      <p>${product.price.toFixed(2)}</p>
      {product.comparePrice && (
        <s>${product.comparePrice.toFixed(2)}</s>
      )}
      <a href={`/products/${product.slug}`}>View product</a>
    </article>
  );
}
