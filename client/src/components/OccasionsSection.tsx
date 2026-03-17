/**
 * OccasionsSection - All occasions Bader Center serves
 * Design: Dark Arabian Opulence
 * - Horizontal scrolling cards
 * - Gold hover effects
 */
import { useEffect, useRef, useState } from "react";

const occasions = [
  { icon: "🌙", title: "رمضان الكريم", desc: "دزات وتجهيزات رمضانية فاخرة" },
  { icon: "🎊", title: "قرقيعان", desc: "تجهيزات قرقيعان للأطفال والعائلات" },
  { icon: "🇰🇼", title: "العيد الوطني", desc: "ستاندات وهدايا بالألوان الوطنية" },
  { icon: "🎓", title: "حفلات التخرج", desc: "دروع وهدايا تخرج مميزة" },
  { icon: "👶", title: "المواليد", desc: "صناديق هدايا للمواليد الجدد" },
  { icon: "💒", title: "الأعراس", desc: "تجهيزات أفراح فاخرة متكاملة" },
  { icon: "🏢", title: "الشركات", desc: "هدايا وتكريمات للمؤسسات" },
  { icon: "🏫", title: "المدارس", desc: "دروع وشهادات تقدير للطلاب" },
  { icon: "🎉", title: "أعياد الميلاد", desc: "تجهيزات احتفالية مميزة" },
  { icon: "🤝", title: "الاستقبالات", desc: "بوثات استقبال احترافية" },
];

export default function OccasionsSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="occasions"
      className="py-24 relative overflow-hidden"
      style={{ background: "linear-gradient(180deg, #0D0B08 0%, #130F09 50%, #0D0B08 100%)" }}
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
          <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ مناسباتنا ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            نكون معك في كل مناسبة
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p className="text-[#A09070] max-w-xl mx-auto" style={{ fontFamily: "'Cairo', sans-serif" }}>
            من رمضان إلى الأعراس، من التخرج إلى العيد الوطني — مركز بدر يجهز مناسبتك بأسلوب لا يُنسى
          </p>
        </div>

        {/* Occasions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {occasions.map((occ, i) => (
            <div
              key={occ.title}
              className="group text-center p-6 rounded-lg cursor-pointer transition-all duration-400"
              style={{
                background: "rgba(26,21,16,0.8)",
                border: "1px solid rgba(201,168,76,0.15)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.6s ease ${i * 0.07}s`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.6)";
                (e.currentTarget as HTMLElement).style.background = "rgba(201,168,76,0.05)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-6px)";
                (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 30px rgba(201,168,76,0.1)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,168,76,0.15)";
                (e.currentTarget as HTMLElement).style.background = "rgba(26,21,16,0.8)";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div className="text-4xl mb-3">{occ.icon}</div>
              <h3
                className="text-white font-semibold text-sm mb-2"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {occ.title}
              </h3>
              <p
                className="text-[#7A6A50] text-xs leading-relaxed"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {occ.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
