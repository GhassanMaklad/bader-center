/**
 * GallerySection - Product gallery with masonry-like layout
 * Design: Dark Arabian Opulence
 * - Asymmetric grid layout
 * - Gold hover overlays
 */
import { useEffect, useRef, useState } from "react";
import { Instagram } from "lucide-react";

const galleryItems = [
  {
    id: 1,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/hero_bg-eyMGwi7DBgHftcSdbF64dj.webp",
    title: "بوث كيترنج فاخر",
    category: "كيترنج",
    span: "col-span-2 row-span-2",
  },
  {
    id: 2,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/gift_boxes-NpCLrgwJdqygLTXRCzTLnn.webp",
    title: "دزات رمضان",
    category: "هدايا",
    span: "col-span-1 row-span-1",
  },
  {
    id: 3,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/awards_shields-c6WeZyv3bja96LRFojVF75.webp",
    title: "دروع تكريمية",
    category: "تكريمات",
    span: "col-span-1 row-span-1",
  },
  {
    id: 4,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/wedding_reception-YvXqP39owX5C9ma3DBnT9S.webp",
    title: "حفل زفاف فاخر",
    category: "أفراح",
    span: "col-span-2 row-span-1",
  },
  {
    id: 5,
    image: "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/catering_booth-27hdZGhESZb97S94uSah7j.webp",
    title: "ستاند احترافي",
    category: "كيترنج",
    span: "col-span-1 row-span-2",
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
      className={`relative overflow-hidden rounded-lg cursor-pointer ${item.span}`}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "scale(1)" : "scale(0.95)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1}s`,
        minHeight: "200px",
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
            ? "linear-gradient(to top, rgba(13,11,8,0.95) 0%, rgba(13,11,8,0.4) 60%, transparent 100%)"
            : "linear-gradient(to top, rgba(13,11,8,0.7) 0%, transparent 60%)",
        }}
      >
        <span
          className="text-[#C9A84C] text-xs mb-1"
          style={{ fontFamily: "'Cairo', sans-serif" }}
        >
          {item.category}
        </span>
        <h3
          className="text-white font-bold text-sm sm:text-base"
          style={{ fontFamily: "'Amiri', serif" }}
        >
          {item.title}
        </h3>

        {/* Gold border on hover */}
        <div
          className="absolute inset-0 rounded-lg transition-all duration-400"
          style={{
            border: hovered ? "2px solid rgba(201,168,76,0.5)" : "2px solid transparent",
          }}
        />
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
    <section id="gallery" className="py-24 relative" style={{ background: "#0D0B08" }}>
      <div className="absolute inset-0 islamic-pattern opacity-15" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Header */}
        <div
          ref={titleRef}
          className="text-center mb-16"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ معرض أعمالنا ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            لقطات من أعمالنا
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p className="text-[#A09070] max-w-xl mx-auto" style={{ fontFamily: "'Cairo', sans-serif" }}>
            كل صورة تحكي قصة نجاح — شاهد كيف نحول أفكارك إلى واقع فاخر
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-3 grid-rows-3 gap-3 h-[600px] sm:h-[700px]">
          {galleryItems.map((item, i) => (
            <GalleryCard key={item.id} item={item} index={i} />
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="text-center mt-12">
          <a
            href="https://www.instagram.com/badercenterco"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 btn-gold-outline px-8 py-4"
          >
            <Instagram size={20} />
            شاهد المزيد على إنستغرام
          </a>
        </div>
      </div>
    </section>
  );
}
