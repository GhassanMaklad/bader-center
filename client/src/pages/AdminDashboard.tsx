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
  Bell,
  CheckCircle,
  Edit,
  ImagePlus,
  Loader2,
  LogOut,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  X,
  XCircle,
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
  const [activeTab, setActiveTab] = useState<"products" | "requests">("products");

  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: products, refetch, isLoading } = trpc.products.list.useQuery();
  const { data: serviceRequests, refetch: refetchRequests, isLoading: requestsLoading } = trpc.serviceRequests.list.useQuery();

  const updateStatusMutation = trpc.serviceRequests.updateStatus.useMutation({
    onSuccess: () => { toast.success("تم تحديث حالة الطلب"); refetchRequests(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const newRequestsCount = serviceRequests?.filter(r => r.status === "new").length ?? 0;

  const uploadImageMutation = trpc.upload.productImage.useMutation({
    onSuccess: ({ url }) => {
      setForm((prev) => ({ ...prev, image: url }));
      toast.success("تم رفع الصورة بنجاح!");
    },
    onError: (e) => toast.error("فشل رفع الصورة: " + e.message),
    onSettled: () => setUploadingImage(false),
  });

  const handleImageFile = (file: File) => {
    if (!file) return;
    setUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      uploadImageMutation.mutate({
        filename: file.name,
        contentType: file.type,
        dataBase64: base64,
      });
    };
    reader.readAsDataURL(file);
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
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
      style={{ background: "#FAFAF8", direction: "rtl", fontFamily: "'Cairo', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.2)", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "'Amiri', serif", color: "#B8922A" }}>
              لوحة تحكم مركز بدر
            </h1>
            <p className="text-xs" style={{ color: "#8A7560" }}>إدارة الموقع والطلبات</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: "#6B5E4A" }}>{user.name ?? "المدير"}</span>
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

      {/* Tab Navigation */}
      <div className="border-b px-6" style={{ borderColor: "rgba(184,146,42,0.2)", background: "#FFFFFF" }}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("products")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              color: activeTab === "products" ? "#C9A84C" : "#6B5A3E",
              borderBottom: activeTab === "products" ? "2px solid #C9A84C" : "2px solid transparent",
            }}
          >
            <Package className="w-4 h-4" />
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 relative"
            style={{
              color: activeTab === "requests" ? "#C9A84C" : "#6B5A3E",
              borderBottom: activeTab === "requests" ? "2px solid #C9A84C" : "2px solid transparent",
            }}
          >
            <Bell className="w-4 h-4" />
            طلبات الخدمة
            {newRequestsCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                {newRequestsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "إجمالي المنتجات", value: products?.length ?? 0, icon: Package },
            { label: "متوفر", value: products?.filter(p => p.inStock).length ?? 0, icon: Star, color: "text-green-400" },
            { label: "غير متوفر", value: products?.filter(p => !p.inStock).length ?? 0, icon: Star, color: "text-red-400" },
            { label: "الفئات", value: 5, icon: ShieldCheck, color: "text-yellow-400" },
          ].map((stat) => (
            <Card key={stat.label} style={{ background: "#FFFFFF", border: "1px solid rgba(184,146,42,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color ?? "text-yellow-500"}`} />
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#1C1810" }}>{stat.value}</p>
                  <p className="text-xs" style={{ color: "#8A7560" }}>{stat.label}</p>
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
            style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810", width: "200px" }}>
              <SelectValue placeholder="كل الفئات" />
            </SelectTrigger>
            <SelectContent style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)" }}>
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

        {/* ─── Products Tab ─────────────────────────────────────────────── */}
        {activeTab === "products" && (
        <>
        {/* Products Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(184,146,42,0.2)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "rgba(184,146,42,0.08)" }}>
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
                      background: idx % 2 === 0 ? "#FFFFFF" : "#FAFAF8",
                      borderBottom: "1px solid rgba(184,146,42,0.08)",
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
                          <p className="font-semibold text-sm" style={{ color: "#1C1810" }}>{product.name}</p>
                          <p className="text-xs" style={{ color: "#8A7560" }}>{product.nameEn}</p>
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
              <div className="text-center py-12" style={{ color: "#8A7560" }}>
                <Package className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>لا توجد منتجات مطابقة</p>
              </div>
            )}
          </div>
        )}
        </>
        )}

        {/* ─── Service Requests Tab ─────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Amiri', serif", color: "#B8922A" }}>
                طلبات الخدمة الواردة
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchRequests()}
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                تحديث
              </Button>
            </div>

            {requestsLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            ) : !serviceRequests?.length ? (
              <div className="text-center py-20" style={{ color: "#8A7560" }}>
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">لا توجد طلبات حتى الآن</p>
                <p className="text-sm mt-1">ستظهر الطلبات هنا عند إرسالها من صفحة طلب الخدمة</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {serviceRequests.map((req) => {
                  const statusColors: Record<string, string> = {
                    new: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                    contacted: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                    completed: "bg-green-500/20 text-green-300 border-green-500/30",
                    cancelled: "bg-red-500/20 text-red-300 border-red-500/30",
                  };
                  const statusLabels: Record<string, string> = {
                    new: "جديد",
                    contacted: "تم التواصل",
                    completed: "مكتمل",
                    cancelled: "ملغي",
                  };
                  return (
                    <div
                      key={req.id}
                      className="rounded-xl p-5"
                      style={{ background: "#FFFFFF", border: "1px solid rgba(184,146,42,0.2)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg" style={{ color: "#1C1810" }}>{req.name}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[req.status]}`}>
                              {statusLabels[req.status]}
                            </span>
                            {req.status === "new" && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                            <div className="flex items-center gap-2" style={{ color: "#4A3D2A" }}>
                              <Phone className="w-3.5 h-3.5 text-yellow-500" />
                              <a href={`tel:${req.phone}`} className="hover:text-yellow-400 transition-colors">{req.phone}</a>
                            </div>
                            <div className="flex items-center gap-2" style={{ color: "#4A3D2A" }}>
                              <span className="text-yellow-500">🎉</span>
                              {req.occasionLabel}
                            </div>
                            <div className="flex items-center gap-2" style={{ color: "#4A3D2A" }}>
                              <span className="text-yellow-500">📅</span>
                              {req.date}
                            </div>
                            <div className="flex items-center gap-2" style={{ color: "#4A3D2A" }}>
                              <span className="text-yellow-500">💰</span>
                              {req.budgetLabel}
                            </div>
                            {req.notes && (
                              <div className="flex items-start gap-2 text-gray-400 col-span-2">
                                <span className="text-yellow-500 mt-0.5">📝</span>
                                <span className="text-xs">{req.notes}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-xs mt-3" style={{ color: "#8A7560" }}>
                            {new Date(req.createdAt).toLocaleString("ar-KW", { dateStyle: "medium", timeStyle: "short" })}
                          </p>
                        </div>
                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col gap-2 flex-shrink-0">
                          <a
                            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${req.name}، بخصوص طلبك لمناسبة ${req.occasionLabel}...`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            style={{ background: "rgba(37,211,102,0.15)", color: "#25D366", border: "1px solid rgba(37,211,102,0.3)" }}
                          >
                            <Phone className="w-3.5 h-3.5" />
                            واتساب
                          </a>
                          <Select
                            value={req.status}
                            onValueChange={(v) => updateStatusMutation.mutate({ id: req.id, status: v as "new" | "contacted" | "completed" | "cancelled" })}
                          >
                            <SelectTrigger className="h-8 text-xs w-32" style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)" }}>
                              <SelectItem value="new">جديد</SelectItem>
                              <SelectItem value="contacted">تم التواصل</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                              <SelectItem value="cancelled">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: "#FFFFFF", border: "1px solid rgba(184,146,42,0.3)", direction: "rtl" }}
        >
          <DialogHeader>
            <DialogTitle className="text-right" style={{ fontFamily: "'Amiri', serif", color: "#B8922A" }}>
              {editingId !== null ? "تعديل المنتج" : "إضافة منتج جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Name */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>اسم المنتج (عربي) *</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="مثال: دزة الورود الفاخرة"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Name EN */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>اسم المنتج (إنجليزي)</Label>
              <Input
                value={form.nameEn}
                onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
                placeholder="Luxury Rose Dazza"
                dir="ltr"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الفئة *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)" }}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Price Display */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>السعر (للعرض) *</Label>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="من 45 د.ك"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Price Value */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>السعر الرقمي (للفرز)</Label>
              <Input
                type="number"
                value={form.priceValue}
                onChange={(e) => setForm({ ...form, priceValue: Number(e.target.value) })}
                placeholder="45"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Price Note */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>ملاحظة السعر</Label>
              <Input
                value={form.priceNote}
                onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                placeholder="يشمل التوصيل"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Image Upload */}
            <div className="space-y-2 md:col-span-2">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>صورة المنتج *</Label>
              <div className="flex gap-3 items-start">
                {/* Upload button */}
                <label
                  className="flex flex-col items-center justify-center w-28 h-28 rounded-xl cursor-pointer transition-all duration-200 flex-shrink-0"
                  style={{
                    background: uploadingImage ? "rgba(201,168,76,0.05)" : "rgba(201,168,76,0.08)",
                    border: "2px dashed rgba(201,168,76,0.4)",
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file) handleImageFile(file);
                  }}
                >
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageFile(file);
                    }}
                    disabled={uploadingImage}
                  />
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
                  ) : (
                    <>
                      <ImagePlus className="w-6 h-6 text-yellow-500 mb-1" />
                      <span className="text-xs text-yellow-600 text-center leading-tight">ارفع صورة<br/>أو اسحبها</span>
                    </>
                  )}
                </label>

                {/* Preview + URL input */}
                <div className="flex-1 space-y-2">
                  {form.image && (
                    <div className="relative inline-block">
                      <img
                        src={form.image}
                        alt="preview"
                        className="w-28 h-28 rounded-xl object-cover"
                        style={{ border: "1px solid rgba(201,168,76,0.3)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: "" })}
                        className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: "#ef4444" }}
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-xs" style={{ color: "#8A7560" }}>أو الصق رابط URL مباشرة:</p>
                    <Input
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                      placeholder="https://..."
                      dir="ltr"
                      style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810", fontSize: "0.75rem" }}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs" style={{ color: "#8A7560" }}>الأحجام المدعومة: JPEG, PNG, WebP, GIF — حد أقصى 5MB</p>
            </div>
            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الوصف *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمنتج..."
                rows={2}
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Badge */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الشارة (اختياري)</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="الأكثر طلباً"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Badge Color */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>لون الشارة</Label>
              <div className="flex gap-2">
                <Input
                  value={form.badgeColor}
                  onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
                  placeholder="#C9A84C"
                  dir="ltr"
                  style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
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
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الوسوم (JSON مثال: ["هدايا","أفراح"])</Label>
              <Input
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder='["هدايا","أفراح"]'
                dir="ltr"
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Sort Order */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>ترتيب العرض</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Rating */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>التقييم (1-5)</Label>
              <Input
                type="number"
                min={1}
                max={5}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                style={{ background: "#FFFFFF", borderColor: "rgba(184,146,42,0.3)", color: "#1C1810" }}
              />
            </div>
            {/* Stock */}
            <div className="space-y-1 flex items-end">
              <div className="flex items-center gap-3">
                <Switch
                  checked={form.inStock}
                  onCheckedChange={(v) => setForm({ ...form, inStock: v })}
                />
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>
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
