/**
 * AboutSection - Company story and values
 * Design: Light Luxury Theme - White/Gray/Gold
 */
import { useEffect, useRef, useState } from "react";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/bader_logo_08e79383.webp";
const CATERING_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/catering_booth-27hdZGhESZb97S94uSah7j.webp";

const values = [
  { icon: "✨", title: "الفخامة", desc: "نؤمن أن كل تفصيل يصنع الفارق" },
  { icon: "🎯", title: "الدقة", desc: "التنفيذ المثالي في كل مشروع" },
  { icon: "🤝", title: "الوفاء", desc: "نلتزم بوعودنا دائماً" },
  { icon: "💡", title: "الإبداع", desc: "أفكار مبتكرة لكل مناسبة" },
];

export default function AboutSection() {
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
      id="about"
      className="py-24 relative overflow-hidden"
      style={{ background: "#EDE8DF" }}
    >
      {/* Background decoration */}
      <div className="absolute inset-0 islamic-pattern opacity-20" />
      <div
        className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #B89050 0%, transparent 70%)", transform: "translate(-50%, -50%)" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div
          ref={ref}
          className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"
        >
          {/* Image Side */}
          <div
            className="relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(-40px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <div className="relative rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(156,122,60,0.3)", boxShadow: "0 8px 40px rgba(0,0,0,0.1)" }}>
              <img
                src={CATERING_IMG}
                alt="مركز بدر"
                className="w-full h-96 object-cover"
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(135deg, rgba(156,122,60,0.08) 0%, transparent 50%)" }}
              />
            </div>

            {/* Logo overlay */}
            <div
              className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full flex items-center justify-center"
              style={{
                background: "#F7F3EC",
                border: "3px solid #B89050",
                boxShadow: "0 4px 20px rgba(156,122,60,0.3)",
              }}
            >
              <img src={LOGO_URL} alt="مركز بدر" className="w-20 h-20 rounded-full object-cover" />
            </div>

            {/* Experience badge */}
            <div
              className="absolute -top-4 -right-4 px-4 py-2 rounded-xl"
              style={{
                background: "linear-gradient(135deg, #B89050, #D4B070)",
                boxShadow: "0 4px 20px rgba(156,122,60,0.4)",
              }}
            >
              <p className="font-bold text-sm" style={{ color: "#3D2B00", fontFamily: "'Cairo', sans-serif" }}>
                +20 عاماً
              </p>
              <p className="text-xs" style={{ color: "#3D2B00", fontFamily: "'Cairo', sans-serif" }}>
                من الخبرة
              </p>
            </div>
          </div>

          {/* Text Side */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateX(0)" : "translateX(40px)",
              transition: "all 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s",
            }}
          >
            <p className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style={{ color: "#9C7A3C", fontFamily: "'Cormorant Garamond', serif" }}>
              ✦ من نحن ✦
            </p>
            <h2
              className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
              style={{ color: "#2C2416", fontFamily: "'Amiri', serif" }}
            >
              قصتنا مع
              <br />
              <span className="gold-text">الفخامة</span>
            </h2>
            <div className="gold-divider mb-6" style={{ width: "80px" }} />

            <p
              className="leading-relaxed mb-6 text-base"
              style={{ color: "#6B5E4A", fontFamily: "'Cairo', sans-serif" }}
            >
              مركز بدر هو وجهتك الأولى للفخامة والأناقة في الكويت. منذ أكثر من 20 عاماً، ونحن نجسّد أحلام عملائنا في كل مناسبة — من الأعراس الفاخرة إلى الاحتفالات الوطنية، ومن الهدايا المميزة إلى التكريمات الرسمية.
            </p>
            <p
              className="leading-relaxed mb-8 text-base"
              style={{ color: "#6B5E4A", fontFamily: "'Cairo', sans-serif" }}
            >
              نؤمن أن كل مناسبة تستحق لمسة استثنائية. لذلك نعمل بشغف وإتقان لنقدم لك تجربة لا تُنسى، مع توصيل لجميع مناطق الكويت.
            </p>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
                >
                  <span className="text-2xl">{v.icon}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}>
                      {v.title}
                    </p>
                    <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                      {v.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold inline-block"
            >
              تواصل معنا
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
