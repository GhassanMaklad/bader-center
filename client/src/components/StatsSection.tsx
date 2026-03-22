/**
 * StatsSection - Numbers and testimonials
 * Design: Light Luxury Theme - White/Gray/Gold
 */
import { useEffect, useRef, useState } from "react";

const stats = [
  { num: "+20", label: "عاماً من الخبرة", icon: "⭐" },
  { num: "+2,767", label: "منشور على إنستغرام", icon: "📸" },
  { num: "+19K", label: "متابع على إنستغرام", icon: "👥" },
  { num: "100%", label: "توصيل لجميع مناطق الكويت", icon: "🚚" },
];

const testimonials = [
  {
    text: "مركز بدر غير مفهوم الفخامة عندي. البوث اللي جهزوه لحفل شركتي كان أحلى من توقعاتي بكثير!",
    name: "أحمد الكندري",
    role: "صاحب شركة",
  },
  {
    text: "الدزة اللي طلبتها لرمضان كانت تحفة فنية. كل من شافها انبهر بالتصميم والجودة.",
    name: "نورة العنزي",
    role: "عميلة",
  },
  {
    text: "دروع التكريم اللي طلبناها للمدرسة كانت راقية جداً. الطلاب والمعلمون أُعجبوا بها كثيراً.",
    name: "مديرة مدرسة",
    role: "قطاع التعليم",
  },
];

export default function StatsSection() {
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
    <section
      className="py-24 relative overflow-hidden"
      style={{ background: "#F7F3EC" }}
    >
      {/* Subtle gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #B89050 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 islamic-pattern opacity-15" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        {/* Stats */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-2xl"
              style={{
                background: "linear-gradient(135deg, #FEFCF5 0%, #FFF9EC 100%)",
                border: "1px solid rgba(156,122,60,0.2)",
                boxShadow: "0 4px 20px rgba(156,122,60,0.08)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.8s ease ${i * 0.15}s`,
              }}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <span className="gold-shimmer text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
                {stat.num}
              </span>
              <p
                className="text-sm mt-2"
                style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div
          className="text-center mb-12"
          style={{
            opacity: visible ? 1 : 0,
            transition: "all 0.8s ease 0.4s",
          }}
        >
          <p className="text-xs tracking-[0.4em] uppercase mb-4 font-normal" style={{ color: "#9C7A3C", fontFamily: "'Playfair Display', serif", fontStyle: "italic" }}>
            ✦ آراء عملائنا ✦
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold"
            style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
          >
            ماذا يقول عملاؤنا
          </h2>
          <div className="gold-divider max-w-xs mx-auto mt-4" />
        </div>

        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease 0.6s",
          }}
        >
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 relative"
              style={{
                background: "#F2EDE4",
                border: "1px solid rgba(156,122,60,0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              {/* Quote mark */}
              <div
                className="text-6xl leading-none mb-4 opacity-40"
                style={{ color: "#B89050", fontFamily: "'Noto Naskh Arabic', serif" }}
              >
                "
              </div>
              <p
                className="text-sm leading-loose mb-6"
                style={{ color: "#6B5E4A", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
              >
                {t.text}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold"
                  style={{ background: "rgba(156,122,60,0.1)", border: "1px solid rgba(156,122,60,0.3)", color: "#9C7A3C" }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "#2C2416", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                    {t.name}
                  </p>
                  <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
                    {t.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
