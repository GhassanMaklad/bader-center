/**
 * Navbar Component - Dark Arabian Luxury Theme
 * Colors: #0D0B08 bg, #C9A84C gold, #E8C96A light gold
 * Font: Cairo (Arabic), Cormorant Garamond (English)
 * Direction: RTL
 */
import { useState, useEffect } from "react";
import { Menu, X, Phone } from "lucide-react";

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

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setIsOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#0D0B08]/95 backdrop-blur-md shadow-lg shadow-black/50"
          : "bg-transparent"
      }`}
      style={{ borderBottom: scrolled ? "1px solid rgba(201,168,76,0.2)" : "none" }}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src={LOGO_URL}
              alt="مركز بدر"
              className="h-14 w-14 rounded-full object-cover"
              style={{ border: "2px solid rgba(201,168,76,0.5)" }}
            />
            <div className="hidden sm:block">
              <p className="text-xs text-[#C9A84C] font-light tracking-widest" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                BADER CENTER
              </p>
              <p className="text-white font-bold text-lg leading-tight" style={{ fontFamily: "'Amiri', serif" }}>
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
                className="text-[#D4C5A0] hover:text-[#C9A84C] transition-colors duration-300 text-sm font-medium relative group"
                style={{ fontFamily: "'Cairo', sans-serif" }}
              >
                {link.label}
                <span className="absolute -bottom-1 right-0 w-0 h-px bg-[#C9A84C] transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold flex items-center gap-2 text-sm"
            >
              <Phone size={16} />
              اطلب الآن
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-[#C9A84C] p-2"
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
            background: "rgba(13,11,8,0.98)",
            backdropFilter: "blur(20px)",
            borderTop: "1px solid rgba(201,168,76,0.2)",
            borderBottom: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-[#D4C5A0] hover:text-[#C9A84C] transition-colors text-base font-medium text-right py-2"
                style={{ fontFamily: "'Cairo', sans-serif", borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              >
                {link.label}
              </button>
            ))}
            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold text-center mt-2"
            >
              تواصل معنا عبر واتساب
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
