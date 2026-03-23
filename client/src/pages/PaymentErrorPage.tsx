import { useLocation } from "wouter";
import { XCircle } from "lucide-react";

export default function PaymentErrorPage() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("orderId");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F2EDE4", direction: "rtl" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center space-y-6"
        style={{ background: "#EDE8DF" }}
      >
        <XCircle size={72} className="mx-auto" style={{ color: "#ef4444" }} />
        <h2 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
          تم إلغاء الدفع
        </h2>
        <p className="text-sm" style={{ color: "#6B5D4F" }}>
          لم تكتمل عملية الدفع. يمكنك المحاولة مجدداً أو التواصل معنا.
        </p>
        {orderId && (
          <p className="text-xs font-mono" style={{ color: "#9C7A3C" }}>
            رقم الطلب: #{orderId}
          </p>
        )}
        <div className="space-y-3 pt-2">
          <button
            onClick={() => navigate("/checkout")}
            className="w-full py-3 rounded-full font-bold transition-all hover:opacity-90"
            style={{ background: "#9C7A3C", color: "#F7F2E8" }}
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3 rounded-full font-bold transition-all hover:opacity-90"
            style={{ background: "#2C2416", color: "#F7F2E8" }}
          >
            العودة للرئيسية
          </button>
          <a
            href="https://wa.me/96522675826"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 rounded-full font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "#25D366", color: "#fff", display: "flex" }}
          >
            تواصل معنا عبر واتساب
          </a>
        </div>
      </div>
    </div>
  );
}
