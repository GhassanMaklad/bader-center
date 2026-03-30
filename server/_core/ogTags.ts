/**
 * ogTags.ts — Server-side Open Graph tag injection
 *
 * WhatsApp, Telegram, and other social bots do NOT execute JavaScript.
 * They read the raw HTML returned by the server. Since this is a SPA,
 * the index.html has static OG tags that always show the site default.
 *
 * This middleware intercepts requests to /product/:id BEFORE the SPA
 * catch-all, fetches the product from the database, and rewrites the
 * OG meta tags in the HTML with the product's real image, name, and price.
 *
 * For all other pages, it replaces the default og:image with the
 * Bader Center logo instead of any Manus branding.
 */

import { type Express } from "express";
import fs from "fs";
import path from "path";
import { getProductById } from "../db";

const SITE_URL = "https://www.markzbader.org";
const BADER_LOGO =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/bader_logo_08e79383.webp";
const SITE_NAME = "مركز بدر | Bader Center";
const DEFAULT_DESC =
  "مركز بدر — تجهيزات الكيترنج والبوثات، استقبالات وأفراح، دروع وتكريمات فاخرة. نجسد الفخامة منذ 20 عاماً في الكويت.";

/** Replace a single <meta> tag's content attribute in an HTML string */
function replaceMeta(
  html: string,
  attr: "name" | "property",
  key: string,
  value: string
): string {
  const escaped = value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  // Match both single and double-quoted content values
  const re = new RegExp(
    `(<meta\\s[^>]*${attr}=["']${key}["'][^>]*content=["'])([^"']*)`,
    "i"
  );
  const re2 = new RegExp(
    `(<meta\\s[^>]*content=["'])([^"']*)([^>]*${attr}=["']${key}["'])`,
    "i"
  );
  if (re.test(html)) return html.replace(re, `$1${escaped}`);
  if (re2.test(html)) return html.replace(re2, `$1${escaped}$3`);
  return html;
}

/** Inject OG tags for a product page */
function injectProductOG(
  html: string,
  product: {
    name: string;
    description: string;
    price: string;
    image: string;
    id: number;
  }
): string {
  const title = `${product.name} | ${SITE_NAME}`;
  const description = `${product.description.slice(0, 140)} — السعر: ${product.price}`;
  const image = product.image.startsWith("http")
    ? product.image
    : `${SITE_URL}${product.image}`;
  const url = `${SITE_URL}/product/${product.id}`;

  let result = html;

  // <title>
  result = result.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);

  // Open Graph
  result = replaceMeta(result, "property", "og:title", title);
  result = replaceMeta(result, "property", "og:description", description);
  result = replaceMeta(result, "property", "og:image", image);
  result = replaceMeta(result, "property", "og:url", url);
  result = replaceMeta(result, "property", "og:type", "product");

  // Twitter Card
  result = replaceMeta(result, "name", "twitter:title", title);
  result = replaceMeta(result, "name", "twitter:description", description);
  result = replaceMeta(result, "name", "twitter:image", image);

  // Basic meta
  result = replaceMeta(result, "name", "description", description);

  return result;
}

/** Replace the default og:image with the Bader Center logo for non-product pages */
function injectDefaultOG(html: string): string {
  let result = html;
  result = replaceMeta(result, "property", "og:image", BADER_LOGO);
  result = replaceMeta(result, "name", "twitter:image", BADER_LOGO);
  return result;
}

/**
 * Register the OG-tag middleware on the Express app.
 * Must be called BEFORE setupVite / serveStatic so it intercepts first.
 */
export function registerOGMiddleware(app: Express, getHtml: () => Promise<string>) {
  // Product detail pages — inject product-specific OG tags
  app.get("/product/:id", async (req, res, next) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return next();

    // Only intercept social/bot crawlers (User-Agent sniffing)
    // Regular browsers get the SPA as usual; bots get pre-filled OG tags
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isBot =
      ua.includes("whatsapp") ||
      ua.includes("telegrambot") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("twitterbot") ||
      ua.includes("linkedinbot") ||
      ua.includes("slackbot") ||
      ua.includes("discordbot") ||
      ua.includes("googlebot") ||
      ua.includes("bingbot") ||
      ua.includes("applebot") ||
      ua.includes("snapchat") ||
      ua.includes("viber") ||
      ua.includes("line/") ||
      ua.includes("pinterest") ||
      ua.includes("embedly") ||
      ua.includes("outbrain") ||
      ua.includes("crawler") ||
      ua.includes("spider") ||
      ua.includes("bot/");

    if (!isBot) return next();

    try {
      const product = await getProductById(id);
      if (!product) return next();

      const html = await getHtml();
      const injected = injectProductOG(html, product);
      res.status(200).set({ "Content-Type": "text/html" }).end(injected);
    } catch {
      next();
    }
  });

  // All other pages — replace og:image with Bader Center logo
  app.use(async (req, res, next) => {
    const ua = (req.headers["user-agent"] || "").toLowerCase();
    const isBot =
      ua.includes("whatsapp") ||
      ua.includes("telegrambot") ||
      ua.includes("facebookexternalhit") ||
      ua.includes("twitterbot") ||
      ua.includes("linkedinbot") ||
      ua.includes("slackbot") ||
      ua.includes("discordbot") ||
      ua.includes("googlebot") ||
      ua.includes("bingbot") ||
      ua.includes("applebot") ||
      ua.includes("snapchat") ||
      ua.includes("viber") ||
      ua.includes("line/") ||
      ua.includes("pinterest") ||
      ua.includes("embedly") ||
      ua.includes("outbrain") ||
      ua.includes("crawler") ||
      ua.includes("spider") ||
      ua.includes("bot/");

    // Only intercept HTML page requests from bots
    const isHtmlRequest =
      !req.path.startsWith("/api/") &&
      !req.path.startsWith("/assets/") &&
      !req.path.match(/\.(js|css|png|jpg|jpeg|webp|gif|svg|ico|woff|woff2|ttf|json|xml|txt)$/);

    if (!isBot || !isHtmlRequest) return next();

    try {
      const html = await getHtml();
      const injected = injectDefaultOG(html);
      res.status(200).set({ "Content-Type": "text/html" }).end(injected);
    } catch {
      next();
    }
  });
}
