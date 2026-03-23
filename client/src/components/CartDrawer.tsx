import { useCart } from "@/contexts/CartContext";
import { useLocation } from "wouter";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, totalAmount, totalItems, removeItem, updateQty, clearCart } = useCart();
  const [, navigate] = useLocation();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-full max-w-sm z-50 flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ background: "#F7F2E8", direction: "rtl" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: "#D8D0C0" }}
        >
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} style={{ color: "#9C7A3C" }} />
            <span className="font-bold text-lg" style={{ color: "#2C2416" }}>
              سلة التسوق
            </span>
            {totalItems > 0 && (
              <span
                className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                style={{ background: "#9C7A3C", color: "#F7F2E8" }}
              >
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
            aria-label="إغلاق"
          >
            <X size={20} style={{ color: "#2C2416" }} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} style={{ color: "#D8D0C0" }} />
              <p style={{ color: "#9C7A3C" }} className="font-medium">
                السلة فارغة
              </p>
              <p className="text-sm" style={{ color: "#6B5D4F" }}>
                أضف منتجات من الكتالوج لتبدأ طلبك
              </p>
              <button
                onClick={() => { onClose(); navigate("/catalog"); }}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all hover:opacity-90"
                style={{ background: "#9C7A3C", color: "#F7F2E8" }}
              >
                تصفح الكتالوج
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-3 p-3 rounded-xl"
                style={{ background: "#EDE8DF" }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/64x64?text=صورة";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold text-sm leading-tight truncate"
                    style={{ color: "#2C2416" }}
                  >
                    {item.name}
                  </p>
                  <p className="text-sm font-bold mt-1" style={{ color: "#9C7A3C" }}>
                    {item.price.toFixed(3)} د.ك
                  </p>
                  {/* Qty controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQty(item.productId, item.qty - 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
                      style={{ border: "1px solid #D8D0C0" }}
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-sm font-bold w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.qty + 1)}
                      className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/10 transition-colors"
                      style={{ border: "1px solid #D8D0C0" }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="self-start p-1 hover:text-red-500 transition-colors"
                  style={{ color: "#9C7A3C" }}
                  aria-label="حذف"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="px-4 py-4 border-t space-y-3" style={{ borderColor: "#D8D0C0" }}>
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{ color: "#6B5D4F" }}>
                الإجمالي
              </span>
              <span className="font-bold text-lg" style={{ color: "#2C2416" }}>
                {totalAmount.toFixed(3)} د.ك
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 rounded-full font-bold text-base transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#2C2416", color: "#F7F2E8" }}
            >
              إتمام الطلب والدفع
            </button>
            <button
              onClick={clearCart}
              className="w-full py-2 text-sm transition-colors hover:opacity-70"
              style={{ color: "#9C7A3C" }}
            >
              مسح السلة
            </button>
          </div>
        )}
      </div>
    </>
  );
}
