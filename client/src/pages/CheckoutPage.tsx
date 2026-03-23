import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ShoppingBag, ArrowRight, CreditCard, Trash2, Plus, Minus } from "lucide-react";

export default function CheckoutPage() {
  const { items, totalAmount, removeItem, updateQty, clearCart } = useCart();
  const [, navigate] = useLocation();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const initiate = trpc.orders.initiatePayment.useMutation({
    onSuccess: (data) => {
      clearCart();
      // Redirect to MyFatoorah payment page
      window.location.href = data.invoiceUrl;
    },
    onError: (err) => {
      alert(`خطأ في الدفع: ${err.message}`);
    },
  });

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.customerName.trim()) newErrors.customerName = "الاسم مطلوب";
    if (!form.customerPhone.trim()) newErrors.customerPhone = "رقم الهاتف مطلوب";
    else if (!/^\+?[\d\s\-]{7,}$/.test(form.customerPhone))
      newErrors.customerPhone = "رقم الهاتف غير صحيح";
    if (form.customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
      newErrors.customerEmail = "البريد الإلكتروني غير صحيح";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (items.length === 0) return;

    initiate.mutate({
      customerName: form.customerName,
      customerEmail: form.customerEmail || undefined,
      customerPhone: form.customerPhone,
      cartItems: items.map((i) => ({
        productId: i.productId,
        name: i.name,
        qty: i.qty,
        price: i.price,
      })),
      notes: form.notes || undefined,
      origin: window.location.origin,
    });
  };

  if (items.length === 0) {
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
              أدخل بياناتك لإتمام عملية الدفع
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div>
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "#2C2416" }}
            >
              ملخص الطلب
            </h2>
            <div
              className="rounded-2xl p-4 space-y-3"
              style={{ background: "#EDE8DF" }}
            >
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
                    <p
                      className="font-semibold text-sm truncate"
                      style={{ color: "#2C2416" }}
                    >
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
                  الإجمالي
                </span>
                <span className="text-xl font-bold" style={{ color: "#9C7A3C" }}>
                  {totalAmount.toFixed(3)} د.ك
                </span>
              </div>
            </div>

            {/* Payment methods note */}
            <div
              className="mt-4 p-4 rounded-xl flex items-start gap-3"
              style={{ background: "#EDE8DF" }}
            >
              <CreditCard size={20} style={{ color: "#9C7A3C", flexShrink: 0, marginTop: 2 }} />
              <div>
                <p className="font-semibold text-sm" style={{ color: "#2C2416" }}>
                  طرق الدفع المتاحة
                </p>
                <p className="text-xs mt-1" style={{ color: "#6B5D4F" }}>
                  KNET · Visa · Mastercard · Apple Pay
                </p>
                <p className="text-xs mt-1" style={{ color: "#6B5D4F" }}>
                  الدفع آمن عبر بوابة MyFatoorah المعتمدة
                </p>
              </div>
            </div>
          </div>

          {/* Customer Info Form */}
          <div>
            <h2
              className="text-lg font-bold mb-4"
              style={{ color: "#2C2416" }}
            >
              بيانات العميل
            </h2>
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 space-y-4"
              style={{ background: "#EDE8DF" }}
            >
              {/* Name */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ color: "#2C2416" }}
                >
                  الاسم الكامل <span style={{ color: "#9C7A3C" }}>*</span>
                </label>
                <input
                  type="text"
                  value={form.customerName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerName: e.target.value }))
                  }
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
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ color: "#2C2416" }}
                >
                  رقم الهاتف <span style={{ color: "#9C7A3C" }}>*</span>
                </label>
                <input
                  type="tel"
                  value={form.customerPhone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerPhone: e.target.value }))
                  }
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

              {/* Email */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ color: "#2C2416" }}
                >
                  البريد الإلكتروني{" "}
                  <span className="text-xs font-normal" style={{ color: "#6B5D4F" }}>
                    (اختياري)
                  </span>
                </label>
                <input
                  type="email"
                  value={form.customerEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customerEmail: e.target.value }))
                  }
                  placeholder="example@email.com"
                  className="w-full px-4 py-3 rounded-xl outline-none transition-all text-sm"
                  style={{
                    background: "#F7F2E8",
                    border: `1px solid ${errors.customerEmail ? "#ef4444" : "#D8D0C0"}`,
                    color: "#2C2416",
                  }}
                  dir="ltr"
                />
                {errors.customerEmail && (
                  <p className="text-xs mt-1 text-red-500">{errors.customerEmail}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  className="block text-sm font-semibold mb-1"
                  style={{ color: "#2C2416" }}
                >
                  ملاحظات{" "}
                  <span className="text-xs font-normal" style={{ color: "#6B5D4F" }}>
                    (اختياري)
                  </span>
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="أي تعليمات خاصة بالطلب..."
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
                disabled={initiate.isPending}
                className="w-full py-4 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ background: "#2C2416", color: "#F7F2E8" }}
              >
                {initiate.isPending ? (
                  <>
                    <span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                    جارٍ إنشاء الفاتورة...
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />
                    الدفع الآن — {totalAmount.toFixed(3)} د.ك
                  </>
                )}
              </button>

              <p className="text-xs text-center" style={{ color: "#6B5D4F" }}>
                بالضغط على "الدفع الآن" ستنتقل إلى صفحة الدفع الآمنة
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
