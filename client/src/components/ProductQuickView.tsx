/**
 * ProductQuickView — Quick View Modal
 * Features: image gallery with thumbnails, lightbox for full-size view,
 * share button (copy link + WhatsApp), full description, rating, stock status,
 * WhatsApp CTA, and a link to the full product detail page.
 */
import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { X, ChevronRight, ChevronLeft, Star, ExternalLink, Maximize2, Share2, Copy, Check } from "lucide-react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
interface QuickViewProduct {
  id: number;
  name: string;
  nameEn?: string;
  description: string;
  price: string;
  priceNote?: string;
  priceValue?: number;
  image: string;
  category: string;
  tags: string[];
  rating: number;
  inStock: boolean;
  badge?: string;
  badgeColor?: string;
  // Pre-loaded gallery images passed from the catalog (avoids a second DB fetch)
  galleryImages?: { id: number; imageUrl: string; sortOrder?: number }[];
}

interface ProductQuickViewProps {
  product: QuickViewProduct | null;
  onClose: () => void;
}

// ─── Category labels ──────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  gifts: "الهدايا والدزات",
  shields: "الدروع والتكريمات",
  catering: "الكيترنج والبوثات",
  occasions: "تجهيزات المناسبات",
  calligraphy: "الخط والطباعة",
};

// ─── WhatsApp SVG ─────────────────────────────────────────────────────────────
function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

// ─── Lightbox Component ───────────────────────────────────────────────────────
function Lightbox({
  images,
  activeIdx,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[];
  activeIdx: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNext();
      if (e.key === "ArrowRight") onPrev();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
        aria-label="إغلاق"
      >
        <X size={20} />
      </button>

      {/* Counter */}
      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 text-sm px-3 py-1 rounded-full"
        style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
      >
        {activeIdx + 1} / {images.length}
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Main image */}
      <img
        src={images[activeIdx]}
        alt={`صورة ${activeIdx + 1}`}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
        style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=1200&q=80";
        }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 px-4 py-2 rounded-xl" style={{ background: "rgba(0,0,0,0.5)" }}>
          {images.map((src, idx) => (
            <button
              key={idx}
              onClick={() => {
                // navigate to idx — handled by parent via onPrev/onNext cycling
                const diff = idx - activeIdx;
                if (diff > 0) for (let i = 0; i < diff; i++) onNext();
                else if (diff < 0) for (let i = 0; i < -diff; i++) onPrev();
              }}
              className="flex-shrink-0 w-14 h-14 rounded-md overflow-hidden transition-all"
              style={{
                border: idx === activeIdx ? "2px solid #B89050" : "2px solid transparent",
                opacity: idx === activeIdx ? 1 : 0.55,
              }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Share Dropdown ───────────────────────────────────────────────────────────
function ShareDropdown({
  productId,
  productName,
  price,
  onClose,
}: {
  productId: number;
  productName: string;
  price: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const productUrl = `${window.location.origin}/product/${productId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = productUrl;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => { setCopied(false); onClose(); }, 1500);
    }
  };

  const waShareMsg = encodeURIComponent(
    `شاهد هذا المنتج من مركز بدر 🌟\n${productName}\nالسعر: ${price}\n\n${productUrl}`
  );

  return (
    <div
      className="absolute left-0 bottom-full mb-2 rounded-xl overflow-hidden shadow-2xl z-20 w-52"
      style={{
        background: "#F7F3EC",
        border: "1px solid rgba(156,122,60,0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
      }}
      dir="rtl"
    >
      {/* Copy link */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-amber-50"
        style={{ color: "#5A4A30", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
      >
        {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
        {copied ? "تم النسخ!" : "نسخ رابط المنتج"}
      </button>

      {/* WhatsApp share */}
      <a
        href={`https://wa.me/?text=${waShareMsg}`}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all hover:bg-green-50"
        style={{ color: "#166534", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
      >
        <WhatsAppIcon size={16} />
        مشاركة عبر واتساب
      </a>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProductQuickView({ product, onClose }: ProductQuickViewProps) {
  const [, navigate] = useLocation();
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Use pre-loaded gallery images if available; otherwise fall back to a DB fetch
  const { data: galleryData } = trpc.productImages.list.useQuery(
    { productId: product?.id ?? 0 },
    // Only fetch from DB if the caller didn't pass galleryImages
    { enabled: !!product?.id && !product?.galleryImages }
  );

  // Resolve gallery: prefer pre-loaded prop, then DB fetch, then empty
  const resolvedGallery =
    product?.galleryImages ??
    galleryData?.map((img) => ({ id: img.id, imageUrl: img.imageUrl })) ??
    [];

  // Build full image list: primary + gallery (sorted by sortOrder if available)
  const sortedGallery = [...resolvedGallery].sort(
    (a, b) => ((a as { sortOrder?: number }).sortOrder ?? 0) - ((b as { sortOrder?: number }).sortOrder ?? 0)
  );

  const allImages = product
    ? [product.image, ...sortedGallery.map((img) => img.imageUrl)]
    : [];

  // Reset active image when product changes
  useEffect(() => {
    setActiveImg(0);
    setLightboxOpen(false);
    setShareOpen(false);
  }, [product?.id]);

  // Close on Escape key (only when lightbox is NOT open — lightbox handles its own)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (lightboxOpen) return; // lightbox handles its own keyboard events
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setActiveImg((i) => (i + 1) % allImages.length);
      if (e.key === "ArrowRight") setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
    },
    [onClose, allImages.length, lightboxOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!product) return null;

  const waMsg = encodeURIComponent(
    `مرحباً مركز بدر 👋\nأريد الاستفسار عن: ${product.name}\nالسعر المذكور: ${product.price}\n\nأرجو التواصل معي.`
  );

  const prevImg = () => setActiveImg((i) => (i - 1 + allImages.length) % allImages.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % allImages.length);

  return (
    <>
      {/* Lightbox overlay */}
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          activeIdx={activeImg}
          onClose={() => setLightboxOpen(false)}
          onPrev={prevImg}
          onNext={nextImg}
        />
      )}

      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{ background: "rgba(13,11,8,0.85)", backdropFilter: "blur(6px)" }}
        onClick={(e) => {
          if (shareOpen) { setShareOpen(false); return; }
          e.target === e.currentTarget && onClose();
        }}
      >
        {/* Modal panel */}
        <div
          className="relative w-full max-w-3xl rounded-2xl overflow-hidden flex flex-col md:flex-row"
          style={{
            background: "#F7F3EC",
            boxShadow: "0 32px 80px rgba(0,0,0,0.4), 0 0 0 1px rgba(156,122,60,0.2)",
            maxHeight: "90vh",
          }}
          dir="rtl"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
            style={{ background: "rgba(13,11,8,0.7)", color: "#F0E6CC" }}
            aria-label="إغلاق"
          >
            <X size={18} />
          </button>

          {/* ── Left: Image Gallery ── */}
          <div className="relative md:w-[45%] flex-shrink-0" style={{ background: "#1A1510", minHeight: "280px" }}>
            {/* Main image — click to open lightbox */}
            <div
              className="relative h-64 md:h-full overflow-hidden cursor-zoom-in"
              onClick={() => setLightboxOpen(true)}
              title="انقر لعرض الصورة بالحجم الكامل"
            >
              <img
                src={allImages[activeImg] ?? product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600&q=80";
                }}
              />
              {/* Gradient overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: "linear-gradient(to top, rgba(13,11,8,0.6) 0%, transparent 50%)",
                }}
              />

              {/* Expand icon hint */}
              <div
                className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity"
                style={{ background: "rgba(13,11,8,0.6)", color: "#F0E6CC" }}
              >
                <Maximize2 size={13} />
              </div>

              {/* Badge */}
              {product.badge && (
                <div
                  className="absolute top-3 right-12 text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background: product.badgeColor ?? "#B89050",
                    color: product.badgeColor === "#B89050" ? "#2C2416" : "#F7F3EC",
                    fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  }}
                >
                  {product.badge}
                </div>
              )}

              {/* Stock badge */}
              <div className="absolute top-3 left-10">
                <span
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: product.inStock ? "rgba(22,101,52,0.85)" : "rgba(185,28,28,0.85)",
                    color: "#fff",
                    fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  {product.inStock ? "متوفر" : "نفذ"}
                </span>
              </div>

              {/* Prev / Next arrows — stop propagation so they don't open lightbox */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); prevImg(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(13,11,8,0.6)", color: "#F0E6CC" }}
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); nextImg(); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: "rgba(13,11,8,0.6)", color: "#F0E6CC" }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                </>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div
                  className="absolute bottom-3 left-1/2 -translate-x-1/2 text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: "rgba(13,11,8,0.6)",
                    color: "#F0E6CC",
                    fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  }}
                >
                  {activeImg + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails strip */}
            {allImages.length > 1 && (
              <div
                className="flex gap-1.5 p-2 overflow-x-auto"
                style={{ background: "#0D0B08" }}
              >
                {allImages.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImg(idx)}
                    className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden transition-all duration-200"
                    style={{
                      border: idx === activeImg
                        ? "2px solid #B89050"
                        : "2px solid transparent",
                      opacity: idx === activeImg ? 1 : 0.6,
                    }}
                  >
                    <img
                      src={src}
                      alt={`صورة ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=100&q=60";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Right: Product Info ── */}
          <div
            className="flex-1 flex flex-col overflow-y-auto p-6"
            style={{ background: "#F7F3EC" }}
          >
            {/* Category + Share row */}
            <div className="flex items-center justify-between mb-2">
              <p
                className="text-xs font-medium tracking-wide uppercase"
                style={{ color: "#9C7A3C", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                {CATEGORY_LABELS[product.category] ?? product.category}
              </p>

              {/* Share button */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen((v) => !v)}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-all hover:opacity-80"
                  style={{
                    background: "rgba(156,122,60,0.1)",
                    color: "#9C7A3C",
                    border: "1px solid rgba(156,122,60,0.25)",
                    fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  }}
                  title="مشاركة المنتج"
                >
                  <Share2 size={13} />
                  مشاركة
                </button>

                {shareOpen && (
                  <ShareDropdown
                    productId={product.id}
                    productName={product.name}
                    price={product.price}
                    onClose={() => setShareOpen(false)}
                  />
                )}
              </div>
            </div>

            {/* Name */}
            <h2
              className="text-2xl font-bold leading-snug mb-1"
              style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
            >
              {product.name}
            </h2>
            {product.nameEn && (
              <p
                className="text-sm mb-3"
                style={{ color: "#8A7560", fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic" }}
              >
                {product.nameEn}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-1.5 mb-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < product.rating ? "#B89050" : "transparent"}
                    color={i < product.rating ? "#B89050" : "#C9B99A"}
                  />
                ))}
              </div>
              <span
                className="text-xs"
                style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                ({product.rating}/5)
              </span>
            </div>

            {/* Description */}
            <p
              className="text-sm leading-relaxed mb-5 flex-1"
              style={{ color: "#5A4A30", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              {product.description}
            </p>

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(156,122,60,0.1)",
                      color: "#9C7A3C",
                      border: "1px solid rgba(156,122,60,0.25)",
                      fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: "1px solid rgba(156,122,60,0.15)", marginBottom: "1.25rem" }} />

            {/* Price */}
            <div className="flex items-end justify-between mb-5">
              <div>
                <span
                  className="text-3xl font-bold"
                  style={{ color: "#B89050", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {product.price}
                </span>
                {product.priceNote && (
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                  >
                    {product.priceNote}
                  </p>
                )}
              </div>
              <span
                className="text-sm font-medium px-3 py-1 rounded-full"
                style={{
                  background: product.inStock ? "rgba(22,101,52,0.1)" : "rgba(185,28,28,0.1)",
                  color: product.inStock ? "#166534" : "#991b1b",
                  border: `1px solid ${product.inStock ? "rgba(22,101,52,0.3)" : "rgba(185,28,28,0.3)"}`,
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                {product.inStock ? "✓ متوفر في المخزن" : "✗ نفذ المخزون"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5">
              {/* WhatsApp order */}
              <a
                href={`https://wa.me/96522675826?text=${waMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 py-3 rounded-xl text-sm font-bold transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
                style={{
                  background: "linear-gradient(135deg, #25D366, #1ebe5d)",
                  color: "#fff",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  boxShadow: "0 4px 16px rgba(37,211,102,0.3)",
                }}
              >
                <WhatsAppIcon size={18} />
                اطلب عبر واتساب
              </a>

              {/* View full details */}
              <button
                onClick={() => {
                  onClose();
                  navigate(`/product/${product.id}`);
                }}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 hover:opacity-90"
                style={{
                  background: "rgba(156,122,60,0.12)",
                  color: "#9C7A3C",
                  border: "1px solid rgba(156,122,60,0.35)",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                <ExternalLink size={14} />
                عرض الصفحة الكاملة
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
