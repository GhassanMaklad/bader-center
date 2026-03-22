/**
 * GallerySection - Product gallery with masonry-like layout
 * Design: Light Luxury Theme - White/Gray/Gold
 * - Real Instagram images from @badercenterco
 */
import { useEffect, useRef, useState } from "react";
import { Instagram, ExternalLink } from "lucide-react";

// 9 unique real images from @badercenterco Instagram
const galleryItems = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_dazza_display_d7fb14b3.webp",
    title: "دزة تبيض الوجه",
    category: "هدايا فاخرة",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_qargian_2026_532a544d.webp",
    title: "هبّة رمضان — مركز بدر",
    category: "رمضان",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_eid_engraving_8226a40e.jpg",
    title: "عيدية تبيض الوجه",
    category: "أعياد",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_booth_stand_9df82cbf.jpg",
    title: "تجهيزات العيد الوطني",
    category: "مناسبات وطنية",
    span: "col-span-2 row-span-1",
  },
  {
    id: 5,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product11_44420043.jpg",
    title: "لوحة خط عربي بالخيوط",
    category: "تكريمات",
    span: "col-span-1 row-span-2",
  },
  {
    id: 6,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product12_9825ec48.jpg",
    title: "فنتك قرقيعان 2026",
    category: "قرقيعان",
    span: "col-span-1 row-span-1",
  },
  {
    id: 7,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_product10_0d86d336.jpg",
    title: "شغل يبيض الوجه — KNPC",
    category: "شركات",
    span: "col-span-1 row-span-1",
  },
  {
    id: 8,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_post_boxes_12e0ff8e.jpg",
    title: "بوكسات براندك الفاخرة",
    category: "تغليف مخصص",
    span: "col-span-1 row-span-1",
  },
  {
    id: 9,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/ig_booth_stand_79e2e9ef.webp",
    title: "بوث كيترنج احترافي",
    category: "كيترنج",
    span: "col-span-1 row-span-1",
  },
];

function GalleryCard({ item, index }: { item: typeof galleryItems[0]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-2xl cursor-pointer ${item.span}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s`,
        minHeight: "180px",
        boxShadow: hovered ? "0 8px 30px rgba(156,122,60,0.25)" : "0 2px 12px rgba(0,0,0,0.08)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={item.image}
        alt={item.title}
        className="w-full h-full object-cover transition-transform duration-700"
        style={{ transform: hovered ? "scale(1.08)" : "scale(1)" }}
      />

      {/* Overlay */}
      <div
        className="absolute inset-0 flex flex-col justify-end p-4 transition-all duration-400"
        style={{
          background: hovered
            ? "linear-gradient(to top, rgba(28,24,16,0.92) 0%, rgba(28,24,16,0.3) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(28,24,16,0.65) 0%, transparent 60%)",
        }}
      >
        <span
          className="text-xs mb-1 tracking-wider font-semibold"
          style={{ color: "#D4B070", fontFamily: "'Cairo', sans-serif" }}
        >
          {item.category}
        </span>
        <div className="flex items-center justify-between gap-2">
          <h3
            className="text-white font-bold text-sm sm:text-base leading-snug"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            {item.title}
          </h3>
          {hovered && (
            <a
              href="https://www.instagram.com/badercenterco"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#D4B070] hover:text-white transition-colors flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        {/* Gold border on hover */}
        <div
          className="absolute inset-0 rounded-2xl transition-all duration-400 pointer-events-none"
          style={{
            border: hovered ? "2px solid rgba(156,122,60,0.7)" : "2px solid transparent",
          }}
        />
      </div>

      {/* Instagram badge */}
      <div
        className="absolute top-3 right-3 transition-all duration-300"
        style={{ opacity: hovered ? 1 : 0, transform: hovered ? "scale(1)" : "scale(0.8)" }}
      >
        <div className="bg-white/80 backdrop-blur-sm rounded-full p-1.5 shadow-sm">
          <Instagram size={12} style={{ color: "#9C7A3C" }} />
        </div>
      </div>
    </div>
  );
}

export default function GallerySection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true); },
      { threshold: 0.1 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="gallery" className="py-24 relative" style={{ background: "#EDE8DF" }}>
      <div className="absolute inset-0 islamic-pattern opacity-15" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={titleRef}
          className="text-center mb-12"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style={{ color: "#9C7A3C", fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ من حساب الإنستغرام ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "#2C2416", fontFamily: "'Amiri', serif" }}
          >
            معرض أعمالنا الحقيقية
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p className="max-w-xl mx-auto" style={{ color: "#6B5E4A", fontFamily: "'Cairo', sans-serif" }}>
            صور حقيقية من أعمالنا على إنستغرام — كل صورة تحكي قصة نجاح
          </p>

          {/* Instagram handle badge */}
          <a
            href="https://www.instagram.com/badercenterco"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 transition-colors text-sm"
            style={{ color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}
          >
            <Instagram size={16} />
            <span>@badercenterco</span>
            <span style={{ color: "#8A7560" }}>· 19.7K متابع</span>
          </a>
        </div>

        {/* Gallery Grid - 5 items in asymmetric layout */}
        <div
          className="grid gap-3 mb-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 230px)",
          }}
        >
          {galleryItems.slice(0, 5).map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Gallery Grid - 4 items in equal columns */}
        <div
          className="grid gap-3"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "230px",
          }}
        >
          {galleryItems.slice(5).map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i + 5} />
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/badercenterco"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 btn-gold px-8 py-4"
          >
            <Instagram size={20} />
            شاهد المزيد على إنستغرام
          </a>
          <p className="text-sm mt-3" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
            أكثر من 2,767 منشور على حسابنا
          </p>
        </div>
      </div>
    </section>
  );
}
