/**
 * ServicesSection - Icon-based luxury service cards
 * Design: Warm Beige / Greige with colored gradient backgrounds and SVG icons
 */
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

// SVG icons for each service - expressive and elegant
const CateringIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Booth / Stand structure */}
    <rect x="10" y="48" width="60" height="6" rx="2" fill="currentColor" opacity="0.9"/>
    <rect x="14" y="54" width="4" height="16" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="62" y="54" width="4" height="16" rx="1" fill="currentColor" opacity="0.7"/>
    {/* Counter top */}
    <rect x="8" y="44" width="64" height="6" rx="3" fill="currentColor"/>
    {/* Arch / backdrop */}
    <path d="M20 44 Q20 18 40 14 Q60 18 60 44" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.6"/>
    {/* Decorative arch detail */}
    <path d="M26 44 Q26 24 40 20 Q54 24 54 44" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.35"/>
    {/* Serving dishes on counter */}
    <ellipse cx="30" cy="43" rx="7" ry="2.5" fill="currentColor" opacity="0.5"/>
    <ellipse cx="30" cy="41.5" rx="5" ry="2" fill="currentColor" opacity="0.7"/>
    {/* Dome lid */}
    <path d="M25 41.5 Q30 36 35 41.5" fill="currentColor" opacity="0.5"/>
    <ellipse cx="50" cy="43" rx="7" ry="2.5" fill="currentColor" opacity="0.5"/>
    <ellipse cx="50" cy="41.5" rx="5" ry="2" fill="currentColor" opacity="0.7"/>
    <path d="M45 41.5 Q50 36 55 41.5" fill="currentColor" opacity="0.5"/>
    {/* LED light strip */}
    <rect x="10" y="47" width="60" height="1.5" rx="0.75" fill="currentColor" opacity="0.4"/>
    {/* Stars/sparkles */}
    <circle cx="40" cy="10" r="1.5" fill="currentColor" opacity="0.5"/>
    <circle cx="34" cy="8" r="1" fill="currentColor" opacity="0.35"/>
    <circle cx="46" cy="8" r="1" fill="currentColor" opacity="0.35"/>
  </svg>
);

const GiftIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Gift box base */}
    <rect x="14" y="38" width="52" height="30" rx="3" fill="currentColor" opacity="0.85"/>
    {/* Gift box lid */}
    <rect x="12" y="30" width="56" height="10" rx="3" fill="currentColor"/>
    {/* Ribbon vertical */}
    <rect x="37" y="30" width="6" height="38" rx="1" fill="white" opacity="0.35"/>
    {/* Ribbon horizontal on lid */}
    <rect x="12" y="33" width="56" height="4" rx="1" fill="white" opacity="0.35"/>
    {/* Bow left loop */}
    <path d="M40 30 Q28 20 26 26 Q24 32 40 30" fill="currentColor" opacity="0.7"/>
    {/* Bow right loop */}
    <path d="M40 30 Q52 20 54 26 Q56 32 40 30" fill="currentColor" opacity="0.7"/>
    {/* Bow center knot */}
    <circle cx="40" cy="30" r="4" fill="currentColor"/>
    {/* Decorative pattern on box */}
    <rect x="20" y="44" width="12" height="2" rx="1" fill="white" opacity="0.2"/>
    <rect x="20" y="49" width="18" height="2" rx="1" fill="white" opacity="0.2"/>
    <rect x="20" y="54" width="12" height="2" rx="1" fill="white" opacity="0.2"/>
    {/* Stars */}
    <circle cx="62" cy="20" r="2" fill="currentColor" opacity="0.4"/>
    <circle cx="18" cy="22" r="1.5" fill="currentColor" opacity="0.35"/>
    <circle cx="66" cy="28" r="1" fill="currentColor" opacity="0.3"/>
  </svg>
);

const AwardsIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Shield shape */}
    <path d="M40 8 L62 18 L62 42 Q62 60 40 70 Q18 60 18 42 L18 18 Z" fill="currentColor" opacity="0.85"/>
    {/* Shield inner border */}
    <path d="M40 14 L57 22 L57 42 Q57 56 40 64 Q23 56 23 42 L23 22 Z" fill="none" stroke="white" strokeWidth="1.5" opacity="0.35"/>
    {/* Star in center */}
    <path d="M40 26 L42.4 33.2 L50 33.2 L44 37.6 L46.4 44.8 L40 40.4 L33.6 44.8 L36 37.6 L30 33.2 L37.6 33.2 Z" fill="white" opacity="0.9"/>
    {/* Decorative leaves/laurel */}
    <path d="M22 50 Q18 44 22 40 Q26 44 22 50Z" fill="currentColor" opacity="0.5"/>
    <path d="M58 50 Q62 44 58 40 Q54 44 58 50Z" fill="currentColor" opacity="0.5"/>
    {/* Base pedestal */}
    <rect x="34" y="70" width="12" height="4" rx="1" fill="currentColor" opacity="0.6"/>
    <rect x="30" y="73" width="20" height="3" rx="1.5" fill="currentColor" opacity="0.7"/>
    {/* Sparkles */}
    <path d="M14 20 L15 17 L16 20 L19 21 L16 22 L15 25 L14 22 L11 21 Z" fill="currentColor" opacity="0.45"/>
    <path d="M64 14 L65 12 L66 14 L68 15 L66 16 L65 18 L64 16 L62 15 Z" fill="currentColor" opacity="0.4"/>
  </svg>
);

const WeddingIcon = () => (
  <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
    {/* Floral arch left */}
    <path d="M16 70 Q10 50 14 30 Q18 20 24 18" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
    {/* Floral arch right */}
    <path d="M64 70 Q70 50 66 30 Q62 20 56 18" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
    {/* Top arch */}
    <path d="M24 18 Q40 8 56 18" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round"/>
    {/* Flowers on arch */}
    <circle cx="14" cy="30" r="4" fill="currentColor" opacity="0.6"/>
    <circle cx="12" cy="22" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="66" cy="30" r="4" fill="currentColor" opacity="0.6"/>
    <circle cx="68" cy="22" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="40" cy="9" r="4" fill="currentColor" opacity="0.6"/>
    <circle cx="32" cy="12" r="3" fill="currentColor" opacity="0.5"/>
    <circle cx="48" cy="12" r="3" fill="currentColor" opacity="0.5"/>
    {/* Flower petals top */}
    <circle cx="40" cy="6" r="2" fill="currentColor" opacity="0.4"/>
    <circle cx="37" cy="7" r="2" fill="currentColor" opacity="0.4"/>
    <circle cx="43" cy="7" r="2" fill="currentColor" opacity="0.4"/>
    {/* Candelabra center */}
    <rect x="38" y="42" width="4" height="20" rx="1" fill="currentColor" opacity="0.8"/>
    <rect x="32" y="38" width="16" height="2" rx="1" fill="currentColor" opacity="0.6"/>
    {/* Candles */}
    <rect x="33" y="30" width="3" height="10" rx="1" fill="currentColor" opacity="0.7"/>
    <rect x="39" y="26" width="3" height="14" rx="1" fill="currentColor" opacity="0.9"/>
    <rect x="45" y="30" width="3" height="10" rx="1" fill="currentColor" opacity="0.7"/>
    {/* Flames */}
    <ellipse cx="34.5" cy="29" rx="1.5" ry="2.5" fill="white" opacity="0.8"/>
    <ellipse cx="40.5" cy="25" rx="1.5" ry="2.5" fill="white" opacity="0.8"/>
    <ellipse cx="46.5" cy="29" rx="1.5" ry="2.5" fill="white" opacity="0.8"/>
    {/* Table */}
    <rect x="20" y="62" width="40" height="4" rx="2" fill="currentColor" opacity="0.6"/>
    <rect x="24" y="66" width="4" height="8" rx="1" fill="currentColor" opacity="0.5"/>
    <rect x="52" y="66" width="4" height="8" rx="1" fill="currentColor" opacity="0.5"/>
  </svg>
);

const services = [
  {
    id: 1,
    title: "تجهيزات الكيترنج والبوثات",
    description: "بوثات وستاندات مميزة لمناسباتك، مصممة بأعلى معايير الجودة والأناقة لتعكس هوية علامتك التجارية",
    features: ["تصميم حسب الطلب", "خشب وأكريليك فاخر", "إضاءة LED احترافية"],
    // Warm terracotta / amber gradient
    bgGradient: "linear-gradient(135deg, #C4956A 0%, #A67850 40%, #8B5E35 100%)",
    iconColor: "#F5E6D0",
    accentColor: "#F0D5B0",
    Icon: CateringIcon,
  },
  {
    id: 2,
    title: "دزات وهدايا المناسبات",
    description: "صناديق هدايا فاخرة لجميع المناسبات — رمضان، العيد، قرقيعان، تخرج، مواليد وأكثر",
    features: ["تصميم مخصص", "طباعة احترافية", "توصيل لجميع المناطق"],
    // Deep sage / olive green gradient
    bgGradient: "linear-gradient(135deg, #7A9E7E 0%, #5C7E60 40%, #3E5E42 100%)",
    iconColor: "#D8EDD8",
    accentColor: "#B8D8BA",
    Icon: GiftIcon,
  },
  {
    id: 3,
    title: "دروع وتكريمات فاخرة",
    description: "دروع وشهادات تكريم فاخرة للشركات والمدارس والمناسبات الرسمية، بتصاميم أنيقة وخامات راقية",
    features: ["كريستال وأكريليك", "نقش ليزر دقيق", "تصاميم حصرية"],
    // Rich warm gold / dark brown gradient
    bgGradient: "linear-gradient(135deg, #B89050 0%, #9C7A3C 40%, #7A5C28 100%)",
    iconColor: "#FFF3D0",
    accentColor: "#F5E0A0",
    Icon: AwardsIcon,
  },
  {
    id: 4,
    title: "استقبالات وأفراح",
    description: "تجهيزات كاملة لحفلات الأعراس والاستقبالات، من الديكور إلى الكيترنج بلمسة فخامة لا تُنسى",
    features: ["ديكور متكامل", "كيترنج فاخر", "تنسيق احترافي"],
    // Dusty rose / mauve gradient
    bgGradient: "linear-gradient(135deg, #C4909A 0%, #A87080 40%, #8B5060 100%)",
    iconColor: "#F5E0E5",
    accentColor: "#EAC5CC",
    Icon: WeddingIcon,
  },
];

type ServiceItem = typeof services[0] & { image?: string | null };

function ServiceCard({ service, index }: { service: ServiceItem; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

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
      className="rounded-2xl overflow-hidden group cursor-pointer"
      style={{
        background: "#F7F3EC",
        border: "1px solid rgba(156,122,60,0.15)",
        boxShadow: hovered ? "0 12px 48px rgba(44,36,22,0.14)" : "0 4px 24px rgba(44,36,22,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? (hovered ? "translateY(-6px)" : "translateY(0)") : "translateY(40px)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`,
        borderColor: hovered ? "rgba(156,122,60,0.35)" : "rgba(156,122,60,0.15)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Colored icon panel */}
      <div
        className="relative h-52 flex items-center justify-center overflow-hidden"
        style={{ background: service.bgGradient }}
      >
        {/* Subtle geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 80%, white 1px, transparent 1px),
                              radial-gradient(circle at 80% 20%, white 1px, transparent 1px),
                              radial-gradient(circle at 50% 50%, white 0.5px, transparent 0.5px)`,
            backgroundSize: "30px 30px, 25px 25px, 15px 15px",
          }}
        />
        {/* Corner decorative lines */}
        <div className="absolute top-4 right-4 w-8 h-8 opacity-30" style={{ borderTop: `2px solid ${service.accentColor}`, borderRight: `2px solid ${service.accentColor}` }} />
        <div className="absolute bottom-4 left-4 w-8 h-8 opacity-30" style={{ borderBottom: `2px solid ${service.accentColor}`, borderLeft: `2px solid ${service.accentColor}` }} />

        {/* Image or SVG Icon */}
        {service.image ? (
          <img
            src={service.image}
            alt={service.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="relative z-10 w-28 h-28 transition-transform duration-500 group-hover:scale-110"
            style={{ color: service.iconColor }}
          >
            <service.Icon />
          </div>
        )}

        {/* Bottom fade to card background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8"
          style={{ background: "linear-gradient(to bottom, transparent, rgba(247,243,236,0.15))" }}
        />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="text-lg font-semibold mb-3"
          style={{
            color: "#2C2416",
            fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
            borderBottom: "1.5px solid rgba(156,122,60,0.4)",
            paddingBottom: "8px",
            display: "inline-block",
            letterSpacing: "0.01em",
          }}
        >
          {service.title}
        </h3>
        <p
          className="text-sm leading-loose mb-4 mt-3"
          style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
        >
          {service.description}
        </p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-5">
          {service.features.map((f) => (
            <span
              key={f}
              className="text-xs px-3 py-1 rounded-full font-medium"
              style={{
                background: "rgba(156,122,60,0.08)",
                color: "#7A5C28",
                border: "1px solid rgba(156,122,60,0.25)",
                fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
              }}
            >
              {f}
            </span>
          ))}
        </div>

        <a
          href="https://wa.me/96522675826"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-gold text-sm w-full block text-center"
        >
          اطلب الآن
        </a>
      </div>
    </div>
  );
}

export default function ServicesSection() {
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const { data: dbCards } = trpc.services.list.useQuery();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setTitleVisible(true); },
      { threshold: 0.1 }
    );
    if (titleRef.current) observer.observe(titleRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="services" className="py-24 relative" style={{ background: "#EDE8DF" }}>
      {/* Islamic pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-25" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <div
          ref={titleRef}
          className="text-center mb-16"
          style={{
            opacity: titleVisible ? 1 : 0,
            transform: titleVisible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <p
            className="tracking-[0.4em] uppercase mb-4 font-bold"
            style={{ color: "#9C7A3C", fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "20px" }}
          >
            Our Services
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif", letterSpacing: "-0.01em", lineHeight: "1.3" }}
          >
            خدماتنا
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p
            className="max-w-xl mx-auto font-bold"
            style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", fontSize: "20px" }}
          >
            نقدم خدمات متكاملة لجميع مناسباتك بأعلى معايير الجودة والفخامة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(dbCards && dbCards.length > 0 ? dbCards.map((card: any) => ({
            id: card.id,
            title: card.title,
            description: card.description,
            features: (() => { try { return JSON.parse(card.features); } catch { return []; } })(),
            bgGradient: card.bgGradient,
            iconColor: card.iconColor,
            accentColor: card.accentColor,
            image: card.image || null,
            Icon: GiftIcon, // default icon for DB items (shown only if no image)
          })) : services).map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
