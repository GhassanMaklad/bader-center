/**
 * HeroSection - Pure Color Luxury Hero
 * Design: Warm Beige Gradient — No background image
 * - Full viewport height with layered gradient
 * - Decorative geometric/Islamic SVG patterns
 * - Gold shimmer text for headline
 * - Animated entrance
 */
import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Link } from "wouter";

export default function HeroSection() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const scrollToServices = () => {
    document.querySelector("#services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #F7F2E8 0%, #EDE8DF 35%, #E4DDD0 65%, #D8D0C0 100%)",
      }}
    >
      {/* Gold top border */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ background: "linear-gradient(to right, transparent, #C9A84C 30%, #9C7A3C 50%, #C9A84C 70%, transparent)" }}
      />

      {/* Decorative large circle — top right */}
      <div
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 50%, transparent 70%)",
        }}
      />

      {/* Decorative large circle — bottom left */}
      <div
        className="absolute -bottom-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(156,122,60,0.1) 0%, rgba(156,122,60,0.03) 50%, transparent 70%)",
        }}
      />

      {/* Islamic pattern overlay */}
      <div className="absolute inset-0 islamic-pattern opacity-30 pointer-events-none" />

      {/* Decorative SVG geometric ornament — top left */}
      <svg
        className="absolute top-16 left-8 opacity-20 pointer-events-none hidden lg:block"
        width="180"
        height="180"
        viewBox="0 0 180 180"
        fill="none"
      >
        <circle cx="90" cy="90" r="80" stroke="#9C7A3C" strokeWidth="1" strokeDasharray="4 6" />
        <circle cx="90" cy="90" r="55" stroke="#C9A84C" strokeWidth="0.8" />
        <circle cx="90" cy="90" r="30" stroke="#9C7A3C" strokeWidth="1" />
        <line x1="90" y1="10" x2="90" y2="170" stroke="#C9A84C" strokeWidth="0.5" />
        <line x1="10" y1="90" x2="170" y2="90" stroke="#C9A84C" strokeWidth="0.5" />
        <line x1="33" y1="33" x2="147" y2="147" stroke="#9C7A3C" strokeWidth="0.5" />
        <line x1="147" y1="33" x2="33" y2="147" stroke="#9C7A3C" strokeWidth="0.5" />
        <polygon points="90,20 105,75 160,75 115,108 130,163 90,130 50,163 65,108 20,75 75,75" stroke="#C9A84C" strokeWidth="0.8" fill="none" />
      </svg>

      {/* Decorative SVG geometric ornament — bottom right */}
      <svg
        className="absolute bottom-20 right-8 opacity-15 pointer-events-none hidden lg:block"
        width="220"
        height="220"
        viewBox="0 0 220 220"
        fill="none"
      >
        <rect x="20" y="20" width="180" height="180" rx="4" stroke="#9C7A3C" strokeWidth="1" strokeDasharray="3 5" />
        <rect x="45" y="45" width="130" height="130" rx="2" stroke="#C9A84C" strokeWidth="0.8" transform="rotate(45 110 110)" />
        <circle cx="110" cy="110" r="50" stroke="#9C7A3C" strokeWidth="0.8" />
        <circle cx="110" cy="110" r="25" stroke="#C9A84C" strokeWidth="1" />
        <circle cx="110" cy="110" r="5" fill="#C9A84C" opacity="0.5" />
      </svg>

      {/* Thin vertical gold lines — decorative */}
      <div
        className="absolute top-0 bottom-0 left-1/4 w-px pointer-events-none hidden xl:block"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.15) 70%, transparent)" }}
      />
      <div
        className="absolute top-0 bottom-0 right-1/4 w-px pointer-events-none hidden xl:block"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(201,168,76,0.15) 30%, rgba(201,168,76,0.15) 70%, transparent)" }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-4 max-w-5xl mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(40px)",
          transition: "all 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Tagline */}
        <p
          className="text-xs tracking-[0.45em] uppercase mb-6 font-medium"
          style={{
            color: "#9C7A3C",
            fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
            fontStyle: "italic",
          }}
        >
          ✦ Bader Center ✦ Kuwait ✦ Since 2004 ✦
        </p>

        {/* Main Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-8xl font-bold mb-6"
          style={{ fontFamily: "'Noto Naskh Arabic', serif", lineHeight: "1.2", letterSpacing: "-0.02em" }}
        >
          <span className="gold-shimmer">للفخامة</span>
          <br />
          <span style={{ color: "#2C2416" }}>أصول</span>
        </h1>

        {/* Sub headline */}
        <p
          className="text-xl sm:text-2xl mb-4"
          style={{
            color: "#4A3F2F",
            fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
            fontWeight: 300,
            letterSpacing: "0.02em",
          }}
        >
          نجسدها منذ <span className="font-semibold" style={{ color: "#9C7A3C" }}>20 عاماً</span>
        </p>

        {/* Description */}
        <p
          className="text-base sm:text-lg max-w-2xl mx-auto mb-12 leading-relaxed"
          style={{
            color: "#5A4E3A",
            fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.5s ease 0.4s",
          }}
        >
          تجهيزات الكيترنج والبوثات · استقبالات وأفراح · دروع وتكريمات فاخرة
          <br />
          توصيل لجميع مناطق الكويت
        </p>

        {/* CTAs */}
        <div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1.5s ease 0.6s",
          }}
        >
          <Link
            href="/request"
            className="btn-gold text-base px-8 py-4 flex items-center gap-2"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            اطلب الآن
          </Link>
          <button
            onClick={scrollToServices}
            className="btn-gold-outline text-base px-8 py-4"
          >
            اكتشف خدماتنا
          </button>
        </div>

        {/* Stats */}
        <div
          className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1.5s ease 0.8s",
          }}
        >
          {[
            { num: "+20", label: "عاماً من الخبرة" },
            { num: "+19K", label: "متابع على إنستغرام" },
            { num: "100%", label: "رضا العملاء" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="inline-block px-4 py-2 rounded-xl mb-1"
                style={{
                  background: "rgba(255,252,245,0.85)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 2px 16px rgba(44,36,22,0.08), 0 0 0 1px rgba(201,168,76,0.15)",
                }}
              >
                <p
                  className="text-2xl sm:text-3xl font-bold"
                  style={{ color: "#9C7A3C", fontFamily: "'Noto Naskh Arabic', serif" }}
                >
                  {stat.num}
                </p>
              </div>
              <p
                className="text-xs mt-1 font-medium"
                style={{ color: "#4A3F2F", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <button
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        style={{ color: "#9C7A3C" }}
      >
        <ChevronDown size={32} />
      </button>

      {/* Bottom gradient fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-24"
        style={{ background: "linear-gradient(to bottom, transparent, #EDE8DF)" }}
      />
    </section>
  );
}
