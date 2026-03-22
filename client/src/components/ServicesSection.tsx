/**
 * ServicesSection - Light Luxury services grid
 * Design: White/Gray/Gold Elegance
 */
import { useEffect, useRef, useState } from "react";

const CATERING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/catering_booth-27hdZGhESZb97S94uSah7j.webp";
const GIFT_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/gift_boxes-NpCLrgwJdqygLTXRCzTLnn.webp";
const AWARDS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/awards_shields-c6WeZyv3bja96LRFojVF75.webp";
const WEDDING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/wedding_reception-YvXqP39owX5C9ma3DBnT9S.webp";

const services = [
  {
    id: 1,
    icon: "🍽️",
    title: "تجهيزات الكيترنج والبوثات",
    description: "بوثات وستاندات مميزة لمناسباتك، مصممة بأعلى معايير الجودة والأناقة لتعكس هوية علامتك التجارية",
    image: CATERING_IMG,
    features: ["تصميم حسب الطلب", "خشب وأكريليك فاخر", "إضاءة LED احترافية"],
  },
  {
    id: 2,
    icon: "🎁",
    title: "دزات وهدايا المناسبات",
    description: "صناديق هدايا فاخرة لجميع المناسبات — رمضان، العيد، قرقيعان، تخرج، مواليد وأكثر",
    image: GIFT_IMG,
    features: ["تصميم مخصص", "طباعة احترافية", "توصيل لجميع المناطق"],
  },
  {
    id: 3,
    icon: "🏆",
    title: "دروع وتكريمات فاخرة",
    description: "دروع وشهادات تكريم فاخرة للشركات والمدارس والمناسبات الرسمية، بتصاميم أنيقة وخامات راقية",
    image: AWARDS_IMG,
    features: ["كريستال وأكريليك", "نقش ليزر دقيق", "تصاميم حصرية"],
  },
  {
    id: 4,
    icon: "💍",
    title: "استقبالات وأفراح",
    description: "تجهيزات كاملة لحفلات الأعراس والاستقبالات، من الديكور إلى الكيترنج بلمسة فخامة لا تُنسى",
    image: WEDDING_IMG,
    features: ["ديكور متكامل", "كيترنج فاخر", "تنسيق احترافي"],
  },
];

function ServiceCard({ service, index }: { service: typeof services[0]; index: number }) {
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
      className="rounded-2xl overflow-hidden group"
      style={{
        background: "#F7F3EC",
        border: "1px solid rgba(156,122,60,0.15)",
        boxShadow: "0 4px 24px rgba(44,36,22,0.06)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transition: `all 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.15}s`,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 40px rgba(156,122,60,0.18)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.4)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(44,36,22,0.06)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(156,122,60,0.15)"; }}
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={service.image}
          alt={service.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, rgba(247,243,236,0.95) 100%)" }} />
        <div className="absolute top-4 right-4 text-3xl bg-white/80 rounded-full w-12 h-12 flex items-center justify-center shadow-sm">
          {service.icon}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="text-lg font-semibold mb-3"
          style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif", borderBottom: "1.5px solid rgba(156,122,60,0.5)", paddingBottom: "8px", display: "inline-block", letterSpacing: "0.01em" }}
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
              style={{ background: "rgba(156,122,60,0.08)", color: "#7A5C28", border: "1px solid rgba(156,122,60,0.25)", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
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
          <p className="text-xs tracking-[0.4em] uppercase mb-4 font-normal" style={{ color: "#9C7A3C", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            Our Services
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif", letterSpacing: "-0.01em", lineHeight: "1.3" }}
          >
            ما نقدمه لك
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p className="max-w-xl mx-auto" style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
            نقدم خدمات متكاملة لجميع مناسباتك بأعلى معايير الجودة والفخامة
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
