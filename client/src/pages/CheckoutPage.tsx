import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingBag, ArrowRight, MessageCircle, Trash2, Plus, Minus, CheckCircle2 } from "lucide-react";

const WHATSAPP_NUMBER = "96522675826"; // Bader Center WhatsApp

export default function CheckoutPage() {
  const { items, totalAmount, removeItem, updateQty, clearCart } = useCart();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Save order to DB for admin tracking
  const saveOrder = trpc.orders.saveOrder.useMutation();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = "الاسم مطلوب";
    if (!form.customerPhone.trim()) newErrors.customerPhone = "رقم الهاتف مطلوب";
    else if (!/^\+?[\d\s\-]{7,}$/.test(form.customerPhone))
      newErrors.customerPhone = "رقم الهاتف غير صحيح";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildWhatsAppMessage = () => {
    const lines: string[] = [];
    lines.push("🛒 *طلب جديد من موقع مركز بدر*");
    lines.push("─────────────────────");
    lines.push(`👤 *الاسم:* ${form.customerName}`);
    lines.push(`📞 *الهاتف:* ${form.customerPhone}`);
    lines.push("─────────────────────");
    lines.push("📦 *المنتجات:*");
    items.forEach((item) => {
      lines.push(`• ${item.name} × ${item.qty} — ${(item.price * item.qty).toFixed(3)} د.ك`);
    });
    lines.push("─────────────────────");
    lines.push(`💰 *الإجمالي: ${totalAmount.toFixed(3)} د.ك*`);
    if (form.notes.trim()) {
      lines.push("─────────────────────");
      lines.push(`📝 *ملاحظات:* ${form.notes}`);
    }
    lines.push("─────────────────────");
    lines.push("أرجو تأكيد الطلب وإرسال رابط الدفع. شكراً 🙏");
    return lines.join("\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    // Save order to DB silently (don't block on failure)
    saveOrder.mutate({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      totalAmount: totalAmount,
      cartItems: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
      notes: form.notes || undefined,
    });

    // Build WhatsApp URL and open it
    const message = buildWhatsAppMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");

    // Clear cart and show confirmation
    clearCart();
    setSubmitted(true);
  };

  // ── Empty cart state ──────────────────────────────────────────────────────
  if (items.length === 0 && !submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6"
        style={{ background: "#F2EDE4", direction: "rtl" }}
      >
        <ShoppingBag size={64} style={{ color: "#D8D0C0" }} />
        <h2 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
          السلة فارغة
        </h2>
        <p style={{ color: "#6B5D4F" }}>أضف منتجات من الكتالوج أولاً</p>
        <button
          onClick={() => navigate("/catalog")}
          className="px-8 py-3 rounded-full font-bold transition-all hover:opacity-90"
          style={{ background: "#9C7A3C", color: "#F7F2E8" }}
        >
          تصفح الكتالوج
        </button>
      </div>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center"
        style={{ background: "#F2EDE4", direction: "rtl" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "#E8F5E9" }}
        >
          <CheckCircle2 size={44} style={{ color: "#4CAF50" }} />
        </div>
        <h2 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
          تم إرسال طلبك!
        </h2>
        <p className="max-w-sm" style={{ color: "#6B5D4F" }}>
          تم فتح واتساب مع تفاصيل طلبك. سيقوم فريقنا بمراجعة الطلب والتواصل معك لتأكيده وإرسال رابط الدفع.
        </p>
        <div
          className="rounded-2xl p-4 max-w-sm w-full text-sm"
          style={{ background: "#EDE8DF", color: "#6B5D4F" }}
        >
          <p className="font-semibold mb-1" style={{ color: "#2C2416" }}>
            الخطوات التالية:
          </p>
          <ol className="space-y-1 list-decimal list-inside text-right">
            <li>أرسل الرسالة التي ظهرت في واتساب</li>
            <li>سيتواصل معك فريق مركز بدر لتأكيد الطلب</li>
            <li>ستصلك رابط الدفع بعد الموافقة</li>
          </ol>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 rounded-full font-bold transition-all hover:opacity-90"
            style={{ background: "#9C7A3C", color: "#F7F2E8" }}
          >
            الرئيسية
          </button>
          <button
            onClick={() => navigate("/catalog")}
            className="px-6 py-2 rounded-full font-bold transition-all hover:opacity-90"
            style={{ background: "#2C2416", color: "#F7F2E8" }}
          >
            تصفح المزيد
          </button>
        </div>
      </div>
    );
  }

  // ── Main checkout form ────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{ background: "#F2EDE4", direction: "rtl" }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate("/catalog")}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="رجوع"
          >
            <ArrowRight size={20} style={{ color: "#2C2416" }} />
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
              إتمام الطلب
            </h1>
            <p className="text-sm" style={{ color: "#6B5D4F" }}>
              أدخل بياناتك وسيُرسل طلبك مباشرة عبر واتساب
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#2C2416" }}>
              ملخص الطلب
            </h2>
            <div className="rounded-2xl p-4 space-y-3" style={{ background: "#EDE8DF" }}>
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 rounded-xl"
                  style={{ background: "#F7F2E8" }}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-14 h-14 object-cover rounded-lg flex-shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/56x56?text=صورة";
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "#2C2416" }}>
                      {item.name}
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#9C7A3C" }}>
                      {item.price.toFixed(3)} د.ك
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => updateQty(item.productId, item.qty - 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/10"
                        style={{ border: "1px solid #D8D0C0" }}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-sm font-bold">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.productId, item.qty + 1)}
                        className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-black/10"
                        style={{ border: "1px solid #D8D0C0" }}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="p-1 hover:text-red-500 transition-colors"
                      style={{ color: "#9C7A3C" }}
                    >
                      <Trash2 size={14} />
                    </button>
                    <span className="text-sm font-bold" style={{ color: "#2C2416" }}>
                      {(item.price * item.qty).toFixed(3)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div
                className="flex justify-between items-center pt-3 border-t"
                style={{ borderColor: "#D8D0C0" }}
              >
                <span className="font-bold" style={{ color: "#2C2416" }}>
                  الإجمالي التقديري
                </span>
                <span className="text-xl font-bold" style={{ color: "#9C7A3C" }}>
                  {totalAmount.toFixed(3)} د.ك
                </span>
              </div>
            </div>

            {/* WhatsApp info note */}
            <div
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: "#E8F5E9" }}
            >
              <MessageCircle size={20} style={{ color: "#25D366", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: "#1B5E20" }}>
                  الطلب عبر واتساب
                </p>
                <p className="text-xs mt-1" style={{ color: "#388E3C" }}>
                  سيُرسل طلبك لفريق مركز بدر عبر واتساب. بعد مراجعة الطلب والموافقة عليه، ستصلك رابط الدفع.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          <div>
            <h2 className="text-lg font-bold mb-4" style={{ color: "#2C2416" }}>
              بياناتك
            </h2>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 space-y-4"
              style={{ background: "#EDE8DF" }}
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#2C2416" }}>
                  الاسم الكامل <span style={{ color: "#9C7A3C" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setForm((f) => ({ ...f, customerName: e.target.value }))}
                  placeholder="أدخل اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                  style={{
                    background: "#F7F2E8",
                    border: `1px solid ${errors.customerName ? "#ef4444" : "#D8D0C0"}`,
                    color: "#2C2416",
                  }}
                />
                {errors.customerName && (
                  <p className="text-xs mt-1 text-red-500">{errors.customerName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#2C2416" }}>
                  رقم الهاتف (واتساب) <span style={{ color: "#9C7A3C" }}>*</span>
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) => setForm((f) => ({ ...f, customerPhone: e.target.value }))}
                  placeholder="مثال: 96512345678"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                  style={{
                    background: "#F7F2E8",
                    border: `1px solid ${errors.customerPhone ? "#ef4444" : "#D8D0C0"}`,
                    color: "#2C2416",
                  }}
                  dir="ltr"
                />
                {errors.customerPhone && (
                  <p className="text-xs mt-1 text-red-500">{errors.customerPhone}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: "#2C2416" }}>
                  ملاحظات{" "}
                  <span className="text-xs font-normal" style={{ color: "#6B5D4F" }}>
                    (اختياري)
                  </span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                  placeholder="أي تفاصيل إضافية عن طلبك..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm resize-none"
                  style={{
                    background: "#F7F2E8",
                    border: "1px solid #D8D0C0",
                    color: "#2C2416",
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saveOrder.isPending}
                className="w-full py-4 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: "#25D366", color: "#fff" }}
              >
                <MessageCircle size={20} />
                {saveOrder.isPending ? "جاري الإرسال..." : "إرسال الطلب عبر واتساب"}
              </button>

              <p className="text-xs text-center" style={{ color: "#6B5D4F" }}>
                سيُفتح تطبيق واتساب تلقائياً مع تفاصيل طلبك
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
