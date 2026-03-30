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
import { ArrowRight, Star, Phone, ShoppingBag, ChevronRight, ChevronLeft, ZoomIn, X, Share2, Heart, Copy, Check, MessageCircle, Send } from "lucide-react";
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
  const [sendToFriend, setSendToFriend] = useState(false);
  const [friendPhone, setFriendPhone] = useState("");
  const [friendMessage, setFriendMessage] = useState("");
  const [sentToFriend, setSentToFriend] = useState(false);

  // ── Order Notes Modal ──
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderNotes, setOrderNotes] = useState("");
  const [orderQty, setOrderQty] = useState(1);
  const [orderDeliveryDate, setOrderDeliveryDate] = useState("");

  const logOrderMutation = trpc.orders.logWhatsappOrder.useMutation();

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

  const productUrl = typeof window !== "undefined"
    ? `https://www.markzbader.org/product/${data?.product.id}`
    : "";

  const buildWhatsappMessage = (qty: number, deliveryDate: string, notes: string) =>
    data
      ? encodeURIComponent(
          `مرحباً مركز بدر 👋\n` +
          `📦 *المنتج المطلوب:* ${data.product.name}\n` +
          `💰 *السعر:* ${data.product.price}\n` +
          `🔢 *الكمية:* ${qty}\n` +
          (deliveryDate ? `📅 *تاريخ التسليم:* ${deliveryDate}\n` : "") +
          `🔗 *رابط المنتج:* ${productUrl}` +
          (notes.trim() ? `\n📝 *ملاحظات:* ${notes.trim()}` : "") +
          `\n\nأرجو التواصل معي لإتمام الطلب.`
        )
      : "";

  const openOrderModal = () => {
    if (!data?.product.inStock) return;
    setOrderNotes("");
    setOrderQty(1);
    setOrderDeliveryDate("");
    setOrderModalOpen(true);
  };

  const sendOrderWhatsApp = () => {
    if (!data) return;
    const msg = buildWhatsappMessage(orderQty, orderDeliveryDate, orderNotes);
    // Log order to DB + notify admin (fire-and-forget)
    logOrderMutation.mutate({
      productId: data.product.id,
      productName: data.product.name,
      productPrice: data.product.price,
      productUrl,
      qty: orderQty,
      deliveryDate: orderDeliveryDate || undefined,
      notes: orderNotes || undefined,
    });
    window.open(`https://wa.me/96522675826?text=${msg}`, "_blank");
    setOrderModalOpen(false);
    setOrderNotes("");
    setOrderQty(1);
    setOrderDeliveryDate("");
  };

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

  const sendProductToFriend = () => {
    if (!friendPhone.trim()) return;
    // Normalize phone: strip non-digits, add country code if missing
    let phone = friendPhone.replace(/\D/g, "");
    if (phone.startsWith("0")) phone = "965" + phone.slice(1);
    if (!phone.startsWith("965") && phone.length <= 8) phone = "965" + phone;
    const customNote = friendMessage.trim() ? `\n💬 ${friendMessage.trim()}` : "";
    const text = encodeURIComponent(
      `🛍️ شاهد هذا المنتج من مركز بدر:\n${data?.product.name}\n💰 ${data?.product.price}${customNote}\n🔗 ${window.location.href}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
    setSentToFriend(true);
    setTimeout(() => {
      setSentToFriend(false);
      setFriendPhone("");
      setFriendMessage("");
      setSendToFriend(false);
      setShareOpen(false);
    }, 2000);
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
              <button
                onClick={openOrderModal}
                disabled={!product.inStock}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all duration-300"
                style={{
                  background: product.inStock
                    ? "linear-gradient(135deg, #B89050 0%, #9C7A3C 50%, #7A5C28 100%)"
                    : "rgba(156,122,60,0.2)",
                  color: product.inStock ? "#1A1510" : "rgba(201,168,76,0.4)",
                  cursor: product.inStock ? "pointer" : "not-allowed",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  boxShadow: product.inStock ? "0 4px 20px rgba(156,122,60,0.3)" : "none",
                  border: "none",
                }}
              >
                <Phone className="w-5 h-5" />
                {product.inStock ? "اطلب عبر واتساب" : "نفذت الكمية"}
              </button>

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

                      {/* Send to a friend */}
                      <div style={{ borderTop: "1px solid rgba(156,122,60,0.08)" }}>
                        {!sendToFriend ? (
                          <button
                            onClick={() => setSendToFriend(true)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-right"
                            style={{ color: "rgba(232,213,160,0.85)" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(156,122,60,0.08)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                          >
                            <Send className="w-4 h-4 flex-none" style={{ color: "#9C7A3C" }} />
                            أرسل لصديق
                          </button>
                        ) : (
                          <div className="px-4 py-3 space-y-2">
                            <p className="text-xs" style={{ color: "rgba(156,122,60,0.7)" }}>
                              أدخل رقم الهاتف (كويتي أو دولي)
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="tel"
                                value={friendPhone}
                                onChange={(e) => setFriendPhone(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && sendProductToFriend()}
                                placeholder="مثال: 55001234"
                                autoFocus
                                className="flex-1 rounded-lg px-3 py-2 text-sm outline-none text-right"
                                style={{
                                  background: "rgba(255,255,255,0.06)",
                                  border: "1px solid rgba(156,122,60,0.3)",
                                  color: "rgba(232,213,160,0.9)",
                                  direction: "ltr",
                                }}
                              />
                              <button
                                onClick={sendProductToFriend}
                                disabled={!friendPhone.trim() || sentToFriend}
                                className="rounded-lg px-3 py-2 text-sm font-bold transition-all flex-none"
                                style={{
                                  background: sentToFriend ? "rgba(76,175,80,0.2)" : "rgba(37,211,102,0.15)",
                                  border: `1px solid ${sentToFriend ? "#4CAF50" : "#25D366"}`,
                                  color: sentToFriend ? "#4CAF50" : "#25D366",
                                  opacity: !friendPhone.trim() ? 0.4 : 1,
                                }}
                              >
                                {sentToFriend ? <Check className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                              </button>
                            </div>
                            <textarea
                              value={friendMessage}
                              onChange={(e) => setFriendMessage(e.target.value)}
                              placeholder="رسالة مخصصة (اختياري)..."
                              rows={2}
                              className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none text-right"
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(156,122,60,0.2)",
                                color: "rgba(232,213,160,0.9)",
                              }}
                            />
                            {sentToFriend && (
                              <p className="text-xs" style={{ color: "#4CAF50" }}>تم الفتح في واتساب ✓</p>
                            )}
                          </div>
                        )}
                      </div>
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

      {/* ── Order Notes Modal ── */}
      {orderModalOpen && data && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setOrderModalOpen(false); }}
        >
          <div
            className="w-full max-w-md rounded-3xl p-6 flex flex-col gap-5"
            style={{
              background: "linear-gradient(145deg, #1A1510, #2C2416)",
              border: "1px solid rgba(201,168,76,0.25)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 40px rgba(156,122,60,0.1)",
              direction: "rtl",
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className="text-xl font-bold mb-1"
                  style={{ color: "#E8D5A0", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  تفاصيل الطلب
                </h3>
                <p className="text-sm" style={{ color: "rgba(201,168,76,0.6)" }}>
                  {data.product.name}
                </p>
              </div>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", color: "rgba(201,168,76,0.5)" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product summary */}
            <div
              className="flex items-center gap-3 rounded-2xl p-3"
              style={{ background: "rgba(156,122,60,0.08)", border: "1px solid rgba(156,122,60,0.15)" }}
            >
              <img
                src={data.product.image}
                alt={data.product.name}
                className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
              />
              <div>
                <p className="font-semibold text-sm" style={{ color: "#E8D5A0" }}>{data.product.name}</p>
                <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>{data.product.price}</p>
              </div>
            </div>

            {/* Qty + Delivery Date row */}
            <div className="grid grid-cols-2 gap-3">
              {/* Quantity */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={{ color: "rgba(201,168,76,0.8)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                  الكمية
                </label>
                <div className="flex items-center rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(156,122,60,0.25)", background: "rgba(255,255,255,0.04)" }}>
                  <button
                    type="button"
                    onClick={() => setOrderQty((q) => Math.max(1, q - 1))}
                    className="w-10 h-11 flex items-center justify-center text-lg font-bold transition-colors"
                    style={{ color: "#C9A84C", background: "rgba(156,122,60,0.1)" }}
                  >-</button>
                  <span className="flex-1 text-center text-base font-bold" style={{ color: "#E8D5A0" }}>{orderQty}</span>
                  <button
                    type="button"
                    onClick={() => setOrderQty((q) => q + 1)}
                    className="w-10 h-11 flex items-center justify-center text-lg font-bold transition-colors"
                    style={{ color: "#C9A84C", background: "rgba(156,122,60,0.1)" }}
                  >+</button>
                </div>
              </div>

              {/* Delivery Date */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold" style={{ color: "rgba(201,168,76,0.8)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                  تاريخ التسليم <span style={{ color: "rgba(201,168,76,0.4)" }}>(اختياري)</span>
                </label>
                <input
                  type="date"
                  value={orderDeliveryDate}
                  onChange={(e) => setOrderDeliveryDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full h-11 rounded-2xl px-3 text-sm outline-none"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(156,122,60,0.25)",
                    color: orderDeliveryDate ? "#E8D5A0" : "rgba(201,168,76,0.4)",
                    colorScheme: "dark",
                  }}
                />
              </div>
            </div>

            {/* Notes field */}
            <div className="flex flex-col gap-2">
              <label
                className="text-sm font-semibold"
                style={{ color: "rgba(201,168,76,0.8)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                ملاحظات إضافية <span style={{ color: "rgba(201,168,76,0.4)" }}>(اختياري)</span>
              </label>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="مثال: اللون المطلوب، الحجم، اسم الشخص المكرَّم..."
                rows={3}
                className="w-full rounded-2xl p-4 text-sm resize-none outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(156,122,60,0.25)",
                  color: "#E8D5A0",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  caretColor: "#C9A84C",
                }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(156,122,60,0.25)")}
                autoFocus
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={sendOrderWhatsApp}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-base transition-all duration-200"
                style={{
                  background: "linear-gradient(135deg, #B89050 0%, #9C7A3C 50%, #7A5C28 100%)",
                  color: "#1A1510",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  boxShadow: "0 4px 20px rgba(156,122,60,0.35)",
                  border: "none",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                إرسال الطلب عبر واتساب
              </button>
              <button
                onClick={() => setOrderModalOpen(false)}
                className="px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(156,122,60,0.2)",
                  color: "rgba(201,168,76,0.6)",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
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
