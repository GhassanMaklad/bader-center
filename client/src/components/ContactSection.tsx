/**
 * ContactSection - Contact info and social media links
 * Design: Light Luxury Theme - White/Gray/Gold
 */
import { useEffect, useRef, useState } from "react";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { Link } from "wouter";

const contactInfo = [
  {
    icon: <Phone size={24} />,
    title: "واتساب وهاتف",
    value: "+965 2267 5826",
    link: "https://wa.me/96522675826",
    linkText: "تواصل الآن",
  },
  {
    icon: <Mail size={24} />,
    title: "البريد الإلكتروني",
    value: "badercenterco@gmail.com",
    link: "mailto:badercenterco@gmail.com",
    linkText: "أرسل بريداً",
  },
  {
    icon: <MapPin size={24} />,
    title: "الموقع",
    value: "الفحيحيل، الكويت",
    link: "https://maps.google.com/?q=Fahaheel+Kuwait",
    linkText: "عرض على الخريطة",
  },
];

const socialLinks = [
  {
    icon: <Instagram size={28} />,
    name: "إنستغرام",
    handle: "@badercenterco",
    url: "https://www.instagram.com/badercenterco",
    color: "#E1306C",
    followers: "19.7K",
  },
  {
    icon: <Facebook size={28} />,
    name: "فيسبوك",
    handle: "Bader Center",
    url: "https://www.facebook.com/p/Bader-Center-61550307831915/",
    color: "#1877F2",
    followers: "134",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
    name: "واتساب",
    handle: "+965 2267 5826",
    url: "https://wa.me/96522675826",
    color: "#25D366",
    followers: "مباشر",
  },
];

export default function ContactSection() {
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
      id="contact"
      className="py-24 relative overflow-hidden"
      style={{ background: "#F5F3EE" }}
    >
      {/* Background */}
      <div className="absolute inset-0 islamic-pattern opacity-15" />
      <div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, #D4AF37 0%, transparent 70%)", transform: "translate(50%, 50%)" }}
      />

      <div className="container mx-auto px-4 lg:px-8 relative z-10" ref={ref}>
        {/* Header */}
        <div
          className="text-center mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease",
          }}
        >
          <p className="text-xs tracking-[0.3em] uppercase mb-4 font-semibold" style={{ color: "#B8922A", fontFamily: "'Cormorant Garamond', serif" }}>
            ✦ تواصل معنا ✦
          </p>
          <h2
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: "#1C1810", fontFamily: "'Amiri', serif" }}
          >
            نحن هنا لخدمتك
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-4" />
          <p className="max-w-xl mx-auto" style={{ color: "#6B5E4A", fontFamily: "'Cairo', sans-serif" }}>
            تواصل معنا الآن لتحويل مناسبتك إلى تجربة لا تُنسى
          </p>
        </div>

        {/* Contact Cards */}
        <div
          className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease 0.2s",
          }}
        >
          {contactInfo.map((info) => (
            <div
              key={info.title}
              className="rounded-2xl p-6 text-center"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(184,146,42,0.15)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
              }}
            >
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: "rgba(184,146,42,0.1)", border: "1px solid rgba(184,146,42,0.3)", color: "#B8922A" }}
              >
                {info.icon}
              </div>
              <h3
                className="font-semibold mb-2 text-sm"
                style={{ color: "#B8922A", fontFamily: "'Cairo', sans-serif" }}
              >
                {info.title}
              </h3>
              <p
                className="mb-3 text-sm"
                style={{ color: "#1C1810", fontFamily: "'Cairo', sans-serif", direction: "ltr" }}
              >
                {info.value}
              </p>
              <a
                href={info.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs transition-colors"
                style={{ color: "#B8922A", fontFamily: "'Cairo', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#8A6A1A")}
                onMouseLeave={e => (e.currentTarget.style.color = "#B8922A")}
              >
                {info.linkText} ←
              </a>
            </div>
          ))}
        </div>

        {/* Social Media */}
        <div
          className="mb-16"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.8s ease 0.4s",
          }}
        >
          <h3
            className="text-center text-2xl font-bold mb-8"
            style={{ color: "#1C1810", fontFamily: "'Amiri', serif" }}
          >
            تابعنا على وسائل التواصل
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-2xl p-6 text-center group"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid rgba(184,146,42,0.15)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  textDecoration: "none",
                  display: "block",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.05)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 transition-all duration-300 group-hover:scale-110"
                  style={{ background: `${social.color}18`, color: social.color, border: `1px solid ${social.color}35` }}
                >
                  {social.icon}
                </div>
                <p className="font-semibold mb-1" style={{ color: "#1C1810", fontFamily: "'Cairo', sans-serif" }}>
                  {social.name}
                </p>
                <p className="text-xs mb-2" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                  {social.handle}
                </p>
                <span
                  className="text-xs px-3 py-1 rounded-full"
                  style={{ background: `${social.color}18`, color: social.color, fontFamily: "'Cairo', sans-serif" }}
                >
                  {social.followers} متابع
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Big CTA */}
        <div
          className="text-center p-12 rounded-2xl relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #FEFCF5 0%, #FFF5D6 100%)",
            border: "1px solid rgba(184,146,42,0.3)",
            boxShadow: "0 8px 40px rgba(184,146,42,0.12)",
            opacity: visible ? 1 : 0,
            transition: "all 0.8s ease 0.6s",
          }}
        >
          <div className="absolute inset-0 islamic-pattern opacity-20" />
          <div className="relative z-10">
            <p className="text-xs tracking-widest uppercase mb-4 font-semibold" style={{ color: "#B8922A", fontFamily: "'Cormorant Garamond', serif" }}>
              ابدأ رحلتك معنا
            </p>
            <h3
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ color: "#1C1810", fontFamily: "'Amiri', serif" }}
            >
              جاهز لتجهيز مناسبتك؟
            </h3>
            <p
              className="mb-8 max-w-md mx-auto"
              style={{ color: "#6B5E4A", fontFamily: "'Cairo', sans-serif" }}
            >
              تواصل معنا الآن عبر واتساب وسنساعدك في تحويل فكرتك إلى واقع فاخر
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href="/request"
                className="btn-gold text-lg px-10 py-4 inline-flex items-center gap-3"
              >
                <Phone size={22} />
                اطلب خدمتك الآن
              </Link>
              <a
                href="https://wa.me/96522675826"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gold-outline px-10 py-4 inline-flex items-center gap-3"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                واتساب مباشر
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
