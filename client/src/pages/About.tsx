import { useSEO } from "@/hooks/useSEO";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Award, Users, Calendar, MapPin, Phone, Instagram, ChevronLeft } from "lucide-react";

// ─── Static team data ──────────────────────────────────────────────────────────
const TEAM = [
  {
    name: "فريق الكيترنج",
    role: "خبراء تجهيز المناسبات",
    emoji: "🍽️",
    desc: "فريق متخصص في تجهيز بوثات الكيترنج الفاخرة لجميع أنواع المناسبات",
  },
  {
    name: "فريق الهدايا",
    role: "مصممو الهدايا الفاخرة",
    emoji: "🎁",
    desc: "يصمم فريقنا هدايا مخصصة تعكس الذوق الرفيع وتناسب كل مناسبة",
  },
  {
    name: "فريق الخط العربي",
    role: "خطاطون محترفون",
    emoji: "✍️",
    desc: "خطاطون محترفون يبدعون في النقش اليدوي على الهدايا والدروع واللوحات",
  },
  {
    name: "فريق الدروع",
    role: "صانعو الدروع التكريمية",
    emoji: "🏆",
    desc: "نصنع دروعاً تكريمية فاخرة مخصصة للشركات والمؤسسات والأفراد",
  },
];

// ─── Static stats ──────────────────────────────────────────────────────────────
const STATS = [
  { value: "+20", label: "عاماً من الخبرة", icon: Calendar },
  { value: "+5000", label: "مناسبة ناجحة", icon: Award },
  { value: "+10000", label: "عميل سعيد", icon: Users },
  { value: "100%", label: "رضا العملاء", icon: Star },
];

// ─── Timeline milestones ───────────────────────────────────────────────────────
const MILESTONES = [
  { year: "2004", title: "تأسيس مركز بدر", desc: "بدأت رحلتنا في الفحيحيل بمتجر صغير لتجهيز الهدايا" },
  { year: "2008", title: "توسع خدمات الكيترنج", desc: "أضفنا خدمات الكيترنج الفاخرة لتلبية الطلب المتزايد" },
  { year: "2012", title: "ورشة الخط العربي", desc: "أسسنا ورشة متخصصة للخط العربي اليدوي والنقش" },
  { year: "2016", title: "التوسع في الدروع التكريمية", desc: "أصبحنا المرجع الأول للدروع التكريمية في الكويت" },
  { year: "2020", title: "التحول الرقمي", desc: "أطلقنا منصتنا الإلكترونية لخدمة عملائنا في جميع أنحاء الكويت" },
  { year: "2024", title: "20 عاماً من التميز", desc: "نحتفل بعشرين عاماً من الإبداع والتميز في خدمة عملائنا" },
];

// ─── Star rating helper ────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-4 h-4 ${s <= rating ? "fill-[#C9A84C] text-[#C9A84C]" : "text-gray-600"}`}
        />
      ))}
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────
export default function About() {
  useSEO({
    title: "من نحن | مركز بدر - أكثر من 20 عاماً من التميز",
    description:
      "تعرف على قصة مركز بدر — شركة كويتية فاخرة متخصصة في تنظيم المناسبات والهدايا والكيترينج منذ عام 2004 في الفحيحيل، الكويت.",
  });

  const { data: testimonials = [] } = trpc.testimonials.list.useQuery();

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0D0B08", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}
    >
      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative py-24 px-4 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0D0B08 0%, #1a1508 50%, #0D0B08 100%)",
        }}
      >
        {/* Decorative gold circles */}
        <div
          className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-5 pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(-30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-5 pointer-events-none"
          style={{ background: "radial-gradient(circle, #C9A84C, transparent)", transform: "translate(30%, 30%)" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 mb-8 text-sm" style={{ color: "#9A8060" }}>
            <Link href="/" className="hover:text-[#C9A84C] transition-colors">الرئيسية</Link>
            <ChevronLeft className="w-4 h-4" />
            <span style={{ color: "#C9A84C" }}>من نحن</span>
          </nav>

          {/* Ornament */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, #C9A84C, transparent)" }} />
            <span className="text-3xl">✦</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, #C9A84C, transparent)" }} />
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
            مركز بدر
          </h1>
          <p className="text-lg md:text-xl leading-relaxed max-w-2xl mx-auto" style={{ color: "#D4C4A0" }}>
            أكثر من عشرين عاماً من الإبداع والتميز في تجهيز المناسبات الفاخرة، الهدايا الراقية، والكيترنج الاحترافي في قلب الكويت
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4" style={{ background: "#110E08" }}>
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div
              key={label}
              className="text-center p-6 rounded-2xl border"
              style={{ background: "#1A1508", borderColor: "#2A2010" }}
            >
              <Icon className="w-8 h-8 mx-auto mb-3" style={{ color: "#C9A84C" }} />
              <div className="text-3xl font-bold mb-1" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
                {value}
              </div>
              <div className="text-sm" style={{ color: "#9A8060" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Story ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Text */}
            <div>
              <Badge className="mb-4 text-xs px-3 py-1" style={{ background: "#1A1508", color: "#C9A84C", border: "1px solid #2A2010" }}>
                قصتنا
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
                رحلة بدأت بحلم
              </h2>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: "#C4B090" }}>
                <p>
                  في عام 2004، انطلق مركز بدر من الفحيحيل بحلم بسيط: تقديم خدمات مناسبات استثنائية تجمع بين الأصالة الكويتية والذوق الرفيع. بدأنا بمتجر صغير لتجهيز الهدايا، وسرعان ما نمت ثقة عملائنا لتجعلنا اليوم من أبرز مراكز تنظيم المناسبات في الكويت.
                </p>
                <p>
                  على مدار أكثر من عشرين عاماً، خدمنا آلاف العائلات والشركات الكويتية في أسعد لحظاتهم — من حفلات الأعراس الفاخرة إلى مناسبات التخرج، ومن هدايا رمضان الراقية إلى الدروع التكريمية للمؤسسات الكبرى.
                </p>
                <p>
                  نؤمن أن كل مناسبة تستحق لمسة فريدة، ولذلك نضع كل خبرتنا وشغفنا في كل تفصيل صغير لنضمن أن تكون لحظاتكم لا تُنسى.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <div className="flex items-center gap-2 text-sm" style={{ color: "#9A8060" }}>
                  <MapPin className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  <span>الفحيحيل، الكويت</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#9A8060" }}>
                  <Phone className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  <span dir="ltr">+965 22675826</span>
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: "#9A8060" }}>
                  <Instagram className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  <span>@badercenterco</span>
                </div>
              </div>
            </div>

            {/* Values card */}
            <div className="space-y-4">
              {[
                { icon: "🌟", title: "الجودة أولاً", desc: "نستخدم أفضل المواد والخامات لضمان منتجات تليق بمناسباتكم الفاخرة" },
                { icon: "🤝", title: "خدمة شخصية", desc: "نتعامل مع كل عميل باهتمام فردي لنفهم احتياجاته ونتجاوز توقعاته" },
                { icon: "⚡", title: "الالتزام بالمواعيد", desc: "نلتزم بالتسليم في الوقت المحدد لأن مناسباتكم لا تحتمل التأخير" },
                { icon: "💡", title: "الإبداع المستمر", desc: "نواكب أحدث الاتجاهات ونقدم أفكاراً مبتكرة تميز مناسباتكم" },
              ].map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="flex gap-4 p-4 rounded-xl border"
                  style={{ background: "#1A1508", borderColor: "#2A2010" }}
                >
                  <span className="text-2xl flex-shrink-0">{icon}</span>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: "#C9A84C" }}>{title}</h3>
                    <p className="text-sm" style={{ color: "#9A8060" }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: "#110E08" }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 text-xs px-3 py-1" style={{ background: "#1A1508", color: "#C9A84C", border: "1px solid #2A2010" }}>
              مسيرتنا
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
              محطات في رحلة التميز
            </h2>
          </div>

          <div className="relative">
            {/* Center line */}
            <div
              className="absolute right-1/2 top-0 bottom-0 w-px hidden md:block"
              style={{ background: "linear-gradient(to bottom, transparent, #C9A84C 20%, #C9A84C 80%, transparent)", transform: "translateX(50%)" }}
            />

            <div className="space-y-8">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex items-center gap-6 ${i % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"} flex-row-reverse`}
                >
                  {/* Content */}
                  <div className="flex-1 md:text-right">
                    <div
                      className="p-5 rounded-2xl border"
                      style={{ background: "#1A1508", borderColor: "#2A2010" }}
                    >
                      <div className="text-sm font-bold mb-1" style={{ color: "#C9A84C" }}>{m.year}</div>
                      <h3 className="font-bold mb-2" style={{ color: "#D4C4A0" }}>{m.title}</h3>
                      <p className="text-sm" style={{ color: "#9A8060" }}>{m.desc}</p>
                    </div>
                  </div>

                  {/* Dot */}
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 border-2 z-10"
                    style={{ background: "#C9A84C", borderColor: "#0D0B08" }}
                  />

                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <Badge className="mb-4 text-xs px-3 py-1" style={{ background: "#1A1508", color: "#C9A84C", border: "1px solid #2A2010" }}>
              فريقنا
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
              العقول المبدعة خلف كل مناسبة
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map(({ name, role, emoji, desc }) => (
              <div
                key={name}
                className="text-center p-6 rounded-2xl border group hover:border-[#C9A84C] transition-all duration-300"
                style={{ background: "#1A1508", borderColor: "#2A2010" }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4 border"
                  style={{ background: "#0D0B08", borderColor: "#2A2010" }}
                >
                  {emoji}
                </div>
                <h3 className="font-bold mb-1" style={{ color: "#D4C4A0" }}>{name}</h3>
                <p className="text-xs mb-3" style={{ color: "#C9A84C" }}>{role}</p>
                <p className="text-sm leading-relaxed" style={{ color: "#9A8060" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      {testimonials.length > 0 && (
        <section className="py-20 px-4" style={{ background: "#110E08" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <Badge className="mb-4 text-xs px-3 py-1" style={{ background: "#1A1508", color: "#C9A84C", border: "1px solid #2A2010" }}>
                آراء العملاء
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
                ماذا يقول عملاؤنا
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="p-6 rounded-2xl border flex flex-col"
                  style={{ background: "#1A1508", borderColor: "#2A2010" }}
                >
                  {/* Quote mark */}
                  <div className="text-4xl mb-3 leading-none" style={{ color: "#C9A84C", opacity: 0.4 }}>"</div>

                  <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "#C4B090" }}>
                    {t.text}
                  </p>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t" style={{ borderColor: "#2A2010" }}>
                    {/* Avatar */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border overflow-hidden"
                      style={{ background: "#0D0B08", borderColor: "#2A2010" }}
                    >
                      {t.avatarUrl ? (
                        <img src={t.avatarUrl} alt={t.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{t.name.charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: "#D4C4A0" }}>{t.name}</div>
                      {t.position && (
                        <div className="text-xs truncate" style={{ color: "#9A8060" }}>{t.position}</div>
                      )}
                    </div>
                    <StarRating rating={t.rating} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, #C9A84C, transparent)" }} />
            <span className="text-2xl">✦</span>
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, #C9A84C, transparent)" }} />
          </div>

          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#C9A84C", fontFamily: "'Amiri', serif" }}>
            هل أنت مستعد لمناسبة لا تُنسى؟
          </h2>
          <p className="mb-8 text-base" style={{ color: "#9A8060" }}>
            تواصل معنا اليوم ودعنا نحوّل مناسبتك إلى تجربة استثنائية تبقى في الذاكرة
          </p>

          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/request">
              <Button
                size="lg"
                className="px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105"
                style={{ background: "linear-gradient(135deg, #C9A84C, #B89050)", color: "#0D0B08" }}
              >
                اطلب خدمة الآن
              </Button>
            </Link>
            <a
              href="https://wa.me/96522675826"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-3 text-base font-semibold rounded-full transition-all duration-300 hover:scale-105"
                style={{ borderColor: "#C9A84C", color: "#C9A84C", background: "transparent" }}
              >
                تواصل عبر واتساب
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
