/**
 * Footer - Light luxury footer
 * Design: Light Luxury Theme - White/Gray/Gold
 */
import { Instagram, Facebook, Phone, Mail, MapPin } from "lucide-react";
import { Link } from "wouter";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/bader_logo_08e79383.webp";

export default function Footer() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <footer
      className="relative pt-16 pb-8"
      style={{
        background: "#2C2416",
        borderTop: "3px solid #B89050",
      }}
    >
      <div className="absolute inset-0 islamic-pattern opacity-15" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img
                src={LOGO_URL}
                alt="مركز بدر"
                className="h-16 w-16 rounded-full object-cover"
                style={{ border: "2px solid rgba(156,122,60,0.6)" }}
              />
              <div>
                <p className="text-xs tracking-widest" style={{ color: "#B89050", fontFamily: "'Cormorant Garamond', serif" }}>
                  BADER CENTER
                </p>
                <p className="font-bold text-xl" style={{ color: "#F7F3EC", fontFamily: "'Amiri', serif" }}>
                  مركز بدر
                </p>
              </div>
            </div>
            <p
              className="text-sm leading-relaxed mb-4"
              style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}
            >
              للفخامة أصول.. نجسدها منذ 20 عاماً
              <br />
              الفحيحيل، الكويت
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={18} />, url: "https://www.instagram.com/badercenterco", color: "#E1306C" },
                { icon: <Facebook size={18} />, url: "https://www.facebook.com/p/Bader-Center-61550307831915/", color: "#1877F2" },
                {
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  ),
                  url: "https://wa.me/96522675826",
                  color: "#25D366",
                },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
                  style={{ background: `${s.color}20`, color: s.color, border: `1px solid ${s.color}40` }}
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ color: "#B89050", fontFamily: "'Cairo', sans-serif" }}
            >
              روابط سريعة
            </h4>
            <ul className="space-y-2">
              {[
                { label: "الرئيسية", id: "#home" },
                { label: "خدماتنا", id: "#services" },
                { label: "أعمالنا", id: "#gallery" },
                { label: "المناسبات", id: "#occasions" },
                { label: "من نحن", id: "#about" },
              ].map((link) => (
                <li key={link.id}>
                  <button
                    onClick={() => scrollTo(link.id)}
                    className="text-sm transition-colors"
                    style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#B89050")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#9A8A70")}
                  >
                    {link.label}
                  </button>
                </li>
              ))}
              <li>
                <Link
                  href="/catalog"
                  className="text-sm transition-colors"
                  style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}
                >
                  كتالوج المنتجات
                </Link>
              </li>
              <li>
                <Link
                  href="/request"
                  className="text-sm transition-colors"
                  style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}
                >
                  طلب خدمة
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ color: "#B89050", fontFamily: "'Cairo', sans-serif" }}
            >
              خدماتنا
            </h4>
            <ul className="space-y-2">
              {[
                "تجهيزات الكيترنج",
                "البوثات والستاندات",
                "الدروع والتكريمات",
                "الأفراح والاستقبالات",
                "الهدايا والدزات",
                "الطباعة والتصميم",
              ].map((s) => (
                <li key={s}>
                  <span className="text-sm" style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}>
                    {s}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="font-semibold mb-4 text-sm"
              style={{ color: "#B89050", fontFamily: "'Cairo', sans-serif" }}
            >
              تواصل معنا
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone size={14} className="shrink-0" style={{ color: "#B89050" }} />
                <a href="tel:+96522675826" className="transition-colors" style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif", direction: "ltr" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#B89050")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9A8A70")}
                >
                  +965 2267 5826
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail size={14} className="shrink-0" style={{ color: "#B89050" }} />
                <a href="mailto:badercenterco@gmail.com" className="transition-colors text-xs" style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#B89050")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#9A8A70")}
                >
                  badercenterco@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <MapPin size={14} className="shrink-0" style={{ color: "#B89050" }} />
                <span style={{ color: "#9A8A70", fontFamily: "'Cairo', sans-serif" }}>الفحيحيل، الكويت</span>
              </li>
            </ul>

            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold mt-6 text-sm inline-block px-6 py-3"
            >
              اطلب الآن
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="gold-divider mb-6" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className="text-xs"
            style={{ color: "#6A5A40", fontFamily: "'Cairo', sans-serif" }}
          >
            © 2024 مركز بدر - Bader Center. جميع الحقوق محفوظة.
          </p>
          <p
            className="text-xs"
            style={{ color: "#6A5A40", fontFamily: "'Cormorant Garamond', serif" }}
          >
            للفخامة أصول ✦ Luxury Has Its Origins
          </p>
        </div>
      </div>
    </footer>
  );
}
