/**
 * OccasionsSection - All occasions Bader Center serves
 * Design: Light Luxury Theme - White/Gray/Gold
 * Clicking an occasion opens a carousel of photos from the DB.
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { X, ChevronRight, ChevronLeft } from "lucide-react";

const occasions = [
  { key: "catering",      icon: "🍽️", title: "الكيترنج والبوثات",      desc: "تجهيزات كيترنج وبوثات فاخرة" },
  { key: "weddings",      icon: "💍", title: "الدزات والأفراح",      desc: "تجهيزات أفراح فاخرة متكاملة" },
  { key: "schools",       icon: "🏫", title: "المدارس والمعلمات",    desc: "دروع وشهادات تقدير للطلاب" },
  { key: "corporate",     icon: "🏢", title: "الشركات والوزارات",   desc: "هدايا وتكريمات للمؤسسات" },
  { key: "newborn",       icon: "👶", title: "الاستقبال والمواليد",  desc: "صناديق هدايا للمواليد الجدد" },
  { key: "boxes",         icon: "🎁", title: "العلب والصناديق",     desc: "علب وصناديق هدايا فاخرة" },
  { key: "shields",       icon: "🏆", title: "الدروع والهديا",       desc: "دروع تكريم وهدايا فاخرة" },
  { key: "occasions",     icon: "🎉", title: "الأعياد والمناسبات",  desc: "تجهيزات احتفالية مميزة" },
  { key: "printing",      icon: "🖨️", title: "المطبوعات الورقية",   desc: "مطبوعات وبطاقات ومنشورات" },
  { key: "manufacturing", icon: "⚙️", title: "الطباعة والتصنيع",    desc: "تصنيع منتجات مخصصة" },
  { key: "decor",         icon: "🏠", title: "الديكور والنجارة",     desc: "ديكور داخلي وأعمال نجارة" },
];

// ─── Carousel Modal ───────────────────────────────────────────────────────────

type Photo = { id: number; imageUrl: string; caption: string | null };

function CarouselModal({
  occasion,
  photos,
  isLoading,
  onClose,
}: {
  occasion: typeof occasions[0];
  photos: Photo[];
  isLoading: boolean;
  onClose: () => void;
}) {
  const [current, setCurrent] = useState(0);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % photos.length), [photos.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();   // RTL: left = next
      if (e.key === "ArrowRight") prev();  // RTL: right = prev
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, next, prev]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,8,4,0.92)", direction: "rtl" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl mx-4 rounded-2xl overflow-hidden"
        style={{ background: "#1A1510", maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(156,122,60,0.2)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{occasion.icon}</span>
            <h3 className="text-lg font-bold" style={{ color: "#C9A84C", fontFamily: "'Noto Naskh Arabic', serif" }}>
              {occasion.title}
            </h3>
            {!isLoading && (
              <span className="text-sm" style={{ color: "rgba(201,168,76,0.6)" }}>
                ({photos.length} صورة)
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
            style={{ color: "rgba(201,168,76,0.7)" }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#9C7A3C", borderTopColor: "transparent" }} />
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-5xl opacity-30">{occasion.icon}</span>
            <p style={{ color: "rgba(201,168,76,0.5)", fontFamily: "'Noto Naskh Arabic', serif" }}>
              لا توجد صور لهذه المناسبة بعد
            </p>
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Main image */}
            <div className="relative" style={{ height: "60vh" }}>
              <img
                key={current}
                src={photos[current].imageUrl}
                alt={photos[current].caption || occasion.title}
                className="w-full h-full object-contain"
                style={{ animation: "fadeIn 0.3s ease" }}
              />

              {/* Prev / Next arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(156,122,60,0.7)", color: "#FFF" }}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all"
                    style={{ background: "rgba(156,122,60,0.7)", color: "#FFF" }}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Caption */}
              {photos[current].caption && (
                <div
                  className="absolute bottom-0 inset-x-0 px-4 py-3 text-center text-sm"
                  style={{ background: "rgba(0,0,0,0.6)", color: "#E8D5A0", fontFamily: "'Noto Naskh Arabic', serif" }}
                >
                  {photos[current].caption}
                </div>
              )}

              {/* Counter */}
              <div
                className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: "rgba(0,0,0,0.6)", color: "#C9A84C" }}
              >
                {current + 1} / {photos.length}
              </div>
            </div>

            {/* Thumbnails strip */}
            {photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto px-4 py-3" style={{ background: "rgba(0,0,0,0.3)" }}>
                {photos.map((photo, idx) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrent(idx)}
                    className="flex-none w-14 h-14 rounded-lg overflow-hidden transition-all"
                    style={{
                      outline: idx === current ? "2px solid #C9A84C" : "2px solid transparent",
                      opacity: idx === current ? 1 : 0.5,
                    }}
                  >
                    <img src={photo.imageUrl} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}

// ─── Occasions Section ────────────────────────────────────────────────────────

export default function OccasionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<typeof occasions[0] | null>(null);

  // Fetch DB-managed occasions (if any), fall back to static list
  const { data: dbOccasions = [] } = trpc.occasions.list.useQuery();
  const displayOccasions = dbOccasions.length > 0
    ? dbOccasions.map((o) => ({ key: o.key, icon: o.icon, title: o.title, desc: o.desc ?? "" }))
    : occasions;

  // Fetch photos for the selected occasion
  const { data: photos = [], isLoading: photosLoading } = trpc.occasionPhotos.list.useQuery(
    { occasionKey: selectedOccasion?.key },
    { enabled: !!selectedOccasion }
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <section
        id="occasions"
        className="py-24 relative overflow-hidden"
        style={{ background: "#F2EDE4" }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-20" />

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Header */}
          <div
            ref={sectionRef}
            className="text-center mb-16"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s ease",
            }}
          >
            <p className="tracking-[0.4em] uppercase mb-5 font-bold" style={{ color: "#9C7A3C", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", fontStyle: "italic", fontSize: "20px", paddingBottom: "20px" }}>
              ✦ مناسباتنا ✦
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-4"
              style={{ color: "#2C2416", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              نكون معك في كل مناسبة
            </h2>
            <div className="gold-divider max-w-xs mx-auto mb-4" />
            <p className="max-w-xl mx-auto font-bold" style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", fontSize: "14px" }}>
              من رمضان إلى الأعراس، من التخرج إلى العيد الوطني — مركز بدر يجهز مناسبتك بأسلوب لا يُنسى
            </p>
            <p className="mt-3 text-sm" style={{ color: "rgba(156,122,60,0.7)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
              اضغط على أي مناسبة لمشاهدة أعمالنا
            </p>
          </div>

          {/* Occasions Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {occasions.map((occ, i) => (
              <div
                key={occ.title}
                onClick={() => setSelectedOccasion(occ)}
                className="group text-center p-6 rounded-2xl cursor-pointer transition-all duration-400"
                style={{
                  background: "#EDE8DF",
                  border: "1px solid rgba(156,122,60,0.15)",
                  boxShadow: "0 2px 12px rgba(44,36,22,0.04)",
                  opacity: visible ? 1 : 0,
                  transform: visible ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.6s ease ${i * 0.07}s`,
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.45)";
                  (e.currentTarget as HTMLElement).style.background = "#F7F3EC";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(156,122,60,0.12)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.15)";
                  (e.currentTarget as HTMLElement).style.background = "#EDE8DF";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 12px rgba(44,36,22,0.04)";
                }}
              >
                <div className="text-4xl mb-3">{occ.icon}</div>
                <h3
                  className="font-semibold text-sm mb-2"
                  style={{ color: "#2C2416", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {occ.title}
                </h3>
                <p
                  className="text-xs leading-relaxed"
                  style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {occ.desc}
                </p>
                {/* "View photos" hint */}
                <div
                  className="mt-3 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: "#9C7A3C" }}
                >
                  عرض الصور ←
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Carousel Modal */}
      {selectedOccasion && (
        <CarouselModal
          occasion={selectedOccasion}
          photos={photos}
          isLoading={photosLoading}
          onClose={() => setSelectedOccasion(null)}
        />
      )}
    </>
  );
}
