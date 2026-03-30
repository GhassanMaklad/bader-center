/**
 * ProductDetail Page - مركز بدر - Bader Center
 * Design: Dark Arabian Opulence matching the catalog
 * - Full-width image gallery with thumbnail strip
 * - Complete product description, price, and WhatsApp CTA
 * - Related products grid
 * - RTL Arabic layout
 */
import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { ArrowRight, Star, Phone, ShoppingBag, ChevronRight, ChevronLeft, ZoomIn, X, Share2, Heart, Copy, Check, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import { trpc } from "@/lib/trpc";
import { useSEO, buildProductLD, buildBreadcrumbLD } from "@/hooks/useSEO";

// ─── Category label map ───────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<string, string> = {
  gifts: "الهدايا والدزات",
  shields: "الدروع والتكريم",
  catering: "الكيترنج",
  occasions: "المناسبات",
  calligraphy: "الخط العربي",
};

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: string[];
  startIndex: number;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setCurrent((c) => (c + 1) % images.length);
      if (e.key === "ArrowRight") setCurrent((c) => (c - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(5,4,2,0.96)" }}
      onClick={onClose}
    >
      <div className="relative w-full max-w-5xl mx-4" onClick={(e) => e.stopPropagation()}>
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute -top-12 left-0 p-2 rounded-full"
          style={{ color: "rgba(201,168,76,0.8)" }}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Main image */}
        <img
          src={images[current]}
          alt=""
          className="w-full rounded-2xl object-contain"
          style={{ maxHeight: "80vh" }}
        />

        {/* Counter */}
        <div
          className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold"
          style={{ background: "rgba(0,0,0,0.7)", color: "#C9A84C" }}
        >
          {current + 1} / {images.length}
        </div>

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrent((c) => (c - 1 + images.length) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(156,122,60,0.75)", color: "#FFF" }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrent((c) => (c + 1) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center"
              style={{ background: "rgba(156,122,60,0.75)", color: "#FFF" }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 justify-center mt-4 overflow-x-auto pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className="flex-none w-14 h-14 rounded-lg overflow-hidden transition-all"
                style={{
                  outline: idx === current ? "2px solid #C9A84C" : "2px solid transparent",
                  opacity: idx === current ? 1 : 0.5,
                }}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Related Product Card ─────────────────────────────────────────────────────
function RelatedCard({ product }: { product: { id: number; name: string; price: string; image: string; badge?: string | null; badgeColor?: string | null; rating: number } }) {
  const [, navigate] = useLocation();
  return (
    <div
      className="group rounded-2xl overflow-hidden cursor-pointer transition-all duration-300"
      style={{
        background: "#1A1510",
        border: "1px solid rgba(156,122,60,0.15)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
      }}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.4)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 32px rgba(156,122,60,0.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.15)";
        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.3)";
      }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "200px" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && (
          <div
            className="absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-bold"
            style={{ background: product.badgeColor ?? "#B89050", color: "#1A1510" }}
          >
            {product.badge}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h4
          className="font-semibold text-sm mb-2 line-clamp-2"
          style={{ color: "#E8D5A0", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
        >
          {product.name}
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold" style={{ color: "#C9A84C" }}>
            {product.price}
          </span>
          <div className="flex items-center gap-1">
            {Array.from({ length: product.rating }).map((_, i) => (
              <Star key={i} className="w-3 h-3 fill-current" style={{ color: "#C9A84C" }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ProductDetail Page ──────────────────────────────────────────────────
export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id ?? "0", 10);
  const [, navigate] = useLocation();

  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = trpc.products.detail.useQuery(
    { id: productId },
    { enabled: !!productId && !isNaN(productId) }
  );

  // Scroll to top on product change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [productId]);

  // Dynamic SEO — updates whenever product data loads
  useSEO(
    data
      ? {
          title: data.product.name,
          description: data.product.description.slice(0, 160),
          path: `/product/${productId}`,
          image: data.product.image,
          type: "product",
          jsonLd: {
            "@context": "https://schema.org",
            "@graph": [
              buildProductLD({
                id: data.product.id,
                name: data.product.name,
                nameEn: data.product.nameEn,
                description: data.product.description,
                price: data.product.price,
                priceValue: data.product.priceValue,
                image: data.product.image,
                category: data.product.category,
                inStock: data.product.inStock,
                rating: data.product.rating,
              }),
              buildBreadcrumbLD([
                { name: "الرئيسية", url: "https://www.markzbader.org/" },
                { name: "الكتالوج", url: "https://www.markzbader.org/catalog" },
                { name: data.product.name, url: `https://www.markzbader.org/product/${productId}` },
              ]),
            ],
          },
        }
      : {
          title: "تفاصيل المنتج",
          description: "تفاصيل المنتج — مركز بدر",
          path: `/product/${productId}`,
        }
  );

  // Build full image list: primary image + gallery images
  const allImages = data
    ? [data.product.image, ...data.images.map((img) => img.imageUrl)]
    : [];

  const openLightbox = (idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  };

  const whatsappMessage = data
    ? encodeURIComponent(`مرحباً، أريد الاستفسار عن المنتج: ${data.product.name}\nالسعر: ${data.product.price}`)
    : "";

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setShareOpen(false);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🛍️ ${data?.product.name}\n💰 ${data?.product.price}\n🔗 ${window.location.href}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
    setShareOpen(false);
  };

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen" style={{ background: "#0D0B08", direction: "rtl" }}>
        <AnnouncementBanner />
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#9C7A3C", borderTopColor: "transparent" }}
            />
            <p style={{ color: "rgba(201,168,76,0.6)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
              جاري التحميل...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Not found / error ──
  if (error || !data) {
    return (
      <div className="min-h-screen" style={{ background: "#0D0B08", direction: "rtl" }}>
        <AnnouncementBanner />
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
          <div className="text-6xl opacity-30">🔍</div>
          <h2
            className="text-2xl font-bold"
            style={{ color: "#E8D5A0", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
          >
            المنتج غير موجود
          </h2>
          <button
            onClick={() => navigate("/catalog")}
            className="px-6 py-3 rounded-xl font-bold transition-all"
            style={{ background: "linear-gradient(135deg, #B89050, #9C7A3C)", color: "#1A1510" }}
          >
            العودة للكتالوج
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const { product, images: galleryImages, related } = data;

  return (
    <div className="min-h-screen" style={{ background: "#0D0B08", direction: "rtl" }}>
      <AnnouncementBanner />
      <Navbar />

      <main className="container mx-auto px-4 lg:px-8 py-10">
        {/* ── Breadcrumb ── */}
        <nav className="flex items-center gap-2 mb-8 text-sm" style={{ color: "rgba(201,168,76,0.5)" }}>
          <Link href="/" className="hover:text-yellow-400 transition-colors" style={{ color: "rgba(201,168,76,0.5)" }}>
            الرئيسية
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <Link href="/catalog" className="hover:text-yellow-400 transition-colors" style={{ color: "rgba(201,168,76,0.5)" }}>
            الكتالوج
          </Link>
          <ChevronLeft className="w-3 h-3" />
          <span style={{ color: "#C9A84C" }}>{product.name}</span>
        </nav>

        {/* ── Main Product Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

          {/* Left: Image Gallery */}
          <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div
              className="relative rounded-2xl overflow-hidden cursor-zoom-in group"
              style={{
                background: "#1A1510",
                border: "1px solid rgba(156,122,60,0.2)",
                aspectRatio: "1 / 1",
              }}
              onClick={() => openLightbox(activeImage)}
            >
              <img
                key={activeImage}
                src={allImages[activeImage]}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-300"
                style={{ animation: "fadeIn 0.25s ease" }}
              />

              {/* Zoom hint */}
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.3)" }}
              >
                <ZoomIn className="w-10 h-10" style={{ color: "#C9A84C" }} />
              </div>

              {/* Badge */}
              {product.badge && (
                <div
                  className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold"
                  style={{ background: product.badgeColor ?? "#B89050", color: "#1A1510" }}
                >
                  {product.badge}
                </div>
              )}

              {/* Out of stock overlay */}
              {!product.inStock && (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.6)" }}
                >
                  <span
                    className="text-xl font-bold px-6 py-3 rounded-xl"
                    style={{ background: "rgba(156,122,60,0.3)", border: "1px solid #9C7A3C", color: "#C9A84C" }}
                  >
                    نفذت الكمية
                  </span>
                </div>
              )}

              {/* Image counter */}
              {allImages.length > 1 && (
                <div
                  className="absolute bottom-4 left-4 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: "rgba(0,0,0,0.7)", color: "#C9A84C" }}
                >
                  {activeImage + 1} / {allImages.length}
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className="flex-none w-20 h-20 rounded-xl overflow-hidden transition-all duration-200"
                    style={{
                      outline: idx === activeImage ? "2px solid #C9A84C" : "2px solid rgba(156,122,60,0.2)",
                      opacity: idx === activeImage ? 1 : 0.6,
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category tag */}
            <div>
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
                style={{ background: "rgba(156,122,60,0.15)", border: "1px solid rgba(156,122,60,0.3)", color: "#9C7A3C" }}
              >
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>
            </div>

            {/* Product name */}
            <h1
              className="text-3xl sm:text-4xl font-bold leading-snug"
              style={{ color: "#E8D5A0", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              {product.name}
            </h1>

            {/* English name */}
            {product.nameEn && (
              <p className="text-sm" style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Cormorant Garamond', serif", letterSpacing: "0.05em" }}>
                {product.nameEn}
              </p>
            )}

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-current"
                    style={{ color: i < product.rating ? "#C9A84C" : "rgba(156,122,60,0.25)" }}
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: "rgba(201,168,76,0.6)" }}>
                ({product.rating}.0)
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "linear-gradient(to left, transparent, rgba(156,122,60,0.4), transparent)" }} />

            {/* Price */}
            <div>
              <p
                className="text-3xl font-bold"
                style={{ color: "#C9A84C", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                {product.price}
              </p>
              {product.priceNote && (
                <p className="text-sm mt-1" style={{ color: "rgba(201,168,76,0.5)" }}>
                  {product.priceNote}
                </p>
              )}
            </div>

            {/* Description */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(26,21,16,0.8)", border: "1px solid rgba(156,122,60,0.12)" }}
            >
              <h3
                className="text-sm font-bold mb-3"
                style={{ color: "#9C7A3C", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                وصف المنتج
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#B8A88A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", whiteSpace: "pre-line" }}
              >
                {product.description}
              </p>
            </div>

            {/* Tags */}
            {product.tags && (() => {
              try {
                const tags: string[] = JSON.parse(product.tags);
                return tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs"
                        style={{ background: "rgba(156,122,60,0.1)", border: "1px solid rgba(156,122,60,0.2)", color: "rgba(201,168,76,0.7)" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null;
              } catch { return null; }
            })()}

            {/* Stock status */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: product.inStock ? "#4CAF50" : "#F44336" }}
              />
              <span
                className="text-sm font-semibold"
                style={{ color: product.inStock ? "#4CAF50" : "#F44336" }}
              >
                {product.inStock ? "متوفر في المخزن" : "نفذت الكمية"}
              </span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href={`https://wa.me/96522675826?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-300"
                style={{
                  background: product.inStock
                    ? "linear-gradient(135deg, #B89050 0%, #9C7A3C 50%, #7A5C28 100%)"
                    : "rgba(156,122,60,0.2)",
                  color: product.inStock ? "#1A1510" : "rgba(201,168,76,0.4)",
                  cursor: product.inStock ? "pointer" : "not-allowed",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  boxShadow: product.inStock ? "0 4px 20px rgba(156,122,60,0.3)" : "none",
                }}
              >
                <Phone className="w-5 h-5" />
                {product.inStock ? "اطلب عبر واتساب" : "نفذت الكمية"}
              </a>

              <button
                onClick={() => navigate("/request")}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-sm transition-all duration-300"
                style={{
                  background: "rgba(156,122,60,0.1)",
                  border: "1px solid rgba(156,122,60,0.3)",
                  color: "#C9A84C",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                <ShoppingBag className="w-4 h-4" />
                طلب مخصص
              </button>
            </div>

            {/* Share & Wishlist */}
            <div className="flex items-center gap-3">
              {/* Share dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShareOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm transition-colors"
                  style={{ color: copied ? "#4CAF50" : shareOpen ? "#C9A84C" : "rgba(201,168,76,0.5)" }}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "تم النسخ!" : "مشاركة"}
                </button>

                {shareOpen && (
                  <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-10" onClick={() => setShareOpen(false)} />
                    {/* Dropdown */}
                    <div
                      className="absolute bottom-full mb-2 right-0 z-20 rounded-2xl overflow-hidden shadow-2xl"
                      style={{
                        background: "rgba(20,16,10,0.97)",
                        border: "1px solid rgba(156,122,60,0.25)",
                        minWidth: "180px",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <div
                        className="px-4 py-2 text-xs font-bold tracking-widest uppercase"
                        style={{ color: "rgba(156,122,60,0.6)", borderBottom: "1px solid rgba(156,122,60,0.1)" }}
                      >
                        مشاركة المنتج
                      </div>
                      <button
                        onClick={copyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-right"
                        style={{ color: "rgba(232,213,160,0.85)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(156,122,60,0.1)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <Copy className="w-4 h-4 flex-none" style={{ color: "#9C7A3C" }} />
                        نسخ رابط المنتج
                      </button>
                      <button
                        onClick={shareWhatsApp}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-right"
                        style={{ color: "rgba(232,213,160,0.85)", borderTop: "1px solid rgba(156,122,60,0.08)" }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(37,211,102,0.08)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                      >
                        <MessageCircle className="w-4 h-4 flex-none" style={{ color: "#25D366" }} />
                        مشاركة عبر واتساب
                      </button>
                    </div>
                  </>
                )}
              </div>
              <span style={{ color: "rgba(156,122,60,0.3)" }}>|</span>
              <button
                onClick={() => setWishlist((w) => !w)}
                className="flex items-center gap-2 text-sm transition-colors"
                style={{ color: wishlist ? "#E57373" : "rgba(201,168,76,0.5)" }}
              >
                <Heart className={`w-4 h-4 ${wishlist ? "fill-current" : ""}`} />
                {wishlist ? "تمت الإضافة للمفضلة" : "إضافة للمفضلة"}
              </button>
            </div>

            {/* Contact info */}
            <div
              className="rounded-2xl p-4 flex items-center gap-4"
              style={{ background: "rgba(26,21,16,0.6)", border: "1px solid rgba(156,122,60,0.1)" }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-none"
                style={{ background: "rgba(156,122,60,0.15)" }}
              >
                <Phone className="w-5 h-5" style={{ color: "#9C7A3C" }} />
              </div>
              <div>
                <p className="text-xs" style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                  تحتاج مساعدة؟ تواصل معنا
                </p>
                <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>
                  22675826 — السبت–الخميس 9ص–10م
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Related Products ── */}
        {related.length > 0 && (
          <section>
            {/* Section header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p
                  className="text-xs tracking-widest uppercase mb-1 font-bold"
                  style={{ color: "#9C7A3C", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  ✦ منتجات مشابهة ✦
                </p>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "#E8D5A0", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  قد يعجبك أيضاً
                </h2>
              </div>
              <Link
                href={`/catalog?category=${product.category}`}
                className="flex items-center gap-1 text-sm font-semibold transition-colors"
                style={{ color: "#9C7A3C" }}
              >
                عرض الكل
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Related grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {related.map((rel) => (
                <RelatedCard key={rel.id} product={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          startIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
