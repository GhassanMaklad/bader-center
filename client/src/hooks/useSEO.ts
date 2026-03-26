/**
 * useSEO — Dynamic SEO hook for Bader Center
 *
 * Updates <title>, <meta name="description">, Open Graph, Twitter Card,
 * and canonical URL on every page mount/update.
 *
 * Usage:
 *   useSEO({ title: "الكتالوج", description: "تصفح منتجاتنا..." });
 */
import { useEffect } from "react";

const SITE_NAME = "مركز بدر | Bader Center";
const SITE_URL = "https://www.markzbader.org";
const DEFAULT_IMAGE = "https://www.markzbader.org/og-image.jpg";
const DEFAULT_DESCRIPTION =
  "مركز بدر — تجهيزات الكيترنج والبوثات، استقبالات وأفراح، دروع وتكريمات فاخرة. نجسد الفخامة منذ 20 عاماً في الكويت.";

export interface SEOProps {
  /** Page title — will be appended with " | مركز بدر" */
  title?: string;
  /** Meta description (max ~160 chars) */
  description?: string;
  /** Canonical URL path, e.g. "/catalog" */
  path?: string;
  /** Open Graph image URL */
  image?: string;
  /** "website" | "article" | "product" */
  type?: string;
  /** Extra JSON-LD structured data object */
  jsonLd?: Record<string, unknown>;
  /** Noindex this page */
  noIndex?: boolean;
}

function setMeta(name: string, content: string, attr: "name" | "property" = "name") {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setLink(rel: string, href: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

function setJsonLd(data: Record<string, unknown>) {
  const id = "seo-json-ld";
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.id = id;
    el.type = "application/ld+json";
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
}

function removeJsonLd() {
  const el = document.getElementById("seo-json-ld");
  if (el) el.remove();
}

export function useSEO({
  title,
  description = DEFAULT_DESCRIPTION,
  path = "",
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noIndex = false,
}: SEOProps = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
    const canonicalUrl = `${SITE_URL}${path}`;
    const ogImage = image.startsWith("http") ? image : `${SITE_URL}${image}`;

    // ── Basic ──────────────────────────────────────────────────────────────────
    document.title = fullTitle;
    setMeta("description", description);
    if (noIndex) {
      setMeta("robots", "noindex, nofollow");
    } else {
      setMeta("robots", "index, follow");
    }

    // ── Canonical ─────────────────────────────────────────────────────────────
    setLink("canonical", canonicalUrl);

    // ── Open Graph ────────────────────────────────────────────────────────────
    setMeta("og:type", type, "property");
    setMeta("og:title", fullTitle, "property");
    setMeta("og:description", description, "property");
    setMeta("og:url", canonicalUrl, "property");
    setMeta("og:image", ogImage, "property");
    setMeta("og:image:width", "1200", "property");
    setMeta("og:image:height", "630", "property");
    setMeta("og:site_name", SITE_NAME, "property");
    setMeta("og:locale", "ar_KW", "property");

    // ── Twitter Card ──────────────────────────────────────────────────────────
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", fullTitle);
    setMeta("twitter:description", description);
    setMeta("twitter:image", ogImage);
    setMeta("twitter:site", "@badercenterco");

    // ── JSON-LD ───────────────────────────────────────────────────────────────
    if (jsonLd) {
      setJsonLd(jsonLd);
    } else {
      removeJsonLd();
    }
  }, [title, description, path, image, type, jsonLd, noIndex]);
}

// ── Convenience builders for JSON-LD schemas ──────────────────────────────────

export const ORGANIZATION_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "مركز بدر",
  alternateName: "Bader Center",
  url: "https://www.markzbader.org",
  logo: "https://www.markzbader.org/logo.png",
  image: "https://www.markzbader.org/og-image.jpg",
  description:
    "مركز بدر — تجهيزات الكيترنج والبوثات، استقبالات وأفراح، دروع وتكريمات فاخرة. نجسد الفخامة منذ 20 عاماً في الكويت.",
  telephone: "+96522675826",
  address: {
    "@type": "PostalAddress",
    addressLocality: "الفحيحيل",
    addressCountry: "KW",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.0833,
    longitude: 48.1333,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
      opens: "09:00",
      closes: "22:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday"],
      opens: "16:00",
      closes: "22:00",
    },
  ],
  sameAs: [
    "https://www.instagram.com/badercenterco",
    "https://wa.me/96522675826",
  ],
  priceRange: "$$",
};

export function buildProductLD(product: {
  id: number;
  name: string;
  nameEn?: string | null;
  description: string;
  price: string;
  priceValue?: string | null;
  image: string;
  category: string;
  inStock: boolean;
  rating: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    alternateName: product.nameEn ?? undefined,
    description: product.description,
    image: product.image,
    url: `https://www.markzbader.org/product/${product.id}`,
    brand: {
      "@type": "Brand",
      name: "مركز بدر",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "KWD",
      price: product.priceValue ?? "0",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: product.priceValue ?? "0",
        priceCurrency: "KWD",
      },
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "مركز بدر",
      },
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      bestRating: 5,
      worstRating: 1,
      reviewCount: 1,
    },
  };
}

export function buildBreadcrumbLD(
  items: Array<{ name: string; url: string }>
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
