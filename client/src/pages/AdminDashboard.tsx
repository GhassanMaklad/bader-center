import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  Edit,
  Loader2,
  LogOut,
  Package,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

type Category = "gifts" | "shields" | "catering" | "occasions" | "calligraphy";

const CATEGORY_LABELS: Record<Category, string> = {
  gifts: "الهدايا والدزات",
  shields: "الدروع والتكريم",
  catering: "الكيترنج والبوثات",
  occasions: "المناسبات الخاصة",
  calligraphy: "الخط والنقش",
};

const CATEGORY_COLORS: Record<Category, string> = {
  gifts: "bg-pink-500/20 text-pink-300",
  shields: "bg-yellow-500/20 text-yellow-300",
  catering: "bg-blue-500/20 text-blue-300",
  occasions: "bg-purple-500/20 text-purple-300",
  calligraphy: "bg-green-500/20 text-green-300",
};

type ProductForm = {
  name: string;
  nameEn: string;
  category: Category;
  price: string;
  priceValue: number;
  priceNote: string;
  image: string;
  badge: string;
  badgeColor: string;
  description: string;
  rating: number;
  inStock: boolean;
  tags: string;
  sortOrder: number;
};

const emptyForm: ProductForm = {
  name: "",
  nameEn: "",
  category: "gifts",
  price: "",
  priceValue: 0,
  priceNote: "",
  image: "",
  badge: "",
  badgeColor: "#C9A84C",
  description: "",
  rating: 5,
  inStock: true,
  tags: "",
  sortOrder: 0,
};

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth();
  const [, navigate] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  const { data: products, refetch, isLoading } = trpc.products.list.useQuery();

  const createMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المنتج بنجاح");
      setDialogOpen(false);
      refetch();
    },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المنتج بنجاح");
      setDialogOpen(false);
      refetch();
    },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const deleteMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المنتج");
      refetch();
    },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const toggleMutation = trpc.products.toggleStock.useMutation({
    onSuccess: () => refetch(),
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl();
    }
    if (!loading && user && user.role !== "admin") {
      navigate("/");
    }
  }, [loading, user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0D0B08" }}>
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
      </div>
    );
  }

  if (!user || user.role !== "admin") return null;

  const filtered = (products ?? []).filter((p) => {
    const matchSearch =
      !search ||
      p.name.includes(search) ||
      (p.nameEn ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "all" || p.category === filterCategory;
    return matchSearch && matchCat;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  type ProductRow = NonNullable<typeof products>[number];
  const openEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      nameEn: p.nameEn ?? "",
      category: p.category as Category,
      price: p.price,
      priceValue: Number(p.priceValue ?? 0),
      priceNote: p.priceNote ?? "",
      image: p.image,
      badge: p.badge ?? "",
      badgeColor: p.badgeColor ?? "#C9A84C",
      description: p.description,
      rating: p.rating,
      inStock: p.inStock,
      tags: p.tags ?? "",
      sortOrder: p.sortOrder,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      priceNote: form.priceNote || null,
      badge: form.badge || null,
      badgeColor: form.badgeColor || null,
      tags: form.tags || null,
    };
    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: number, name: string) => {
    if (confirm(`هل أنت متأكد من حذف "${name}"؟`)) {
      deleteMutation.mutate({ id });
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div
      className="min-h-screen"
      style={{ background: "#0D0B08", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
          <div>
            <h1 className="text-lg font-bold text-yellow-400" style={{ fontFamily: "'Amiri', serif" }}>
              لوحة تحكم مركز بدر
            </h1>
            <p className="text-xs text-gray-400">إدارة كتالوج المنتجات</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{user.name ?? "المدير"}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => { await logout(); navigate("/"); }}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <LogOut className="w-4 h-4 ml-1" />
            خروج
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/")}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            عرض الموقع
          </Button>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "إجمالي المنتجات", value: products?.length ?? 0, icon: Package },
            { label: "متوفر", value: products?.filter(p => p.inStock).length ?? 0, icon: Star, color: "text-green-400" },
            { label: "غير متوفر", value: products?.filter(p => !p.inStock).length ?? 0, icon: Star, color: "text-red-400" },
            { label: "الفئات", value: 5, icon: ShieldCheck, color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} style={{ background: "#1a1508", border: "1px solid rgba(201,168,76,0.15)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color ?? "text-yellow-500"}`} />
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Input
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 text-right"
            style={{ background: "#1a1508", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger style={{ background: "#1a1508", borderColor: "rgba(201,168,76,0.3)", color: "#fff", width: "200px" }}>
              <SelectValue placeholder="كل الفئات" />
            </SelectTrigger>
            <SelectContent style={{ background: "#1a1508", borderColor: "rgba(201,168,76,0.3)" }}>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={openAdd}
            className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
          >
            <Plus className="w-4 h-4 ml-1" />
            إضافة منتج جديد
          </Button>
        </div>

        {/* Products Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "rgba(201,168,76,0.1)" }}>
                <tr>
                  <th className="text-right p-3 text-yellow-400 font-semibold">المنتج</th>
                  <th className="text-right p-3 text-yellow-400 font-semibold hidden md:table-cell">الفئة</th>
                  <th className="text-right p-3 text-yellow-400 font-semibold">السعر</th>
                  <th className="text-center p-3 text-yellow-400 font-semibold">الحالة</th>
                  <th className="text-center p-3 text-yellow-400 font-semibold">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, idx) => (
                  <tr
                    key={product.id}
                    style={{
                      background: idx % 2 === 0 ? "#0D0B08" : "#111008",
                      borderBottom: "1px solid rgba(201,168,76,0.08)",
                    }}
                  >
                    {/* Product Info */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          style={{ border: "1px solid rgba(201,168,76,0.2)" }}
                        />
                        <div>
                          <p className="font-semibold text-white text-sm">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.nameEn}</p>
                          {product.badge && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                              style={{ background: `${product.badgeColor}22`, color: product.badgeColor ?? "#C9A84C" }}
                            >
                              {product.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    {/* Category */}
                    <td className="p-3 hidden md:table-cell">
                      <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_COLORS[product.category as Category]}`}>
                        {CATEGORY_LABELS[product.category as Category]}
                      </span>
                    </td>
                    {/* Price */}
                    <td className="p-3">
                      <p className="text-yellow-400 font-semibold">{product.price}</p>
                      {product.priceNote && (
                        <p className="text-xs text-gray-500">{product.priceNote}</p>
                      )}
                    </td>
                    {/* Stock Toggle */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={product.inStock}
                          onCheckedChange={(val) =>
                            toggleMutation.mutate({ id: product.id, inStock: val })
                          }
                        />
                        <span className={`text-xs ${product.inStock ? "text-green-400" : "text-red-400"}`}>
                          {product.inStock ? "متوفر" : "نفذ"}
                        </span>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(product)}
                          className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10 h-8 w-8 p-0"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(product.id, product.name)}
                          className="border-red-500/30 text-red-400 hover:bg-red-500/10 h-8 w-8 p-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد منتجات مطابقة</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: "#1a1508", border: "1px solid rgba(201,168,76,0.3)", direction: "rtl" }}
        >
          <DialogHeader>
            <DialogTitle className="text-yellow-400 text-right" style={{ fontFamily: "'Amiri', serif" }}>
              {editingId !== null ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">اسم المنتج (عربي) *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: دزة الورود الفاخرة"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Name EN */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">اسم المنتج (إنجليزي)</Label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="Luxury Rose Dazza"
                dir="ltr"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">الفئة *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#1a1508", borderColor: "rgba(201,168,76,0.3)" }}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Price Display */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">السعر (للعرض) *</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="من 45 د.ك"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Price Value */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">السعر الرقمي (للفرز)</Label>
              <Input
                type="number"
                value={form.priceValue}
                onChange={(e) => setForm({ ...form, priceValue: Number(e.target.value) })}
                placeholder="45"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Price Note */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">ملاحظة السعر</Label>
              <Input
                value={form.priceNote}
                onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                placeholder="يشمل التوصيل"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Image URL */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-gray-300 text-sm">رابط الصورة (CDN URL) *</Label>
              <Input
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                placeholder="https://..."
                dir="ltr"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
              {form.image && (
                <img src={form.image} alt="preview" className="w-20 h-20 rounded-lg object-cover mt-1" />
              )}
            </div>
            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-gray-300 text-sm">الوصف *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمنتج..."
                rows={2}
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Badge */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">الشارة (اختياري)</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="الأكثر طلباً"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Badge Color */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">لون الشارة</Label>
              <div className="flex gap-2">
                <Input
                  value={form.badgeColor}
                  onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
                  placeholder="#C9A84C"
                  dir="ltr"
                  style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
                />
                <input
                  type="color"
                  value={form.badgeColor}
                  onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
                  className="w-10 h-10 rounded cursor-pointer border-0"
                />
              </div>
            </div>
            {/* Tags */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">الوسوم (JSON مثال: ["هدايا","أفراح"])</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder='["هدايا","أفراح"]'
                dir="ltr"
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Sort Order */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">ترتيب العرض</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            {/* Rating & Stock */}
            <div className="space-y-1">
              <Label className="text-gray-300 text-sm">التقييم (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                style={{ background: "#0D0B08", borderColor: "rgba(201,168,76,0.3)", color: "#fff" }}
              />
            </div>
            <div className="space-y-1 flex items-end">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.inStock}
                  onCheckedChange={(v) => setForm({ ...form, inStock: v })}
                />
                <Label className="text-gray-300 text-sm">
                  {form.inStock ? "متوفر في المخزون" : "غير متوفر حالياً"}
                </Label>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6 justify-start">
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !form.name || !form.price || !form.image || !form.description}
              className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin ml-1" /> : null}
              {editingId !== null ? "حفظ التعديلات" : "إضافة المنتج"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              إلغاء
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
