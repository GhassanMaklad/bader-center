/**
 * AI Image Enhancer — صفحة تحسين الصور بالذكاء الاصطناعي
 * Features:
 *  - Upload an image
 *  - Choose enhancement mode (quality / background removal / product)
 *  - Show animated before/after slider comparison
 *  - Download the enhanced image
 */
import { useRef, useState, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Upload,
  Sparkles,
  Download,
  RefreshCw,
  ImageIcon,
  Wand2,
  Eraser,
  ShoppingBag,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Mode = "quality" | "background_remove" | "product";

interface ModeOption {
  id: Mode;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const MODES: ModeOption[] = [
  {
    id: "quality",
    label: "تحسين الجودة",
    description: "حدّة أعلى، ألوان أفضل، تفاصيل أوضح",
    icon: <Wand2 size={20} />,
    color: "#9C7A3C",
  },
  {
    id: "background_remove",
    label: "إزالة الخلفية",
    description: "خلفية بيضاء نظيفة للمنتجات",
    icon: <Eraser size={20} />,
    color: "#5C7E60",
  },
  {
    id: "product",
    label: "صورة منتج احترافية",
    description: "إضاءة، حدة، وألوان مثالية للتجارة",
    icon: <ShoppingBag size={20} />,
    color: "#6B5EA8",
  },
];

// ─── Before/After Slider ──────────────────────────────────────────────────────
function BeforeAfterSlider({
  before,
  after,
}: {
  before: string;
  after: string;
}) {
  const [sliderX, setSliderX] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updateSlider = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
    setSliderX(pct);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: "4/3", cursor: "col-resize", userSelect: "none" }}
      onMouseMove={(e) => { if (dragging.current) updateSlider(e.clientX); }}
      onMouseDown={(e) => { dragging.current = true; updateSlider(e.clientX); }}
      onMouseUp={() => { dragging.current = false; }}
      onMouseLeave={() => { dragging.current = false; }}
      onTouchMove={(e) => updateSlider(e.touches[0].clientX)}
      onTouchStart={(e) => updateSlider(e.touches[0].clientX)}
    >
      {/* After image (full width, underneath) */}
      <img
        src={after}
        alt="بعد التحسين"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before image (clipped to left portion) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderX}%` }}
      >
        <img
          src={before}
          alt="قبل التحسين"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${10000 / sliderX}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 z-10"
        style={{ left: `${sliderX}%`, background: "#fff", boxShadow: "0 0 8px rgba(0,0,0,0.5)" }}
      >
        {/* Handle circle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.3)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 5l-4 5 4 5M13 5l4 5-4 5" stroke="#9C7A3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div
        className="absolute bottom-3 right-3 text-xs font-bold px-2 py-1 rounded-full"
        style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: "'Cairo', sans-serif" }}
      >
        بعد ✨
      </div>
      <div
        className="absolute bottom-3 left-3 text-xs font-bold px-2 py-1 rounded-full"
        style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontFamily: "'Cairo', sans-serif" }}
      >
        قبل
      </div>
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────
function UploadZone({ onFile }: { onFile: (file: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [draggingOver, setDraggingOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onFile(file);
  };

  return (
    <div
      className="w-full rounded-2xl flex flex-col items-center justify-center gap-4 transition-all duration-200 cursor-pointer"
      style={{
        border: `2px dashed ${draggingOver ? "#9C7A3C" : "rgba(156,122,60,0.35)"}`,
        background: draggingOver ? "rgba(156,122,60,0.06)" : "#FAF7F2",
        minHeight: "220px",
        padding: "2rem",
      }}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDraggingOver(true); }}
      onDragLeave={() => setDraggingOver(false)}
      onDrop={handleDrop}
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center"
        style={{ background: "rgba(156,122,60,0.1)" }}
      >
        <Upload size={28} style={{ color: "#9C7A3C" }} />
      </div>
      <div className="text-center" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <p className="font-bold text-base" style={{ color: "#2C2416" }}>
          اسحب صورتك هنا أو اضغط للاختيار
        </p>
        <p className="text-sm mt-1" style={{ color: "#8A7560" }}>
          PNG, JPG, WEBP — حجم أقصى 10MB
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
        }}
      />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function ImageEnhancerPage() {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<Mode>("quality");
  const [step, setStep] = useState<"upload" | "ready" | "enhancing" | "done">("upload");

  const uploadMutation = trpc.imageAI.uploadOriginal.useMutation();
  const enhanceMutation = trpc.imageAI.enhance.useMutation();

  // Convert file to base64 helper
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleFile = (file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الصورة يتجاوز 10MB");
      return;
    }
    setOriginalFile(file);
    setOriginalUrl(URL.createObjectURL(file));
    setEnhancedUrl(null);
    setStep("ready");
  };

  const handleEnhance = async () => {
    if (!originalFile) return;
    setStep("enhancing");
    setEnhancedUrl(null);

    try {
      // 1. Upload original to S3
      const base64 = await toBase64(originalFile);
      const { url: uploadedUrl } = await uploadMutation.mutateAsync({
        base64,
        mimeType: originalFile.type || "image/jpeg",
        filename: originalFile.name || "original.jpg",
      });

      // 2. Enhance via AI
      const { enhancedUrl: resultUrl } = await enhanceMutation.mutateAsync({
        imageUrl: uploadedUrl,
        mode: selectedMode,
      });

      setEnhancedUrl(resultUrl);
      setStep("done");
      toast.success("تم تحسين الصورة بنجاح!");
    } catch (err: any) {
      toast.error(err?.message || "حدث خطأ أثناء التحسين");
      setStep("ready");
    }
  };

  const handleReset = () => {
    setOriginalFile(null);
    setOriginalUrl(null);
    setEnhancedUrl(null);
    setStep("upload");
  };

  const handleDownload = () => {
    if (!enhancedUrl) return;
    const a = document.createElement("a");
    a.href = enhancedUrl;
    a.download = `enhanced-${Date.now()}.png`;
    a.target = "_blank";
    a.click();
  };

  const isProcessing = step === "enhancing";

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ background: "#F7F3EC", direction: "rtl" }}
    >
      <div className="max-w-4xl mx-auto">

        {/* ─── Header ─── */}
        <div className="text-center mb-10">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
            style={{ background: "rgba(156,122,60,0.12)", color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}
          >
            <Sparkles size={14} />
            مدعوم بالذكاء الاصطناعي
          </div>
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
          >
            محسّن الصور
          </h1>
          <p className="text-base" style={{ color: "#7A6A50", fontFamily: "'Cairo', sans-serif" }}>
            ارفع صورة واختر نوع التحسين — النتيجة خلال ثوانٍ
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ─── Left Panel: Controls ─── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Mode selector */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "#fff", border: "1px solid rgba(156,122,60,0.15)" }}
            >
              <h2
                className="font-bold text-base mb-4"
                style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}
              >
                نوع التحسين
              </h2>
              <div className="flex flex-col gap-3">
                {MODES.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className="flex items-start gap-3 p-3 rounded-xl text-right transition-all duration-200"
                    style={{
                      background: selectedMode === mode.id ? `${mode.color}15` : "transparent",
                      border: `1.5px solid ${selectedMode === mode.id ? mode.color : "rgba(156,122,60,0.15)"}`,
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: `${mode.color}20`, color: mode.color }}
                    >
                      {mode.icon}
                    </div>
                    <div>
                      <p
                        className="font-semibold text-sm"
                        style={{ color: selectedMode === mode.id ? mode.color : "#2C2416", fontFamily: "'Cairo', sans-serif" }}
                      >
                        {mode.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                        {mode.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              {step !== "upload" && (
                <Button
                  onClick={handleEnhance}
                  disabled={isProcessing}
                  className="w-full h-12 text-base font-bold rounded-xl flex items-center justify-center gap-2"
                  style={{ background: "#9C7A3C", color: "#fff", fontFamily: "'Cairo', sans-serif" }}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      جاري التحسين...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {step === "done" ? "تحسين مرة أخرى" : "ابدأ التحسين"}
                    </>
                  )}
                </Button>
              )}

              {step === "done" && enhancedUrl && (
                <Button
                  onClick={handleDownload}
                  variant="outline"
                  className="w-full h-12 text-base font-bold rounded-xl flex items-center justify-center gap-2"
                  style={{ borderColor: "#9C7A3C", color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}
                >
                  <Download size={18} />
                  تحميل الصورة المحسّنة
                </Button>
              )}

              {step !== "upload" && (
                <Button
                  onClick={handleReset}
                  variant="ghost"
                  className="w-full h-10 text-sm rounded-xl"
                  style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}
                >
                  رفع صورة جديدة
                </Button>
              )}
            </div>

            {/* Processing indicator */}
            {isProcessing && (
              <div
                className="rounded-2xl p-4 text-center"
                style={{ background: "rgba(156,122,60,0.08)", border: "1px solid rgba(156,122,60,0.2)" }}
              >
                <div className="flex justify-center mb-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full mx-1"
                      style={{
                        background: "#9C7A3C",
                        animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium" style={{ color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}>
                  الذكاء الاصطناعي يعمل على تحسين صورتك...
                </p>
                <p className="text-xs mt-1" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                  قد يستغرق ذلك 10–30 ثانية
                </p>
              </div>
            )}
          </div>

          {/* ─── Right Panel: Preview ─── */}
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", border: "1px solid rgba(156,122,60,0.15)", minHeight: "360px" }}
            >
              {step === "upload" && (
                <div className="p-6">
                  <UploadZone onFile={handleFile} />
                </div>
              )}

              {(step === "ready" || step === "enhancing") && originalUrl && (
                <div className="p-6">
                  <p
                    className="text-sm font-medium mb-3"
                    style={{ color: "#7A6A50", fontFamily: "'Cairo', sans-serif" }}
                  >
                    الصورة الأصلية
                  </p>
                  <div className="rounded-xl overflow-hidden" style={{ aspectRatio: "4/3" }}>
                    <img
                      src={originalUrl}
                      alt="الصورة الأصلية"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isProcessing && (
                    <div
                      className="mt-4 rounded-xl overflow-hidden relative"
                      style={{ aspectRatio: "4/3", background: "#F0EBE1" }}
                    >
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                        <div
                          className="w-16 h-16 rounded-full flex items-center justify-center"
                          style={{ background: "rgba(156,122,60,0.1)" }}
                        >
                          <Sparkles size={28} style={{ color: "#9C7A3C" }} className="animate-pulse" />
                        </div>
                        <p className="text-sm font-medium" style={{ color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}>
                          جاري توليد الصورة المحسّنة...
                        </p>
                      </div>
                      {/* Shimmer overlay */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: "linear-gradient(90deg, transparent 0%, rgba(156,122,60,0.3) 50%, transparent 100%)",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {step === "done" && originalUrl && enhancedUrl && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <p
                      className="text-sm font-bold"
                      style={{ color: "#2C2416", fontFamily: "'Cairo', sans-serif" }}
                    >
                      اسحب المقسّم للمقارنة
                    </p>
                    <div
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(92,126,96,0.12)", color: "#5C7E60", fontFamily: "'Cairo', sans-serif" }}
                    >
                      <Sparkles size={12} />
                      تم التحسين
                    </div>
                  </div>
                  <BeforeAfterSlider before={originalUrl} after={enhancedUrl} />

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div
                      className="rounded-xl p-3 text-center"
                      style={{ background: "#FAF7F2", border: "1px solid rgba(156,122,60,0.12)" }}
                    >
                      <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>الوضع المستخدم</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: "#9C7A3C", fontFamily: "'Cairo', sans-serif" }}>
                        {MODES.find((m) => m.id === selectedMode)?.label}
                      </p>
                    </div>
                    <div
                      className="rounded-xl p-3 text-center"
                      style={{ background: "#FAF7F2", border: "1px solid rgba(156,122,60,0.12)" }}
                    >
                      <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>الحالة</p>
                      <p className="font-bold text-sm mt-0.5" style={{ color: "#5C7E60", fontFamily: "'Cairo', sans-serif" }}>
                        ✓ جاهزة للتحميل
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {step === "upload" && (
                <div className="px-6 pb-6">
                  <div
                    className="rounded-xl p-4"
                    style={{ background: "#FAF7F2", border: "1px solid rgba(156,122,60,0.1)" }}
                  >
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: "#7A6A50", fontFamily: "'Cairo', sans-serif" }}
                    >
                      أمثلة على الاستخدام
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {[
                        "صور المنتجات قبل رفعها للكتالوج",
                        "صور البوثات والستاندات",
                        "صور الدروع والهدايا",
                      ].map((ex) => (
                        <div key={ex} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#9C7A3C" }} />
                          <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>{ex}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
