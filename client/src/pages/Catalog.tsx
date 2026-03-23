/**
 * Catalog Page - مركز بدر - Bader Center
 * Design: Dark Arabian Opulence
 * - Filterable product grid with category tabs
 * - Gold price tags and hover effects
 * - WhatsApp order CTA per product
 * - RTL Arabic layout
 */
import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, Filter, ShoppingBag, ArrowRight, Star, Phone, Loader2, ShoppingCart, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import CartDrawer from "@/components/CartDrawer";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";

// ─── Product Data ──────────────────────────────────────────────────────────────
const INSTAGRAM_IMAGES = {
  greenBox:    "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_green_box_e70d62fd.webp",
  dazza:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_dazza_display_d7fb14b3.webp",
  ramadan:     "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_ramadan_cups_b30ce7d6.jpg",
  calligraphy: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product11_5a30bbf2.jpg",
  qargian:     "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_qargian_2026_532a544d.webp",
  boxes:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_boxes_12e0ff8e.jpg",
  booth:       "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_booth_stand_79e2e9ef.webp",
  national:    "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_booth_stand_a9bad866.jpg",
  product6:    "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product6_de1b84b3.jpg",
  eidEngraving:"https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_eid_engraving_e4c56a13.jpg",
  product10:   "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product10_077fb0b4.jpg",
};

// Unsplash fallback images for variety
const UNSPLASH = {
  shield1:  "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80",
  shield2:  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=600&q=80",
  giftBox1: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&q=80",
  giftBox2: "https://images.unsplash.com/photo-1607344645866-009c320b63e0?w=600&q=80",
  catering: "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=80",
  flowers:  "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80",
};

type Category = "all" | "gifts" | "shields" | "catering" | "occasions" | "calligraphy";

interface Product {
  id: number;
  name: string;
  nameEn: string;
  category: Category;
  price: string;
  priceValue: number; // numeric KD value for sorting (0 = contact for price)
  priceNote?: string;
  image: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  rating: number;
  inStock: boolean;
  tags: string[];
}

const products: Product[] = [
  // ── Gifts ──
  {
    id: 1,
    name: "دزة الورود الفاخرة",
    nameEn: "Luxury Rose Dazza",
    category: "gifts",
    price: "من 45 د.ك",
    priceValue: 45,
    priceNote: "حسب الحجم",
    image: INSTAGRAM_IMAGES.dazza,
    badge: "الأكثر طلباً",
    badgeColor: "#B89050",
    description: "دزة ورود طبيعية فاخرة مع تغليف مخصص وبطاقة إهداء بالخط العربي",
    rating: 5,
    inStock: true,
    tags: ["أفراح", "هدايا", "رمضان"],
  },
  {
    id: 2,
    name: "بوكس هبّة رمضان",
    nameEn: "Ramadan Gift Box",
    category: "gifts",
    price: "من 25 د.ك",
    priceValue: 25,
    priceNote: "يشمل التوصيل",
    image: INSTAGRAM_IMAGES.ramadan,
    badge: "موسمي",
    badgeColor: "#1a6b3c",
    description: "صندوق هدايا رمضاني فاخر يحتوي على تمور وشوكولاتة وعطور مختارة",
    rating: 5,
    inStock: true,
    tags: ["رمضان", "هدايا"],
  },
  {
    id: 3,
    name: "بوكس الخضرة الفاخر",
    nameEn: "Luxury Green Gift Box",
    category: "gifts",
    price: "من 35 د.ك",
    priceValue: 35,
    image: INSTAGRAM_IMAGES.greenBox,
    description: "صندوق هدايا أخضر فاخر مزين بالزهور والشرائط الذهبية — مثالي للأفراح والمناسبات",
    rating: 4,
    inStock: true,
    tags: ["أفراح", "هدايا", "عيد"],
  },
  {
    id: 4,
    name: "بوكسات البراند المخصصة",
    nameEn: "Custom Brand Boxes",
    category: "gifts",
    price: "من 8 د.ك / قطعة",
    priceValue: 8,
    priceNote: "بالجملة متاح",
    image: INSTAGRAM_IMAGES.boxes,
    badge: "شركات",
    badgeColor: "#2563eb",
    description: "صناديق هدايا مخصصة بشعار شركتك وألوانك — مثالية للفعاليات المؤسسية",
    rating: 5,
    inStock: true,
    tags: ["شركات", "هدايا", "مخصص"],
  },
  {
    id: 5,
    name: "هدية الورود المجففة",
    nameEn: "Dried Flowers Gift",
    category: "gifts",
    price: "من 18 د.ك",
    priceValue: 18,
    image: INSTAGRAM_IMAGES.dazza,
    description: "ترتيب فني للورود المجففة مع تغليف فاخر — تدوم لسنوات كذكرى جميلة",
    rating: 4,
    inStock: true,
    tags: ["هدايا", "ديكور"],
  },
  {
    id: 6,
    name: "هدية الفطر الفاخرة",
    nameEn: "Eid Premium Gift",
    category: "gifts",
    price: "من 30 د.ك",
    priceValue: 30,
    image: INSTAGRAM_IMAGES.eidEngraving,
    badge: "عيد",
    badgeColor: "#7c3aed",
    description: "مجموعة هدايا عيد الفطر الفاخرة مع تغليف ذهبي وبطاقة تهنئة مخطوطة",
    rating: 5,
    inStock: true,
    tags: ["عيد", "هدايا"],
  },

  // ── Shields ──
  {
    id: 7,
    name: "درع التكريم الذهبي",
    nameEn: "Gold Honor Shield",
    category: "shields",
    price: "من 22 د.ك",
    priceValue: 22,
    priceNote: "يشمل النقش",
    image: INSTAGRAM_IMAGES.product6,
    badge: "الأكثر مبيعاً",
    badgeColor: "#B89050",
    description: "درع تكريم ذهبي فاخر بنقش ليزر دقيق — مثالي للمدارس والشركات والجهات الحكومية",
    rating: 5,
    inStock: true,
    tags: ["شركات", "مدارس", "تكريم"],
  },
  {
    id: 8,
    name: "درع الكريستال الفاخر",
    nameEn: "Crystal Luxury Shield",
    category: "shields",
    price: "من 35 د.ك",
    priceValue: 35,
    image: INSTAGRAM_IMAGES.boxes,
    description: "درع كريستال شفاف مع قاعدة خشبية فاخرة ونقش ذهبي — للمناسبات الرسمية الكبرى",
    rating: 5,
    inStock: true,
    tags: ["شركات", "حكومة", "تكريم"],
  },
  {
    id: 9,
    name: "درع الخط العربي",
    nameEn: "Arabic Calligraphy Shield",
    category: "shields",
    price: "من 28 د.ك",
    priceValue: 28,
    image: INSTAGRAM_IMAGES.eidEngraving,
    badge: "حصري",
    badgeColor: "#b91c1c",
    description: "درع مميز بخط عربي أصيل منقوش بالليزر — تصميم حصري لكل مناسبة",
    rating: 5,
    inStock: true,
    tags: ["تكريم", "مخصص", "فن"],
  },
  {
    id: 10,
    name: "درع الشركات المؤسسي",
    nameEn: "Corporate Shield",
    category: "shields",
    price: "من 18 د.ك",
    priceValue: 18,
    priceNote: "خصم للكميات",
    image: INSTAGRAM_IMAGES.greenBox,
    description: "درع مؤسسي بشعار الشركة وبيانات الموظف — مثالي لحفلات التخرج والتكريم",
    rating: 4,
    inStock: true,
    tags: ["شركات", "تكريم", "جملة"],
  },

  // ── Catering ──
  {
    id: 11,
    name: "ستاند الكيترنج الفاخر",
    nameEn: "Luxury Catering Stand",
    category: "catering",
    price: "تواصل للسعر",
    priceValue: 0,
    image: INSTAGRAM_IMAGES.booth,
    badge: "خدمة كاملة",
    badgeColor: "#0f766e",
    description: "ستاند كيترنج مجهز بالكامل مع طاقم خدمة محترف — للأفراح والفعاليات الكبرى",
    rating: 5,
    inStock: true,
    tags: ["أفراح", "فعاليات", "شركات"],
  },
  {
    id: 12,
    name: "بوث العيد الوطني",
    nameEn: "National Day Booth",
    category: "catering",
    price: "تواصل للسعر",
    priceValue: 0,
    image: INSTAGRAM_IMAGES.national,
    badge: "وطني",
    badgeColor: "#166534",
    description: "بوث احتفالي بالألوان الوطنية الكويتية — مجهز للفعاليات والمدارس والشركات",
    rating: 5,
    inStock: true,
    tags: ["وطني", "فعاليات", "مدارس"],
  },
  {
    id: 13,
    name: "طاولة الضيافة الفاخرة",
    nameEn: "Luxury Hospitality Table",
    category: "catering",
    price: "من 120 د.ك",
    priceValue: 120,
    image: INSTAGRAM_IMAGES.ramadan,
    description: "طاولة ضيافة مجهزة بالكامل مع مفارش فاخرة وأدوات تقديم ذهبية",
    rating: 4,
    inStock: true,
    tags: ["أفراح", "استقبالات"],
  },

  // ── Occasions ──
  {
    id: 14,
    name: "تجهيزات قرقيعان 2026",
    nameEn: "Qargian 2026 Package",
    category: "occasions",
    price: "من 15 د.ك",
    priceValue: 15,
    priceNote: "للطفل الواحد",
    image: INSTAGRAM_IMAGES.qargian,
    badge: "2026",
    badgeColor: "#B89050",
    description: "حقيبة قرقيعان مميزة بتصميم حصري لعام 2026 مع حلويات وألعاب مختارة",
    rating: 5,
    inStock: true,
    tags: ["قرقيعان", "أطفال", "موسمي"],
  },
  {
    id: 15,
    name: "باقة تخرج الذكريات",
    nameEn: "Graduation Memory Package",
    category: "occasions",
    price: "من 40 د.ك",
    priceValue: 40,
    image: INSTAGRAM_IMAGES.product10,
    description: "باقة تخرج شاملة: درع + بوكس هدايا + بطاقة تهنئة بالخط العربي",
    rating: 5,
    inStock: true,
    tags: ["تخرج", "هدايا", "تكريم"],
  },

  // ── Calligraphy ──
  {
    id: 16,
    name: "لوحة الخط بالخيوط",
    nameEn: "Thread Calligraphy Art",
    category: "calligraphy",
    price: "من 55 د.ك",
    priceValue: 55,
    image: INSTAGRAM_IMAGES.calligraphy,
    badge: "فن حصري",
    badgeColor: "#b91c1c",
    description: "لوحة فنية بالخط العربي منفذة بالخيوط الملونة على خلفية داكنة — قطعة فنية فريدة",
    rating: 5,
    inStock: true,
    tags: ["فن", "ديكور", "هدايا"],
  },
  {
    id: 17,
    name: "نقش ليزر مخصص",
    nameEn: "Custom Laser Engraving",
    category: "calligraphy",
    price: "من 12 د.ك",
    priceValue: 12,
    priceNote: "حسب الحجم",
    image: INSTAGRAM_IMAGES.product6,
    description: "نقش ليزر دقيق على الخشب أو المعدن أو الكريستال — أي نص أو شعار تريده",
    rating: 5,
    inStock: true,
    tags: ["نقش", "مخصص", "هدايا"],
  },
];

// ─── Category Config ────────────────────────────────────────────────────────────
// Category config is computed dynamically inside the component based on DB data
const CATEGORY_DEFS = [
  { id: "all" as Category,        label: "جميع المنتجات",    icon: "✦"  },
  { id: "gifts" as Category,      label: "الهدايا والدزات",  icon: "🎁" },
  { id: "shields" as Category,    label: "الدروع والتكريم",  icon: "🏆" },
  { id: "catering" as Category,   label: "الكيترنج والبوثات",icon: "🍽️" },
  { id: "occasions" as Category,  label: "المناسبات الخاصة", icon: "🎊" },
  { id: "calligraphy" as Category,label: "الخط والنقش",      icon: "✍️" },
];

// ─── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const waMsg = encodeURIComponent(
    `مرحباً مركز بدر 👋\nأريد الاستفسار عن: ${product.name}\nالسعر المذكور: ${product.price}\n\nأرجو التواصل معي.`
  );

  const handleAddToCart = () => {
    if (product.priceValue === 0) return; // contact-for-price items can't be added
    addItem({
      productId: product.id,
      name: product.name,
      price: product.priceValue,
      qty: 1,
      image: product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className="group relative rounded-xl overflow-hidden transition-all duration-500"
      style={{
        background: "#F7F3EC",
        border: hovered ? "1px solid rgba(156,122,60,0.5)" : "1px solid rgba(156,122,60,0.15)",
        boxShadow: hovered ? "0 20px 50px rgba(0,0,0,0.12), 0 0 20px rgba(156,122,60,0.1)" : "0 4px 16px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: "220px" }}>
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
          onError={(e) => {
            (e.target as HTMLImageElement).src = UNSPLASH.giftBox1;
          }}
        />
        {/* Dark overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-300"
          style={{
            background: "linear-gradient(to top, rgba(28,24,16,0.7) 0%, rgba(28,24,16,0.1) 60%, transparent 100%)",
          }}
        />

        {/* Badge */}
        {product.badge && (
          <div
            className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full"
            style={{
              background: product.badgeColor,
              color: product.badgeColor === "#B89050" ? "#2C2416" : "#F7F3EC",
              fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
            }}
          >
            {product.badge}
          </div>
        )}

        {/* Stock indicator */}
        <div className="absolute top-3 left-3">
          <span
            className="text-xs px-2 py-1 rounded-full"
            style={{
              background: product.inStock ? "rgba(22,101,52,0.8)" : "rgba(185,28,28,0.8)",
              color: "#fff",
              fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {product.inStock ? "متوفر" : "نفذ"}
          </span>
        </div>

        {/* Rating stars */}
        <div className="absolute bottom-3 right-3 flex gap-0.5">
          {Array.from({ length: product.rating }).map((_, i) => (
            <Star key={i} size={12} fill="#B89050" color="#B89050" />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{
                background: "rgba(156,122,60,0.1)",
                color: "#B89050",
                border: "1px solid rgba(156,122,60,0.2)",
                fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Name */}
        <h3
          className="font-bold text-lg mb-1 leading-snug"
          style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
        >
          {product.name}
        </h3>
        <p
          className="text-xs mb-3 leading-relaxed line-clamp-2"
          style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
        >
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <span
              className="text-xl font-bold"
              style={{ color: "#B89050", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              {product.price}
            </span>
            {product.priceNote && (
              <p className="text-xs mt-0.5" style={{ color: "#5A4A30", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                {product.priceNote}
              </p>
            )}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex gap-2">
          {product.priceValue > 0 ? (
            <button
              onClick={handleAddToCart}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300"
              style={{
                background: added
                  ? "linear-gradient(135deg, #22c55e, #16a34a)"
                  : hovered
                  ? "linear-gradient(135deg, #B89050, #D4B070)"
                  : "rgba(156,122,60,0.15)",
                color: added ? "#fff" : hovered ? "#2C2416" : "#9C7A3C",
                border: "1px solid rgba(156,122,60,0.4)",
                fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
              }}
            >
              {added ? <Check size={14} /> : <ShoppingCart size={14} />}
              {added ? "تمت الإضافة" : "أضف للسلة"}
            </button>
          ) : (
            <a
              href={`https://wa.me/96522675826?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-300"
              style={{
                background: hovered
                  ? "linear-gradient(135deg, #B89050, #D4B070)"
                  : "rgba(156,122,60,0.15)",
                color: hovered ? "#2C2416" : "#9C7A3C",
                border: "1px solid rgba(156,122,60,0.4)",
                fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
              }}
            >
              <Phone size={14} />
              تواصل للسعر
            </a>
          )}
          <a
            href={`https://wa.me/96522675826?text=${waMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300"
            style={{
              background: "rgba(156,122,60,0.1)",
              border: "1px solid rgba(156,122,60,0.2)",
              color: "#B89050",
            }}
            title="استفسار واتساب"
          >
            <Phone size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

//// ─── Main Catalog Page ────────────────────────────────────────────────────────
export default function Catalog() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc" | "rating">("default");
  const [cartOpen, setCartOpen] = useState(false);
  const { totalItems } = useCart();

  // Fetch products from database
  const { data: dbProducts, isLoading: productsLoading } = trpc.products.list.useQuery();

  // Map DB products to the Product interface
  const allProducts: Product[] = useMemo(() => {
    if (!dbProducts) return [];
    return dbProducts.map((p) => ({
      id: p.id,
      name: p.name,
      nameEn: p.nameEn ?? "",
      category: p.category as Category,
      price: p.price,
      priceValue: Number(p.priceValue ?? 0),
      priceNote: p.priceNote ?? undefined,
      image: p.image,
      badge: p.badge ?? undefined,
      badgeColor: p.badgeColor ?? undefined,
      description: p.description,
      rating: p.rating,
      inStock: p.inStock,
      tags: p.tags ? (() => { try { return JSON.parse(p.tags!); } catch { return []; } })() : [],
    }));
  }, [dbProducts]);

  const filtered = useMemo(() => {
    let result = allProducts;

    // Category filter
    if (activeCategory !== "all") {
      result = result.filter((p) => p.category === activeCategory);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    } else if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => {
        // Items with priceValue=0 ("تواصل للسعر") go to the end
        if (a.priceValue === 0 && b.priceValue === 0) return 0;
        if (a.priceValue === 0) return 1;
        if (b.priceValue === 0) return -1;
        return a.priceValue - b.priceValue;
      });
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => {
        // Items with priceValue=0 ("تواصل للسعر") go to the end
        if (a.priceValue === 0 && b.priceValue === 0) return 0;
        if (a.priceValue === 0) return 1;
        if (b.priceValue === 0) return -1;
        return b.priceValue - a.priceValue;
      });
    }

    return result;
  }, [activeCategory, searchQuery, sortBy, allProducts]);

  // Build category tabs with live counts from DB
  const categories = useMemo(() =>
    CATEGORY_DEFS.map((def) => ({
      ...def,
      count: def.id === "all" ? allProducts.length : allProducts.filter((p) => p.category === def.id).length,
    })),
    [allProducts]
  );

  if (productsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2EDE4" }}>
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-yellow-500 mx-auto mb-4" />
          <p style={{ color: "#A09070", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>جاري تحميل الكتالوج...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F2EDE4", direction: "rtl" }}>
      <AnnouncementBanner />
      <Navbar />

      {/* Hero Banner */}
      <section
        className="relative pt-36 pb-16 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #EDE8DF 0%, #F2EDE4 100%)",
          borderBottom: "1px solid rgba(156,122,60,0.15)",
        }}
      >
        {/* Decorative pattern */}
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, #B89050, transparent)" }} />

        <div className="container mx-auto px-4 relative z-10 text-center">
          <p
            className="text-[#B89050] text-xs tracking-[0.3em] uppercase mb-4"
            style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}
          >
            ✦ BADER CENTER ✦ CATALOG ✦
          </p>
          <h1
            className="text-5xl sm:text-6xl font-bold mb-4"
            style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#2C2416" }}
          >
            كتالوج <span className="gold-shimmer">منتجاتنا</span>
          </h1>
          <div
            className="mx-auto mb-4"
            style={{
              width: "80px",
              height: "2px",
              background: "linear-gradient(to left, transparent, #B89050, transparent)",
            }}
          />
          <p
            className="max-w-xl mx-auto text-lg"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", color: "#6B5E4A" }}
          >
            اكتشف مجموعتنا الفاخرة من الهدايا والدروع والتجهيزات — كل قطعة تحكي قصة
          </p>

          {/* Stats */}
          <div className="flex justify-center gap-12 mt-10">
            {[
              { value: `${allProducts.length}+`, label: "منتج متوفر" },
              { value: "20+", label: "عاماً من الخبرة" },
              { value: "100%", label: "رضا العملاء" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#B89050", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {s.value}
                </div>
                <div
                  className="text-xs mt-1"
                  style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters & Search */}
      <section className="sticky top-[40px] z-40 py-4" style={{ background: "rgba(250,250,248,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(156,122,60,0.15)" }}>
        <div className="container mx-auto px-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                  background: activeCategory === cat.id
                    ? "linear-gradient(135deg, #B89050, #D4B070)"
                    : "rgba(156,122,60,0.08)",
                  color: activeCategory === cat.id ? "#2C2416" : "#6B5E4A",
                  border: activeCategory === cat.id
                    ? "1px solid #B89050"
                    : "1px solid rgba(156,122,60,0.15)",
                  boxShadow: activeCategory === cat.id ? "0 4px 15px rgba(156,122,60,0.3)" : "none",
                }}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    background: activeCategory === cat.id ? "rgba(28,24,16,0.15)" : "rgba(156,122,60,0.12)",
                    color: activeCategory === cat.id ? "#2C2416" : "#9C7A3C",
                  }}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Sort Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute top-1/2 -translate-y-1/2 right-4"
                style={{ color: "#5A4A30" }}
              />
              <input
                type="text"
                placeholder="ابحث عن منتج..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-lg text-sm outline-none transition-all duration-300"
                style={{
                  background: "#F7F3EC",
                  border: "1px solid rgba(156,122,60,0.2)",
                  color: "#2C2416",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <Filter size={14} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: "#5A4A30" }} />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="pr-8 pl-4 py-2.5 rounded-lg text-sm outline-none appearance-none cursor-pointer"
                style={{
                  background: "#F7F3EC",
                  border: "1px solid rgba(156,122,60,0.2)",
                  color: "#6B5E4A",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                <option value="default">الترتيب الافتراضي</option>
                <option value="price-asc">السعر: من الأقل للأعلى</option>
                <option value="price-desc">السعر: من الأعلى للأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results count */}
          <div className="flex items-center justify-between mb-8">
            <p style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", fontSize: "0.875rem" }}>
              يعرض{" "}
              <span style={{ color: "#B89050", fontWeight: "bold" }}>{filtered.length}</span>{" "}
              منتج
              {searchQuery && (
                <span> · نتائج البحث عن "<span style={{ color: "#B89050" }}>{searchQuery}</span>"</span>
              )}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-xs px-3 py-1 rounded-full transition-colors"
                style={{
                  color: "#B89050",
                  border: "1px solid rgba(156,122,60,0.3)",
                  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
                }}
              >
                مسح البحث ✕
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-6">🔍</div>
              <h3
                className="text-2xl font-bold mb-3"
                style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
              >
                لا توجد نتائج
              </h3>
              <p style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                جرب كلمة بحث مختلفة أو اختر فئة أخرى
              </p>
              <button
                onClick={() => { setSearchQuery(""); setActiveCategory("all"); }}
                className="mt-6 btn-gold"
              >
                عرض جميع المنتجات
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div
            className="text-center p-12 rounded-2xl relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FEFCF5 0%, #FFF5D6 100%)",
              border: "1px solid rgba(156,122,60,0.25)",
            }}
          >
            <div className="absolute inset-0 islamic-pattern opacity-20" />
            <div className="relative z-10">
              <p
                className="text-[#B89050] text-xs tracking-widest uppercase mb-4"
                style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}
              >
                ✦ طلب مخصص ✦
              </p>
              <h3
                className="text-3xl sm:text-4xl font-bold mb-4"
                style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
              >
                لم تجد ما تبحث عنه؟
              </h3>
              <p
                className="mb-8 max-w-md mx-auto"
                style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                نصمم ونجهز أي طلب مخصص حسب رؤيتك — تواصل معنا وسنحول فكرتك إلى واقع فاخر
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/request" className="btn-gold inline-flex items-center gap-2 px-8 py-4">
                  <ShoppingBag size={18} />
                  اطلب تصميماً مخصصاً
                </Link>
                <a
                  href="https://wa.me/96522675826"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-gold-outline inline-flex items-center gap-2 px-8 py-4"
                >
                  <Phone size={18} />
                  تواصل مباشرة
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-24 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
          style={{ background: "#2C2416", boxShadow: "0 4px 20px rgba(44,36,22,0.4)" }}
          aria-label="سلة التسوق"
        >
          <ShoppingCart size={24} color="#F7F2E8" />
          <span
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
            style={{ background: "#9C7A3C", color: "#F7F2E8" }}
          >
            {totalItems}
          </span>
        </button>
      )}

      {/* Floating WhatsApp */}
      <a
        href="https://wa.me/96522675826"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{ background: "#25D366", boxShadow: "0 4px 20px rgba(37,211,102,0.4)" }}
        title="تواصل معنا عبر واتساب"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
