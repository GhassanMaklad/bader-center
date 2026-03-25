/**
 * RequestService Page - طلب خدمة
 * Design: Dark Arabian Luxury Theme
 * - Full-page form with gold accents and RTL layout
 * - Fields: name, phone, occasion type, date, budget
 * - Submits via WhatsApp with pre-filled message
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  User,
  Phone,
  Calendar,
  Wallet,
  PartyPopper,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const LOGO_URL =
  "https://d2xsxph8kpxj0f.cloudfront.net/310519663383339249/5qcuM54U5U98AxY6F5CRzB/bader_logo_08e79383.webp";

const OCCASIONS = [
  { value: "ramadan", label: "🌙 رمضان الكريم" },
  { value: "qargian", label: "🎊 قرقيعان" },
  { value: "national_day", label: "🇰🇼 العيد الوطني" },
  { value: "graduation", label: "🎓 حفل تخرج" },
  { value: "newborn", label: "👶 مواليد" },
  { value: "wedding", label: "💒 فرح / زفاف" },
  { value: "corporate", label: "🏢 فعالية شركة" },
  { value: "school", label: "🏫 مدرسة / جامعة" },
  { value: "birthday", label: "🎉 عيد ميلاد" },
  { value: "reception", label: "🤝 استقبال / ضيافة" },
  { value: "eid", label: "✨ عيد الفطر / الأضحى" },
  { value: "other", label: "📌 مناسبة أخرى" },
];

const BUDGETS = [
  { value: "under_50", label: "أقل من 50 د.ك" },
  { value: "50_150", label: "50 — 150 د.ك" },
  { value: "150_300", label: "150 — 300 د.ك" },
  { value: "300_500", label: "300 — 500 د.ك" },
  { value: "500_1000", label: "500 — 1,000 د.ك" },
  { value: "above_1000", label: "أكثر من 1,000 د.ك" },
  { value: "not_sure", label: "لم أحدد بعد" },
];

interface FormData {
  name: string;
  phone: string;
  occasion: string;
  date: string;
  budget: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  occasion?: string;
  date?: string;
  budget?: string;
}

function FloatingLabel({
  id,
  label,
  children,
  error,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="relative">
      <label
        htmlFor={id}
        className="block text-sm font-medium mb-2"
        style={{ color: error ? "#ef4444" : "#B89050", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
      >
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-xs text-red-400" style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(26,21,16,0.8)",
  border: "1px solid rgba(156,122,60,0.25)",
  borderRadius: "0.375rem",
  padding: "0.875rem 1rem",
  color: "#F0E6CC",
  fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.3s, box-shadow 0.3s",
  direction: "rtl",
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: "rgba(156,122,60,0.7)",
  boxShadow: "0 0 0 3px rgba(156,122,60,0.1)",
};

function InputField({
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
}: {
  id: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  icon: React.ElementType;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: "1rem", color: focused ? "#B89050" : "#6B5A3E" }}
      >
        <Icon size={18} />
      </div>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          paddingLeft: "2.75rem",
          borderColor: error
            ? "rgba(239,68,68,0.6)"
            : focused
            ? "rgba(156,122,60,0.7)"
            : "rgba(156,122,60,0.25)",
          boxShadow: focused ? "0 0 0 3px rgba(156,122,60,0.1)" : "none",
        }}
      />
    </div>
  );
}

function SelectField({
  id,
  options,
  value,
  onChange,
  placeholder,
  error,
  icon: Icon,
}: {
  id: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  icon: React.ElementType;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ left: "1rem", color: focused ? "#B89050" : "#6B5A3E" }}
      >
        <Icon size={18} />
      </div>
      <div
        className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
        style={{ right: "1rem", color: "#6B5A3E" }}
      >
        <ChevronDown size={16} />
      </div>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...inputStyle,
          paddingLeft: "2.75rem",
          paddingRight: "2.5rem",
          appearance: "none",
          WebkitAppearance: "none",
          borderColor: error
            ? "rgba(239,68,68,0.6)"
            : focused
            ? "rgba(156,122,60,0.7)"
            : "rgba(156,122,60,0.25)",
          boxShadow: focused ? "0 0 0 3px rgba(156,122,60,0.1)" : "none",
          color: value ? "#F0E6CC" : "#6B5A3E",
        }}
      >
        <option value="" disabled style={{ background: "#1A1510", color: "#6B5A3E" }}>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} style={{ background: "#1A1510", color: "#F0E6CC" }}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function RequestService() {
  const [, navigate] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({
    name: "",
    phone: "",
    occasion: "",
    date: "",
    budget: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const heroRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [formVisible, setFormVisible] = useState(false);

  // Read product info from URL params (passed from Catalog "Order Now" button)
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledProduct = urlParams.get("product") || "";
  const prefilledImage = urlParams.get("image") || "";
  const prefilledPrice = urlParams.get("price") || "";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setFormVisible(true); },
      { threshold: 0.05 }
    );
    if (formRef.current) observer.observe(formRef.current);
    return () => observer.disconnect();
  }, []);

  const set = (field: keyof FormData) => (value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const submitMutation = trpc.serviceRequests.submit.useMutation({
    onError: (e) => {
      console.warn("[ServiceRequest] DB save failed:", e.message);
      // Non-blocking: WhatsApp still opens even if DB save fails
    },
  });

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!form.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!/^[0-9+\s\-]{7,15}$/.test(form.phone.trim())) {
      newErrors.phone = "رقم الهاتف غير صحيح";
    }
    if (!form.occasion) newErrors.occasion = "يرجى اختيار نوع المناسبة";
    if (!form.date) newErrors.date = "يرجى تحديد تاريخ المناسبة";
    if (!form.budget) newErrors.budget = "يرجى تحديد الميزانية المتوقعة";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const occasionLabel = OCCASIONS.find((o) => o.value === form.occasion)?.label || form.occasion;
    const budgetLabel = BUDGETS.find((b) => b.value === form.budget)?.label || form.budget;

    // Save to DB and notify owner (fire-and-forget, non-blocking)
    submitMutation.mutate({
      name: form.name,
      phone: form.phone,
      occasion: form.occasion,
      occasionLabel,
      date: form.date,
      budget: form.budget,
      budgetLabel,
      notes: form.notes,
    });

    // 1️⃣ Send request to Bader Center (owner)
    const ownerMessage = [
      "🌟 *طلب خدمة جديد — مركز بدر*",
      "",
      prefilledProduct ? `🛎️ *المنتج المطلوب:* ${prefilledProduct}` : "",
      prefilledPrice ? `💲 *السعر:* ${prefilledPrice}` : "",
      prefilledImage ? `🖼️ *صورة المنتج:* ${prefilledImage}` : "",
      prefilledProduct ? "────────────────────" : "",
      `👤 *الاسم:* ${form.name}`,
      `📞 *الهاتف:* ${form.phone}`,
      `🎉 *نوع المناسبة:* ${occasionLabel}`,
      `📅 *التاريخ:* ${form.date}`,
      `💰 *الميزانية المتوقعة:* ${budgetLabel}`,
      form.notes ? `📝 *ملاحظات:* ${form.notes}` : "",
      "",
      "_تم الإرسال من موقع مركز بدر_",
    ]
      .filter((l) => l !== "")
      .join("\n");

    window.open(`https://wa.me/96522675826?text=${encodeURIComponent(ownerMessage)}`, "_blank");

    // 2️⃣ Build confirmation message for the customer
    // Normalize phone: strip spaces/dashes, ensure it starts with country code
    const rawPhone = form.phone.replace(/[\s\-]/g, "");
    const customerPhone = rawPhone.startsWith("+")
      ? rawPhone.replace("+", "")
      : rawPhone.startsWith("00")
      ? rawPhone.replace("00", "")
      : rawPhone.startsWith("0")
      ? `965${rawPhone.slice(1)}`
      : `965${rawPhone}`;

    const confirmationMessage = [
      `✨ أهلاً ${form.name}،`,
      "",
      "شكراً لتواصلك مع *مركز بدر* 🌟",
      "تم استلام طلبك بنجاح، وسيتواصل معك فريقنا في أقرب وقت ممكن.",
      "",
      "📋 *ملخص طلبك:*",
      `🎉 المناسبة: ${occasionLabel}`,
      `📅 التاريخ: ${form.date}`,
      `💰 الميزانية: ${budgetLabel}`,
      form.notes ? `📝 ملاحظات: ${form.notes}` : "",
      "",
      "━━━━━━━━━━━━━━━━━━━━",
      "🏪 *مركز بدر — الفحيحيل، الكويت*",
      "📞 22675826 | منذ 2004",
      "━━━━━━━━━━━━━━━━━━━━",
    ]
      .filter((l) => l !== "")
      .join("\n");

    // Open WhatsApp to send confirmation to customer (slight delay so both tabs open)
    setTimeout(() => {
      window.open(
        `https://wa.me/${customerPhone}?text=${encodeURIComponent(confirmationMessage)}`,
        "_blank"
      );
    }, 800);

    setSubmitted(true);
  };

  // Success screen
  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center relative"
        style={{ background: "#F2EDE4" }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-10" />
        <div
          className="relative z-10 text-center px-6 max-w-lg"
          style={{
            animation: "fadeInUp 0.8s ease forwards",
          }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8"
            style={{
              background: "linear-gradient(135deg, rgba(156,122,60,0.2), rgba(156,122,60,0.05))",
              border: "2px solid rgba(156,122,60,0.5)",
              boxShadow: "0 0 40px rgba(156,122,60,0.2)",
            }}
          >
            <CheckCircle2 size={48} className="text-[#B89050]" />
          </div>
          <h1
            className="text-4xl font-bold text-white mb-4"
            style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
          >
            تم إرسال طلبك بنجاح!
          </h1>
          <div className="gold-divider max-w-xs mx-auto mb-6" />
          <p
            className="text-[#A09070] text-lg mb-6 leading-relaxed"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
          >
            شكراً لك! تم إرسال طلبك إلى مركز بدر، كما فُتح واتساب لإرسال رسالة تأكيد إليك على رقمك المسجّل.
          </p>

          {/* Confirmation steps */}
          <div
            className="rounded-xl p-5 mb-8 text-right"
            style={{
              background: "rgba(156,122,60,0.07)",
              border: "1px solid rgba(156,122,60,0.2)",
            }}
          >
            <p
              className="text-[#B89050] font-semibold mb-3 text-sm tracking-wide"
              style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              ماذا حدث الآن؟
            </p>
            <ul
              className="space-y-2 text-[#A09070] text-sm"
              style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
            >
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                تم حفظ طلبك في نظامنا
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                تم إرسال تفاصيل طلبك إلى فريق مركز بدر عبر واتساب
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[#B89050]">↗</span>
                فُتح واتساب لإرسال رسالة تأكيد على رقمك — تأكد من الضغط على "إرسال"
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gold flex items-center justify-center gap-2"
            >
              <Phone size={18} />
              تواصل مباشرة عبر واتساب
            </a>
            <button
              onClick={() => navigate("/")}
              className="btn-gold-outline flex items-center justify-center gap-2 px-6 py-3"
            >
              <ArrowRight size={18} />
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#F2EDE4" }}>
      <Navbar />

      {/* Hero Banner */}
      <div
        ref={heroRef}
        className="relative pt-20 pb-16 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #D4C9B0 0%, #C8BC9E 50%, #D4C9B0 100%)",
        }}
      >
        <div className="absolute inset-0 islamic-pattern opacity-20" />
        {/* Decorative gold lines */}
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, #B89050, transparent)" }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: "linear-gradient(to right, transparent, #B89050, transparent)" }}
        />

        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center pt-12">
          {/* Breadcrumb */}
          <div
            className="flex items-center justify-center gap-2 mb-6 text-sm"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", color: "#4A3F2F" }}
          >
            <button onClick={() => navigate("/")} className="hover:text-[#9C7A3C] transition-colors" style={{ color: "#4A3F2F" }}>
              الرئيسية
            </button>
            <span>/</span>
            <span style={{ color: "#9C7A3C" }}>طلب خدمة</span>
          </div>

          <p
            className="text-xs tracking-[0.3em] uppercase mb-4"
            style={{ color: "#9C7A3C", fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}
          >
            ✦ BADER CENTER ✦
          </p>
          <h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4"
            style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
          >
            اطلب خدمتك الآن
          </h1>
          <div className="gold-divider max-w-xs mx-auto mb-6" />
          <p
            className="max-w-xl mx-auto text-lg"
            style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif", color: "#4A3F2F" }}
          >
            أخبرنا عن مناسبتك وسنتواصل معك لتحويل فكرتك إلى واقع فاخر
          </p>

          {/* Stats row */}
          <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
            {[
              { value: "+20", label: "عاماً خبرة" },
              { value: "24h", label: "رد سريع" },
              { value: "100%", label: "رضا العملاء" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div
                  className="text-2xl font-bold"
                  style={{
                    fontFamily: "'Playfair Display', 'Cormorant Garamond', serif",
                    background: "linear-gradient(135deg, #B89050, #D4B070)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-xs"
                  style={{ color: "#4A3F2F", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div
        ref={formRef}
        className="py-16"
        style={{
          opacity: formVisible ? 1 : 0,
          transform: formVisible ? "translateY(0)" : "translateY(40px)",
          transition: "all 0.9s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="max-w-2xl mx-auto">
            {/* Form Card */}
            <div
              className="rounded-xl p-8 sm:p-10"
              style={{
                background: "linear-gradient(135deg, rgba(26,21,16,0.95) 0%, rgba(13,11,8,0.98) 100%)",
                border: "1px solid rgba(156,122,60,0.2)",
                boxShadow: "0 20px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(156,122,60,0.1)",
              }}
            >
              {/* Card header */}
              <div className="flex items-center gap-4 mb-8">
                <img
                  src={LOGO_URL}
                  alt="مركز بدر"
                  className="w-12 h-12 rounded-full object-cover"
                  style={{ border: "1.5px solid rgba(156,122,60,0.5)" }}
                />
                <div>
                  <p
                    className="text-xs text-[#B89050] tracking-widest"
                    style={{ fontFamily: "'Playfair Display', 'Cormorant Garamond', serif" }}
                  >
                    BADER CENTER
                  </p>
                  <h2
                    className="text-xl font-bold text-white"
                    style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
                  >
                    نموذج طلب الخدمة
                  </h2>
                </div>
              </div>

              <div
                className="h-px mb-8"
                style={{ background: "linear-gradient(to right, #B89050, transparent)" }}
              />

              <form onSubmit={handleSubmit} noValidate>
                {/* Product Card — shown when coming from Catalog */}
                {prefilledProduct && (
                  <div
                    className="flex gap-4 p-4 rounded-xl mb-6"
                    style={{
                      background: "rgba(156,122,60,0.08)",
                      border: "1px solid rgba(156,122,60,0.3)",
                    }}
                  >
                    {prefilledImage && (
                      <img
                        src={prefilledImage}
                        alt={prefilledProduct}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        style={{ border: "1px solid rgba(156,122,60,0.3)" }}
                      />
                    )}
                    <div className="flex flex-col justify-center gap-1">
                      <p
                        className="text-xs"
                        style={{ color: "#B89050", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                      >
                        المنتج المطلوب
                      </p>
                      <p
                        className="font-bold text-base"
                        style={{ color: "#F0E6CC", fontFamily: "'Noto Naskh Arabic', serif" }}
                      >
                        {prefilledProduct}
                      </p>
                      {prefilledPrice && (
                        <p
                          className="text-sm"
                          style={{ color: "#A09070", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                        >
                          {prefilledPrice}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <FloatingLabel id="name" label="الاسم الكريم *" error={errors.name}>
                    <InputField
                      id="name"
                      placeholder="أدخل اسمك الكريم"
                      value={form.name}
                      onChange={set("name")}
                      error={errors.name}
                      icon={User}
                    />
                  </FloatingLabel>

                  {/* Phone */}
                  <FloatingLabel id="phone" label="رقم الهاتف *" error={errors.phone}>
                    <InputField
                      id="phone"
                      type="tel"
                      placeholder="مثال: 96512345678+"
                      value={form.phone}
                      onChange={set("phone")}
                      error={errors.phone}
                      icon={Phone}
                    />
                  </FloatingLabel>

                  {/* Occasion Type */}
                  <div className="sm:col-span-2">
                    <FloatingLabel id="occasion" label="نوع المناسبة *" error={errors.occasion}>
                      <SelectField
                        id="occasion"
                        options={OCCASIONS}
                        value={form.occasion}
                        onChange={set("occasion")}
                        placeholder="اختر نوع المناسبة"
                        error={errors.occasion}
                        icon={PartyPopper}
                      />
                    </FloatingLabel>
                  </div>

                  {/* Date */}
                  <FloatingLabel id="date" label="تاريخ المناسبة *" error={errors.date}>
                    <div className="relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 pointer-events-none z-10"
                        style={{ left: "1rem", color: "#6B5A3E" }}
                      >
                        <Calendar size={18} />
                      </div>
                      <input
                        id="date"
                        type="date"
                        value={form.date}
                        onChange={(e) => set("date")(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                        style={{
                          ...inputStyle,
                          paddingLeft: "2.75rem",
                          borderColor: errors.date
                            ? "rgba(239,68,68,0.6)"
                            : "rgba(156,122,60,0.25)",
                          colorScheme: "dark",
                        }}
                      />
                    </div>
                  </FloatingLabel>

                  {/* Budget */}
                  <FloatingLabel id="budget" label="الميزانية المتوقعة *" error={errors.budget}>
                    <SelectField
                      id="budget"
                      options={BUDGETS}
                      value={form.budget}
                      onChange={set("budget")}
                      placeholder="اختر نطاق الميزانية"
                      error={errors.budget}
                      icon={Wallet}
                    />
                  </FloatingLabel>

                  {/* Notes */}
                  <div className="sm:col-span-2">
                    <FloatingLabel id="notes" label="ملاحظات إضافية (اختياري)">
                      <textarea
                        id="notes"
                        placeholder="أي تفاصيل إضافية تريد مشاركتها معنا..."
                        value={form.notes}
                        onChange={(e) => set("notes")(e.target.value)}
                        rows={4}
                        style={{
                          ...inputStyle,
                          resize: "vertical",
                          minHeight: "100px",
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "rgba(156,122,60,0.7)";
                          e.target.style.boxShadow = "0 0 0 3px rgba(156,122,60,0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "rgba(156,122,60,0.25)";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    </FloatingLabel>
                  </div>
                </div>

                {/* Divider */}
                <div
                  className="h-px my-8"
                  style={{ background: "linear-gradient(to right, transparent, rgba(156,122,60,0.3), transparent)" }}
                />

                {/* WhatsApp note */}
                <div
                  className="flex items-start gap-3 p-4 rounded-lg mb-6"
                  style={{
                    background: "rgba(156,122,60,0.05)",
                    border: "1px solid rgba(156,122,60,0.15)",
                  }}
                >
                  <div className="text-[#B89050] mt-0.5 flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                  <p
                    className="text-sm text-[#A09070] leading-relaxed"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                  >
                    بعد الضغط على "إرسال الطلب"، سيُفتح تطبيق واتساب مع رسالة جاهزة تحتوي على تفاصيل طلبك. أرسل الرسالة وسيتواصل معك فريقنا في أقرب وقت.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full btn-gold flex items-center justify-center gap-3 py-4 text-lg font-bold"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  إرسال الطلب عبر واتساب
                </button>

                <p
                  className="text-center text-xs text-[#6B5A3E] mt-4"
                  style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                >
                  بياناتك محمية ولن تُشارك مع أي طرف ثالث
                </p>
              </form>
            </div>

            {/* Bottom trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { icon: "⚡", title: "رد سريع", desc: "خلال 24 ساعة" },
                { icon: "🔒", title: "بيانات آمنة", desc: "خصوصية تامة" },
                { icon: "✨", title: "جودة مضمونة", desc: "20 عاماً خبرة" },
              ].map((badge) => (
                <div
                  key={badge.title}
                  className="text-center p-4 rounded-lg"
                  style={{
                    background: "rgba(26,21,16,0.6)",
                    border: "1px solid rgba(156,122,60,0.1)",
                  }}
                >
                  <div className="text-2xl mb-1">{badge.icon}</div>
                  <div
                    className="text-sm font-bold text-[#B89050]"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                  >
                    {badge.title}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: "#4A3F2F", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
                  >
                    {badge.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="text-center py-8 border-t"
        style={{ borderColor: "rgba(156,122,60,0.1)" }}
      >
        <p
          className="text-[#6B5A3E] text-sm"
          style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
        >
          © 2024 مركز بدر — الفحيحيل، الكويت
        </p>
      </div>
    </div>
  );
}
