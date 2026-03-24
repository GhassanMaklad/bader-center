import { Phone } from "lucide-react";

export default function ReadyCtaSection() {
  return (
    <section
      className="py-16 px-4 flex justify-center items-center"
      style={{ background: "#F2EDE4", direction: "rtl" }}
    >
      <div
        className="w-full max-w-sm rounded-3xl px-8 py-12 text-center flex flex-col items-center gap-6"
        style={{
          background: "#EDE7DC",
          boxShadow: "0 4px 32px rgba(156,122,60,0.10)",
        }}
      >
        {/* Label */}
        <p
          className="text-sm font-semibold tracking-wide"
          style={{ color: "#B89050", fontFamily: "'Cairo', sans-serif" }}
        >
          ابدأ رحلتك معنا
        </p>

        {/* Heading */}
        <h2
          className="text-4xl font-bold leading-snug"
          style={{
            color: "#2C2416",
            fontFamily: "'Amiri', serif",
            lineHeight: "1.4",
          }}
        >
          جاهز لتجهيز
          <br />
          مناسبتك؟
        </h2>

        {/* Description */}
        <p
          className="text-base leading-relaxed"
          style={{
            color: "#6B5A3E",
            fontFamily: "'Cairo', sans-serif",
            maxWidth: "260px",
          }}
        >
          تواصل معنا الآن عبر واتساب وسنساعدك في تحويل فكرتك إلى واقع فاخر
        </p>

        {/* Primary Button */}
        <a
          href="/request"
          className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:opacity-90 hover:scale-[1.02]"
          style={{
            background: "#2C2416",
            color: "#F2EDE4",
            fontFamily: "'Cairo', sans-serif",
            boxShadow: "0 4px 16px rgba(44,36,22,0.25)",
          }}
        >
          <Phone size={20} />
          اطلب خدمتك الآن
        </a>

        {/* Secondary Button */}
        <a
          href="https://wa.me/96522675826"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 py-4 rounded-full text-lg font-bold transition-all duration-300 hover:bg-opacity-10 hover:scale-[1.02]"
          style={{
            background: "transparent",
            color: "#2C2416",
            border: "2px solid #2C2416",
            fontFamily: "'Cairo', sans-serif",
          }}
        >
          {/* WhatsApp icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#2C2416">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          واتساب مباشر
        </a>
      </div>
    </section>
  );
}
