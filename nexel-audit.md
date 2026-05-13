
# Nexel — Полный аудит проекта

> **Стек:** Next.js 15 (App Router) + Strapi v5 + Framer Motion + TailwindCSS v4 + shadcn/ui

---

## ✅ Что работает хорошо

| Область                        | Статус | Комментарий                                                               |
| ------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| ISR (Incremental Static Regeneration) | ✅           | `revalidate = 120` на главной, `60` на продукте               |
| Error handling (CMS fallback)         | ✅           | `try/catch` + graceful fallback с пустыми массивами               |
| `generateStaticParams`              | ✅           | Страницы продуктов пре-рендерятся при сборке  |
| `generateMetadata`                  | ✅           | OG-теги, SEO title, description                                                  |
| `getMediaURL()`                     | ✅           | Централизованный хелпер для URL изображений      |
| TypeScript типизация         | ✅           | Хорошо типизированы Strapi response обёртки                 |
| Framer Motion анимации        | ✅           | Stagger, AnimatePresence, hover эффекты                                       |
| Responsive layout                     | ✅           | sm/md/lg брейкпоинты везде                                           |
| Portal для blur overlay            | ✅           | Умное решение со stacking context                                      |
| Footer OpenStreetMap                  | ✅           | Инвертированная тема карты под dark footer                |
| MegaMenu паузы debounce          | ✅           | `setTimeout(200ms)` предотвращает случайное закрытие |
| `Promise.all` в getHomepageData    | ✅           | Параллельная загрузка всех данных                      |

---

## 🐛 Баги и проблемы

### 1. `console.log` в продакшне — `Hero.tsx:12`

```tsx
// ❌ Сейчас (нужно удалить!)
console.log("RAW SLIDES:", JSON.stringify(slides, null, 2))
```

Это **утечка данных** и лишний overhead при каждом рендере страницы.

---

### 2. ESLint ERROR: `setState` в render-цикле — `MegaMenu.tsx:19-27`

```tsx
// ❌ Сейчас — вызывает cascading renders (ESLint error!)
if (activeCategory !== prevCategory) {
  setPrevCategory(activeCategory);
  setActiveSubId(firstSub.id);
}
```

Это нарушение React-паттернов — setState вызывается прямо во время рендера. Правильное решение — `useEffect`.

**Исправление:**

```tsx
// ✅ Правильно — через useEffect
useEffect(() => {
  if (activeCategory && MENU_DATA[activeCategory]) {
    const firstSub = MENU_DATA[activeCategory].subCategories[0];
    if (firstSub) setActiveSubId(firstSub.id);
  }
}, [activeCategory]);
```

---

### 3. `<img>` вместо `<Image>` в 3 местах

- `HeroSlider.tsx:112` — фоновое изображение слайда
- `HeroSlider.tsx:123` — PNG продукта
- `MegaMenu.tsx:98` — изображения продуктов в меню

Это означает **нет автоматической оптимизации** (WebP, lazy load, responsive sizes).

---

### 4. Category page использует статичные данные вместо CMS

```tsx
// ❌ category/[id]/page.tsx
import { MENU_DATA } from "@/lib/menuData";  // Статичные данные!
```

Страница категории читает из `menuData.ts` (захардкоженные данные), а не из Strapi. Если добавить новую категорию в CMS — она не появится на странице категории.

---

### 5. Ссылки в категории ведут на `id`, а не `slug`

```tsx
// ❌ MegaMenu.tsx:88
href={`/product/${product.id}`}  // числовой id

// ❌ category/[id]/page.tsx:62
href={`/product/${product.id}`}  // числовой id
```

А роутер продукта настроен на `slug`:

```tsx
// ✅ app/product/[slug]/page.tsx
```

Это **сломанные ссылки** — нажать на продукт из мегаменю или категории = 404.

---

### 6. `ProductGrid.tsx` — дублирующий компонент

Компонент `ProductGrid` (`src/components/ProductGrid.tsx`) дублирует логику `FeaturedProducts.tsx`, но нигде не импортируется. Это мёртвый код.

---

### 7. Неиспользуемые импорты в `MegaMenu.tsx`

```tsx
// ❌ Строка 5 — импортируются но не используются
import { Copy, LayoutGrid } from "lucide-react";
// Кнопка "Accessories" никуда не ведёт, просто декоративная
```

---

### 8. Цена отображается всегда в `$`

```tsx
// ProductPageClient.tsx:86
<p>${product.price}</p>
```

Если магазин узбекский (судя по адресу в футере — Ташкент), нужна валюта `сум` или хотя бы конфигурируемый параметр.

---

### 9. Hero слайдер — кнопка захардкожена

```tsx
// HeroSlider.tsx:167
<motion.button>Discover more</motion.button>
```

Текст кнопки (`buttonText` в CMS) игнорируется — в `Hero.tsx` адаптер маппит `slide.buttonLink`, но не `slide.buttonText`. В слайдере используется захардкоженный текст.

---

## ⚡ Советы по улучшению (приоритет)

### 🔴 Высокий приоритет

| # | Что делать                                                        | Где                                       |
| - | -------------------------------------------------------------------------- | -------------------------------------------- |
| 1 | Удалить `console.log`                                             | `Hero.tsx:12`                              |
| 2 | Исправить setState в render на `useEffect`                   | `MegaMenu.tsx:19-27`                       |
| 3 | Исправить ссылки `/product/${id}` → `/product/${slug}` | `MegaMenu.tsx`, `category/[id]/page.tsx` |
| 4 | Подключить category страницу к CMS                      | `category/[id]/page.tsx`                   |
| 5 | Передавать `buttonText` в слайдер                      | `Hero.tsx`, `HeroSlider.tsx`             |

### 🟡 Средний приоритет

| #  | Что делать                                                                     | Где                         |
| -- | --------------------------------------------------------------------------------------- | ------------------------------ |
| 6  | Заменить `<img>` на `<Image>` в HeroSlider и MegaMenu                   | 3 файла                   |
| 7  | Удалить `ProductGrid.tsx` (дублирует FeaturedProducts)                | `components/ProductGrid.tsx` |
| 8  | Добавить loading skeleton для FeaturedProducts                               | `FeaturedProducts.tsx`       |
| 9  | Добавить cart/корзину (сейчас AddToCartButton — заглушка) | `AddToCartButton.tsx`        |
| 10 | Настроить валюту через env var                                      | `ProductPageClient.tsx`      |

### 🟢 Низкий приоритет (nice-to-have)

| #  | Что делать                                                                     | Эффект                            |
| -- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| 11 | Добавить `loading.tsx` для product/category страниц                 | UX во время ISR revalidation     |
| 12 | Добавить `error.tsx` boundary                                                 | Graceful 500 errors                     |
| 13 | Search функциональность (сейчас иконка без логики) | Конверсия                      |
| 14 | Реализовать табы в FeaturedProducts (сейчас визуальные) | Фильтрация продуктов |
| 15 | Добавить `sitemap.ts` и `robots.ts`                                        | SEO                                     |
| 16 | Newsletter форма в Footer — подключить логику                    | Email маркетинг                |

---

## 🏗️ Архитектурные заметки

### Дублирование данных (`productData.ts` vs CMS)

В проекте есть `src/lib/productData.ts` (19 KB!) со статичными продуктами — это легаси от ранней стадии разработки. Сейчас данные идут из Strapi через адаптер, но старый файл всё ещё в проекте. Он может запутывать.

### `HeroSlide.bgColor` — запутанное именование

```ts
// types.ts — поле называется bgColor но содержит background IMAGE
bgColor: { url: string } | null;  // это фон-изображение
image: { url: string } | null;    // это PNG товара
```

Переименовать `bgColor` → `bgImage` в типах и адаптере для ясности.

---

## 📊 Общая оценка

| Критерий                      | Оценка |
| ------------------------------------- | ------------ |
| Архитектура                | 8/10         |
| Качество кода             | 7/10         |
| Производительность  | 7/10         |
| SEO                                   | 8/10         |
| UI/UX                                 | 9/10         |
| Полнота функционала | 6/10         |

**Главная задача сейчас:** исправить сломанные ссылки (продукт из мегаменю = 404) и подключить category страницу к CMS. Остальное — улучшения.
