/**
 * AnnouncementBanner - Dynamic animated seasonal offers ticker
 * Loads announcements from DB via tRPC; falls back to hardcoded offers if DB is empty.
 * Design: Warm Beige / Greige Luxury Theme
 */
import { useState } from "react";
import { X, Star } from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

// Fallback static offers shown while loading or if DB is empty
const FALLBACK_OFFERS = [
  { icon: "🌙", text: "عروض رمضان الكريم — دزات وبوكسات فاخرة بأسعار مميزة", cta: "اطلب الآن", ctaLink: "/request" },
  { icon: "🇰🇼", text: "العيد الوطني الكويتي — ستاندات وهدايا بالألوان الوطنية جاهزة للتوصيل", cta: "اكتشف", ctaLink: "/request" },
  { icon: "🎊", text: "قرقيعان 2026 — تجهيزات احتفالية مميزة للأطفال والعائلات", cta: "اطلب", ctaLink: "/request" },
  { icon: "✨", text: "خدمة التوصيل لجميع مناطق الكويت — اطلب الآن وسنوصل لك", cta: "اطلب", ctaLink: "/request" },
  { icon: "🏆", text: "دروع وتكريمات فاخرة للشركات والمدارس — تصاميم حصرية بنقش ليزر", cta: "تواصل", ctaLink: "/request" },
  { icon: "🎁", text: "هدايا الأفراح والاستقبالات — تصميم مخصص حسب طلبك", cta: "اطلب", ctaLink: "/request" },
  { icon: "⭐", text: "أكثر من 20 عاماً من الخبرة في تجهيز المناسبات الفاخرة بالكويت", cta: "", ctaLink: "/request" },
];

export default function AnnouncementBanner() {
  const [dismissed, setDismissed] = useState(false);

  const { data: dbAnnouncements } = trpc.announcements.listActive.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // cache for 5 minutes
  });

  if (dismissed) return null;

  // Use DB announcements if available, otherwise fall back to hardcoded
  const offers =
    dbAnnouncements && dbAnnouncements.length > 0
      ? dbAnnouncements.map((a) => ({ icon: a.icon, text: a.text, cta: a.cta, ctaLink: a.ctaLink }))
      : FALLBACK_OFFERS;

  // Duplicate for seamless infinite loop
  const allOffers = [...offers, ...offers, ...offers];

  return (
    <div
      data-banner="true"
      className="relative z-[60] overflow-hidden"
      style={{
        background: "#2C2416",
        borderBottom: "1px solid rgba(184,144,80,0.3)",
        height: "40px",
      }}
    >
      {/* Left fade */}
      <div
        className="absolute top-0 bottom-0 left-0 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #2C2416, transparent)" }}
      />

      {/* Right fade — leave space for close button */}
      <div
        className="absolute top-0 bottom-0 right-10 w-20 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #2C2416, transparent)" }}
      />

      {/* Scrolling track */}
      <div
        className="flex items-center h-full"
        style={{
          animation: "marqueeRTL 60s linear infinite",
          whiteSpace: "nowrap",
          willChange: "transform",
        }}
      >
        {allOffers.map((offer, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 px-8"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
          >
            <span className="text-base leading-none">{offer.icon}</span>
            <span
              className="text-sm font-semibold"
              style={{ color: "#D4C9B0" }}
            >
              {offer.text}
            </span>
            {offer.cta && (
              <Link
                href={offer.ctaLink || "/request"}
                className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full transition-all duration-200 hover:opacity-80"
                style={{
                  background: "rgba(212,192,160,0.15)",
                  color: "#D4C9B0",
                  border: "1px solid rgba(212,192,160,0.35)",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {offer.cta} ←
              </Link>
            )}
            <Star size={8} className="opacity-40" style={{ color: "#B89050" }} />
            <Star size={8} className="opacity-40" style={{ color: "#B89050" }} />
            <Star size={8} className="opacity-40" style={{ color: "#B89050" }} />
          </span>
        ))}
      </div>

      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-0 bottom-0 left-0 w-10 flex items-center justify-center z-20 transition-opacity duration-200 hover:opacity-70"
        style={{ color: "#D4C9B0" }}
        aria-label="إغلاق الشريط"
      >
        <X size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
