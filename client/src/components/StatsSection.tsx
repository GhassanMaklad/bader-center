/**
 * StatsSection - Numbers and testimonials
 * Design: Dark Arabian Opulence
 * - Full-width dark section with gold numbers
 * - Customer testimonials
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

function CountUp({ target, suffix = "" }: { target: string; suffix?: string }) {
  return (
    <span className="gold-shimmer text-4xl sm:text-5xl font-bold" style={{ fontFamily: "'Amiri', serif" }}>
      {target}
    </span>
  );
}

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
      style={{
        background: "linear-gradient(135deg, #130F09 0%, #0D0B08 50%, #1A1510 100%)",
      }}
    >
      {/* Gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)" }}
      />
      <div className="absolute inset-0 islamic-pattern opacity-20" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        {/* Stats */}
        <div
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="text-center p-6 rounded-lg"
              style={{
                background: "rgba(201,168,76,0.05)",
                border: "1px solid rgba(201,168,76,0.15)",
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(20px)",
                transition: `all 0.8s ease ${i * 0.15}s`,
              }}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <CountUp target={stat.num} />
              <p
                className="text-[#7A6A50] text-sm mt-2"
                style={{ fontFamily: "'Cairo', sans-serif" }}
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
          <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ آراء عملائنا ✦
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white"
            style={{ fontFamily: "'Amiri', serif" }}
          >
            ماذا يقول عملاؤنا
          </h2>
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
              className="luxury-card rounded-lg p-6 relative"
            >
              {/* Quote mark */}
              <div
                className="text-6xl leading-none mb-4 opacity-30"
                style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}
              >
                "
              </div>
              <p
                className="text-[#A09070] text-sm leading-relaxed mb-6"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {t.text}
              </p>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-[#C9A84C] font-bold"
                  style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)" }}
                >
                  {t.name[0]}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm" style={{ fontFamily: "'Cairo', sans-serif" }}>
                    {t.name}
                  </p>
                  <p className="text-[#7A6A50] text-xs" style={{ fontFamily: "'Cairo', sans-serif" }}>
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
