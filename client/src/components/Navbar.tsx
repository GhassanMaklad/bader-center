/**
 * Navbar Component - Light Luxury Theme
 * Colors: White bg, #B8922A gold, #1C1810 dark text
 * Font: Cairo (Arabic), Cormorant Garamond (English)
 * Direction: RTL
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone, LayoutDashboard } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";

const LOGO_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/bader_logo_08e79383.webp";

const navLinks = [
  { label: "الرئيسية", href: "#home" },
  { label: "خدماتنا", href: "#services" },
  { label: "أعمالنا", href: "#gallery" },
  { label: "المناسبات", href: "#occasions" },
  { label: "من نحن", href: "#about" },
  { label: "تواصل معنا", href: "#contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(40);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
      const banner = document.querySelector('[data-banner]') as HTMLElement | null;
      setBannerHeight(banner ? banner.offsetHeight : 0);
    };
    window.addEventListener("scroll", handleScroll);
    const observer = new MutationObserver(() => {
      const banner = document.querySelector('[data-banner]') as HTMLElement | null;
      setBannerHeight(banner ? banner.offsetHeight : 0);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  const [location] = useLocation();

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    if (location !== "/") {
      window.location.href = "/" + href;
      return;
    }
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/97 backdrop-blur-md shadow-md"
          : "bg-white/90 backdrop-blur-sm"
      }`}
      style={{
        top: `${bannerHeight}px`,
        borderBottom: "1px solid rgba(201,168,76,0.25)",
        transition: "top 0.3s ease, background 0.5s ease",
      }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="مركز بدر"
              className="h-14 w-14 rounded-full object-cover"
              style={{ border: "2px solid rgba(184,146,42,0.5)", boxShadow: "0 2px 12px rgba(184,146,42,0.15)" }}
            />
            <div className="hidden sm:block">
              <p className="text-xs font-light tracking-widest" style={{ color: "#B8922A", fontFamily: "'Cormorant Garamond', serif" }}>
                BADER CENTER
              </p>
              <p className="font-bold text-lg leading-tight" style={{ color: "#1C1810", fontFamily: "'Amiri', serif" }}>
                مركز بدر
              </p>
            </div>
          </div>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="transition-colors duration-300 text-sm font-medium relative group"
                style={{ color: "#4A3F2F", fontFamily: "'Cairo', sans-serif" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#B8922A")}
                onMouseLeave={e => (e.currentTarget.style.color = "#4A3F2F")}
              >
                {link.label}
                <span className="absolute -bottom-1 right-0 w-0 h-px bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <Link
              href="/catalog"
              className="transition-colors duration-300 text-sm font-medium relative group"
              style={{ color: "#4A3F2F", fontFamily: "'Cairo', sans-serif" }}
            >
              كتالوج
              <span className="absolute -bottom-1 right-0 w-0 h-px bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-all duration-300 border"
                style={{
                  color: "#B8922A",
                  borderColor: "rgba(184,146,42,0.4)",
                  background: "rgba(184,146,42,0.06)",
                  fontFamily: "'Cairo', sans-serif",
                }}
              >
                <LayoutDashboard size={15} />
                لوحة الإدارة
              </Link>
            )}
            <Link
              href="/request"
              className="btn-gold flex items-center gap-2 text-sm"
            >
              <Phone size={16} />
              اطلب الآن
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            style={{ color: "#B8922A" }}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div
          className="lg:hidden absolute top-full right-0 left-0 py-6 px-4"
          style={{
            background: "rgba(255,255,255,0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(201,168,76,0.2)",
            borderBottom: "1px solid rgba(201,168,76,0.2)",
            boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
          }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="transition-colors text-base font-medium text-right py-2"
                style={{ color: "#4A3F2F", fontFamily: "'Cairo', sans-serif", borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              >
                {link.label}
              </button>
            ))}
            <Link
              href="/catalog"
              className="transition-colors text-base font-medium text-right py-2 block"
              style={{ color: "#4A3F2F", fontFamily: "'Cairo', sans-serif", borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              onClick={() => setIsOpen(false)}
            >
              كتالوج المنتجات
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-2 text-base font-medium text-right py-2"
                style={{
                  color: "#B8922A",
                  fontFamily: "'Cairo', sans-serif",
                  borderBottom: "1px solid rgba(201,168,76,0.1)",
                }}
                onClick={() => setIsOpen(false)}
              >
                <LayoutDashboard size={16} />
                لوحة الإدارة
              </Link>
            )}
            <Link
              href="/request"
              className="btn-gold text-center mt-2 block"
              onClick={() => setIsOpen(false)}
            >
              اطلب خدمة الآن
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
