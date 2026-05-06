// ─────────────────────────────────────────────────────────────────────────────
// Nexel — Next.js product page with static generation
// Save as: nexel-frontend/app/products/[slug]/page.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { getAllProductSlugs, getProductBySlug } from '@/lib/cms/api';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export const revalidate = 60;

// ── Static path generation ────────────────────────────────────────────────────
export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// ── SEO metadata from CMS fields ──────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) return {};

  const image = product.images[0];
  return {
    title: product.seoTitle ?? `${product.title} | Nexel`,
    description: product.seoDescription ?? product.shortDescription ?? undefined,
    openGraph: {
      title: product.seoTitle ?? product.title,
      description: product.seoDescription ?? product.shortDescription ?? undefined,
      images: image ? [{ url: image.url, width: image.width, height: image.height }] : [],
    },
  };
}

// ── Page component ────────────────────────────────────────────────────────────
export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const discount =
    product.comparePrice && product.comparePrice > product.price
      ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
      : null;

  return (
    <main>
      {/* Gallery */}
      <section aria-label="Product gallery">
        {product.images.map((img, i) => (
          <img
            key={img.id}
            src={img.url}
            alt={img.alternativeText ?? `${product.title} image ${i + 1}`}
            width={img.width}
            height={img.height}
          />
        ))}
      </section>

      {/* Product Info */}
      <section aria-label="Product info">
        {product.badge && <span className="badge">{product.badge}</span>}
        <h1>{product.title}</h1>
        {product.subtitle && <p>{product.subtitle}</p>}

        <div className="pricing">
          <span>${product.price.toFixed(2)}</span>
          {product.comparePrice && <s>${product.comparePrice.toFixed(2)}</s>}
          {discount && <span className="discount">-{discount}%</span>}
        </div>

        {/* Color swatches */}
        {product.colors.length > 0 && (
          <div className="colors">
            {product.colors.map((color) => (
              <button
                key={color.id}
                title={color.name}
                style={{ backgroundColor: color.hex ?? undefined }}
                disabled={!color.inStock}
              />
            ))}
          </div>
        )}

        {product.shortDescription && <p>{product.shortDescription}</p>}
      </section>

      {/* Specifications */}
      {product.specifications.length > 0 && (
        <section aria-label="Specifications">
          <h2>Specifications</h2>
          <table>
            <tbody>
              {product.specifications.map((spec) => (
                <tr key={spec.id}>
                  <td>{spec.label}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* Rich text description */}
      {product.description && (
        <section
          aria-label="Description"
          dangerouslySetInnerHTML={{ __html: product.description }}
        />
      )}
    </main>
  );
}
