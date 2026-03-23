import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function PaymentCallbackPage() {
  const [location, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const paymentId = params.get("paymentId") ?? "";
  const orderIdStr = params.get("orderId") ?? "";
  const orderId = parseInt(orderIdStr, 10);

  const [status, setStatus] = useState<"loading" | "paid" | "failed">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const verify = trpc.orders.verifyPayment.useMutation({
    onSuccess: (data) => {
      setStatus(data.status === "paid" ? "paid" : "failed");
    },
    onError: (err) => {
      setStatus("failed");
      setErrorMsg(err.message);
    },
  });

  useEffect(() => {
    if (!paymentId || !orderId || isNaN(orderId)) {
      setStatus("failed");
      setErrorMsg("معلومات الدفع غير مكتملة");
      return;
    }
    verify.mutate({ paymentId, orderId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#F2EDE4", direction: "rtl" }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center space-y-6"
        style={{ background: "#EDE8DF" }}
      >
        {status === "loading" && (
          <>
            <Loader2
              size={64}
              className="mx-auto animate-spin"
              style={{ color: "#9C7A3C" }}
            />
            <h2 className="text-xl font-bold" style={{ color: "#2C2416" }}>
              جارٍ التحقق من الدفع...
            </h2>
            <p className="text-sm" style={{ color: "#6B5D4F" }}>
              يرجى الانتظار، لا تغلق هذه الصفحة
            </p>
          </>
        )}

        {status === "paid" && (
          <>
            <CheckCircle
              size={72}
              className="mx-auto"
              style={{ color: "#22c55e" }}
            />
            <h2 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
              تم الدفع بنجاح! 🎉
            </h2>
            <p className="text-sm" style={{ color: "#6B5D4F" }}>
              شكراً لك على طلبك. سيتواصل معك فريق مركز بدر قريباً لتأكيد التفاصيل.
            </p>
            {orderId && (
              <p className="text-xs font-mono" style={{ color: "#9C7A3C" }}>
                رقم الطلب: #{orderId}
              </p>
            )}
            <div className="space-y-3 pt-2">
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
          </>
        )}

        {status === "failed" && (
          <>
            <XCircle
              size={72}
              className="mx-auto"
              style={{ color: "#ef4444" }}
            />
            <h2 className="text-2xl font-bold" style={{ color: "#2C2416" }}>
              فشل الدفع
            </h2>
            <p className="text-sm" style={{ color: "#6B5D4F" }}>
              {errorMsg || "لم تتم عملية الدفع بنجاح. يرجى المحاولة مجدداً أو التواصل معنا."}
            </p>
            <div className="space-y-3 pt-2">
              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-3 rounded-full font-bold transition-all hover:opacity-90"
                style={{ background: "#9C7A3C", color: "#F7F2E8" }}
              >
                إعادة المحاولة
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
          </>
        )}
      </div>
    </div>
  );
}
