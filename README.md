# Nexel CMS

> Headless CMS backend for the Nexel premium ecommerce storefront.
> Built on **Strapi v5** · **PostgreSQL** · **Cloudinary**

---

## Architecture Overview

```
nexel-frontend (Next.js → Vercel)
        │
        │  REST API  (HTTPS)
        ▼
nexel-cms (Strapi v5 → Railway / Render)
        │
        ├── PostgreSQL  (Railway DB / Render DB / Supabase)
        └── Cloudinary  (media storage & CDN)
```

---

## Collection Types

| Collection | Purpose |
|---|---|
| `products` | Full product catalog with images, specs, colors, SEO |
| `categories` | Product categories with featured product relations |
| `hero-slides` | Homepage hero carousel, ordered + toggled |
| `featured-sections` | Homepage content sections, style variants |
| `navbar-sections` | Mega menu items with promo images |

### Shared Components
| Component | Fields |
|---|---|
| `product.specification` | `label`, `value` |
| `product.color` | `name`, `hex`, `image`, `inStock` |

---

## Quick Start (Local Dev)

### 1. Prerequisites
- Node.js 18–22
- PostgreSQL 14+ **OR** skip and use SQLite for local dev

### 2. Clone & Install

```bash
cd nexel-cms
npm install
```

### 3. Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# For local dev with SQLite (no Postgres required):
DATABASE_CLIENT=sqlite

# Or with local Postgres:
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=nexel_cms
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=yourpassword

CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret

APP_KEYS=key1,key2,key3,key4
API_TOKEN_SALT=somesalt
ADMIN_JWT_SECRET=somejwtsecret
TRANSFER_TOKEN_SALT=sometransfersalt
JWT_SECRET=somejwtsecret
```

> **Generate secure keys:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
> ```
> Run 4× for `APP_KEYS`, once each for the rest.

### 4. Create local PostgreSQL database

```bash
psql -U postgres -c "CREATE DATABASE nexel_cms;"
```

### 5. Run

```bash
npm run develop
```

Strapi admin → http://localhost:1337/admin

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard → API Keys**
3. Copy **Cloud Name**, **API Key**, **API Secret** into `.env`
4. In Cloudinary dashboard → **Settings → Upload → Upload presets** — create an unsigned preset named `nexel` for direct front-end uploads (optional)
5. Done — all Strapi media uploads will go to Cloudinary automatically

---

## API Token Setup (for Next.js storefront)

1. Start Strapi: `npm run develop`
2. Log into admin: http://localhost:1337/admin
3. Go to **Settings → API Tokens → Create new API Token**
4. Name: `Nexel Frontend Read`, Type: **Read-only**, Duration: **Unlimited**
5. Copy the token into your Next.js `.env.local`:
   ```env
   CMS_API_TOKEN=your-token-here
   ```

---

## Setting Public Permissions

By default Strapi requires auth for all endpoints. To make content public:

1. **Settings → Users & Permissions → Roles → Public**
2. Enable `find` and `findOne` for:
   - `product`
   - `category`
   - `hero-slide`
   - `featured-section`
   - `navbar-section`
3. Save

> For production, use API tokens instead of public access for better control.

---

## API Endpoints Reference

```
GET /api/products
GET /api/products/:documentId
GET /api/products?filters[slug][$eq]=my-product&populate=*

GET /api/categories
GET /api/categories?filters[slug][$eq]=audio&populate=*

GET /api/hero-slides?filters[active][$eq]=true&sort=order:asc&populate=*

GET /api/featured-sections?filters[active][$eq]=true&sort=order:asc&populate[products][populate]=images

GET /api/navbar-sections?filters[active][$eq]=true&sort=order:asc&populate=*
```

### Useful query parameters
| Parameter | Example | Description |
|---|---|---|
| `populate` | `populate=*` | Include all relations |
| `filters` | `filters[featured][$eq]=true` | Filter results |
| `sort` | `sort=order:asc` | Sort results |
| `pagination` | `pagination[page]=1&pagination[pageSize]=24` | Paginate |
| `fields` | `fields[0]=slug&fields[1]=title` | Select specific fields |

---

## Frontend Integration

Copy files from `frontend-integration/` into your Next.js project:

```bash
# In nexel-frontend repo:
mkdir -p lib/cms
cp /path/to/nexel-cms/frontend-integration/types.ts lib/cms/types.ts
cp /path/to/nexel-cms/frontend-integration/api.ts lib/cms/api.ts
cp /path/to/nexel-cms/frontend-integration/.env.local.example .env.local
```

Usage in Server Components:
```typescript
import { getHomepageData } from '@/lib/cms/api';

export default async function HomePage() {
  const { heroSlides, featuredSections, categories } = await getHomepageData();
  // ...
}
```

---

## Deployment

### CMS → Railway

1. Create a new project at [railway.app](https://railway.app)
2. Add **PostgreSQL** service — copy the `DATABASE_URL`
3. Deploy from GitHub:
   ```
   New Service → GitHub → select nexel-cms repo
   ```
4. Add environment variables (all from `.env.example`)
5. Set `DATABASE_URL` from Railway's Postgres service
6. Set `DATABASE_CLIENT=postgres`
7. Set custom domain: `cms.nexel.com`

**Railway build command:** `npm run build`  
**Railway start command:** `npm run start`

---

### CMS → Render

1. New Web Service → connect GitHub repo
2. Build Command: `npm install && npm run build`
3. Start Command: `npm run start`
4. Add a **PostgreSQL** database, copy `DATABASE_URL`
5. Add all env vars in Render dashboard
6. Custom domain: `cms.nexel.com`

---

### Frontend → Vercel

1. Connect `nexel-frontend` repo to Vercel
2. Add env vars:
   ```
   NEXT_PUBLIC_CMS_URL=https://cms.nexel.com
   CMS_API_TOKEN=your-read-only-token
   ```
3. Deploy — ISR revalidation handles cache automatically

---

## Production Checklist

- [ ] All `APP_KEYS` / `JWT_SECRET` / `ADMIN_JWT_SECRET` are strong random values
- [ ] `DATABASE_SSL=true` for Railway/Render PostgreSQL
- [ ] Cloudinary credentials set
- [ ] API Token created and added to frontend env
- [ ] Public permissions set for all collection types (or API token used)
- [ ] CORS `FRONTEND_URL` set to `https://nexel.com`
- [ ] Admin account created (first launch)
- [ ] All content types populated with initial data
- [ ] Hero slides have `active=true` and `order` set
- [ ] Navbar sections have `active=true` and `order` set

---

## Folder Structure

```
nexel-cms/
├── config/
│   ├── admin.js            # Admin JWT config
│   ├── api.js              # API rate limits
│   ├── database.js         # PostgreSQL / SQLite config
│   ├── middlewares.js      # CORS + Cloudinary CSP
│   ├── plugins.js          # Cloudinary upload provider
│   └── server.js           # Host/port config
├── src/
│   ├── api/
│   │   ├── product/        # Products CRUD
│   │   ├── category/       # Categories CRUD
│   │   ├── hero-slide/     # Hero carousel slides
│   │   ├── featured-section/ # Homepage sections
│   │   └── navbar-section/ # Mega menu
│   ├── components/
│   │   └── product/
│   │       ├── specification.json
│   │       └── color.json
│   └── index.js            # App bootstrap
├── frontend-integration/   # Copy into nexel-frontend
│   ├── types.ts            # → lib/cms/types.ts
│   ├── api.ts              # → lib/cms/api.ts
│   ├── homepage-example.tsx
│   ├── product-page-example.tsx
│   └── .env.local.example
├── .env.example
├── .gitignore
└── package.json
```
