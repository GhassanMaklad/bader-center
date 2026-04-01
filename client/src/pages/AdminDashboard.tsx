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
import { readAndClearDescriptionDraft } from "@/lib/descriptionDraft";
import {
  Bell,
  CheckCircle,
  Copy,
  CreditCard,
  Download,
  Edit,
  FileJson,
  ImagePlus,
  Loader2,
  LogOut,
  Megaphone,
  Package,
  Phone,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Wand2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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
  occasionKeys: string;
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
  badgeColor: "#B89050",
  description: "",
  rating: 5,
  inStock: true,
  tags: "",
  occasionKeys: "",
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
  const [activeTab, setActiveTab] = useState<"products" | "requests" | "orders" | "announcements" | "testimonials">("products");
  const [filterOrderStatus, setFilterOrderStatus] = useState<string>("all");
  const [filterOrderDate, setFilterOrderDate] = useState<string>("all");

  // ─── Testimonials state ───
  type TestimonialForm = { name: string; position: string; text: string; rating: number; avatarUrl: string; isActive: boolean; sortOrder: number; };
  const emptyTestimonialForm: TestimonialForm = { name: "", position: "", text: "", rating: 5, avatarUrl: "", isActive: true, sortOrder: 0 };
  const [testimonialDialogOpen, setTestimonialDialogOpen] = useState(false);
  const [editingTestimonialId, setEditingTestimonialId] = useState<number | null>(null);
  const [testimonialForm, setTestimonialForm] = useState<TestimonialForm>(emptyTestimonialForm);

  // ─── Announcements state ───
  type AnnouncementForm = { icon: string; text: string; cta: string; ctaLink: string; sortOrder: number; isActive: boolean; };
  const emptyAnnouncementForm: AnnouncementForm = { icon: "✨", text: "", cta: "", ctaLink: "/request", sortOrder: 0, isActive: true };
  const [announcementDialogOpen, setAnnouncementDialogOpen] = useState(false);
  const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<AnnouncementForm>(emptyAnnouncementForm);

  const [uploadingImage, setUploadingImage] = useState(false);

  // ─── Price suggestion state ───
  type PriceSuggestion = {
    min: number; max: number; suggested: number; displayText: string; rationale: string;
    // Competitive fields (present only when competitorPrice was provided)
    competitorPrice?: number;
    competitivePosition?: string;
    priceDiffPercent?: number;
  };
  const [priceSuggestion, setPriceSuggestion] = useState<PriceSuggestion | null>(null);
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const [competitorPrice, setCompetitorPrice] = useState<string>("");

  const suggestPriceMutation = trpc.imageAI.suggestPrice.useMutation({
    onSuccess: (data) => {
      setPriceSuggestion(data);
      setSuggestingPrice(false);
    },
    onError: (e) => {
      toast.error("خطأ في اقتراح السعر: " + e.message);
      setSuggestingPrice(false);
    },
  });

  const handleSuggestPrice = () => {
    if (!form.name.trim()) { toast.error("أدخل اسم المنتج أولاً"); return; }
    setSuggestingPrice(true);
    setPriceSuggestion(null);
    const parsedCompetitor = parseFloat(competitorPrice);
    suggestPriceMutation.mutate({
      productName: form.name,
      category: form.category,
      description: form.description || undefined,
      competitorPrice: !isNaN(parsedCompetitor) && parsedCompetitor > 0 ? parsedCompetitor : undefined,
    });
  };

  const { data: products, refetch, isLoading } = trpc.products.list.useQuery();
  const { data: serviceRequests, refetch: refetchRequests, isLoading: requestsLoading } = trpc.serviceRequests.list.useQuery();
  const { data: orders, refetch: refetchOrders, isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: allAnnouncements, refetch: refetchAnnouncements } = trpc.announcements.listAll.useQuery();
  const { data: allTestimonials, refetch: refetchTestimonials } = trpc.testimonials.listAll.useQuery();

  const createTestimonialMutation = trpc.testimonials.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة التقييم بنجاح"); setTestimonialDialogOpen(false); refetchTestimonials(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });
  const updateTestimonialMutation = trpc.testimonials.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث التقييم"); setTestimonialDialogOpen(false); refetchTestimonials(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });
  const deleteTestimonialMutation = trpc.testimonials.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف التقييم"); refetchTestimonials(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const handleTestimonialSubmit = () => {
    if (!testimonialForm.name.trim() || !testimonialForm.text.trim()) { toast.error("الاسم والنص مطلوبان"); return; }
    if (editingTestimonialId !== null) {
      updateTestimonialMutation.mutate({ id: editingTestimonialId, ...testimonialForm });
    } else {
      createTestimonialMutation.mutate(testimonialForm);
    }
  };

  const openAddTestimonial = () => {
    setEditingTestimonialId(null);
    setTestimonialForm(emptyTestimonialForm);
    setTestimonialDialogOpen(true);
  };

  const openEditTestimonial = (t: NonNullable<typeof allTestimonials>[0]) => {
    setEditingTestimonialId(t.id);
    setTestimonialForm({ name: t.name, position: t.position ?? "", text: t.text, rating: t.rating, avatarUrl: t.avatarUrl ?? "", isActive: t.isActive, sortOrder: t.sortOrder });
    setTestimonialDialogOpen(true);
  };

  const createAnnouncementMutation = trpc.announcements.create.useMutation({
    onSuccess: () => { toast.success("تم إضافة الإعلان بنجاح"); setAnnouncementDialogOpen(false); refetchAnnouncements(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });
  const updateAnnouncementMutation = trpc.announcements.update.useMutation({
    onSuccess: () => { toast.success("تم تحديث الإعلان"); setAnnouncementDialogOpen(false); refetchAnnouncements(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });
  const deleteAnnouncementMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => { toast.success("تم حذف الإعلان"); refetchAnnouncements(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const handleAnnouncementSubmit = () => {
    if (!announcementForm.text.trim()) { toast.error("نص الإعلان مطلوب"); return; }
    if (editingAnnouncementId !== null) {
      updateAnnouncementMutation.mutate({ id: editingAnnouncementId, ...announcementForm });
    } else {
      createAnnouncementMutation.mutate(announcementForm);
    }
  };

  const openAddAnnouncement = () => {
    setEditingAnnouncementId(null);
    setAnnouncementForm(emptyAnnouncementForm);
    setAnnouncementDialogOpen(true);
  };

  const openEditAnnouncement = (a: NonNullable<typeof allAnnouncements>[0]) => {
    setEditingAnnouncementId(a.id);
    setAnnouncementForm({ icon: a.icon, text: a.text, cta: a.cta, ctaLink: a.ctaLink, sortOrder: a.sortOrder, isActive: a.isActive });
    setAnnouncementDialogOpen(true);
  };

  const updateOrderStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => { toast.success("تم تحديث حالة الطلب"); refetchOrders(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const updateStatusMutation = trpc.serviceRequests.updateStatus.useMutation({
    onSuccess: () => { toast.success("تم تحديث حالة الطلب"); refetchRequests(); },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const newRequestsCount = serviceRequests?.filter(r => r.status === "new").length ?? 0;
  const pendingOrdersCount = orders?.filter(o => o.status === "pending").length ?? 0;

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

  // ─── Gallery images state (for multi-image support) ───
  type GalleryImg = { uid: string; id?: number; url: string; uploading?: boolean };
  const [galleryImages, setGalleryImages] = useState<GalleryImg[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  const addGalleryImageMutation = trpc.productImages.add.useMutation({
    onSuccess: ({ url }, variables) => {
      // Replace the uploading placeholder with the real URL
      setGalleryImages((prev) =>
        prev.map((img) => (img.uploading && img.url === "uploading" ? { uid: img.uid, url, uploading: false } : img))
      );
      toast.success("تم رفع الصورة الإضافية!");
    },
    onError: (e) => {
      toast.error("فشل رفع الصورة: " + e.message);
      setGalleryImages((prev) => prev.filter((img) => !img.uploading));
    },
    onSettled: () => setUploadingGallery(false),
  });

  const deleteGalleryImageMutation = trpc.productImages.delete.useMutation({
    onError: (e) => toast.error("فشل حذف الصورة: " + e.message),
  });

  const handleGalleryImageFile = (file: File) => {
    if (!file) return;
    if (galleryImages.length >= 4) {
      toast.error("الحد الأقصى 4 صور إضافية (إجمالي 5 مع الصورة الرئيسية)");
      return;
    }
    setUploadingGallery(true);
    // Add placeholder
    const placeholderUid = `upload-${Date.now()}-${Math.random()}`;
    setGalleryImages((prev) => [...prev, { uid: placeholderUid, url: "uploading", uploading: true }]);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(",")[1];
      // If editing an existing product, upload directly to productImages table
      if (editingId !== null) {
        addGalleryImageMutation.mutate({
          productId: editingId,
          filename: file.name,
          contentType: file.type,
          dataBase64: base64,
          sortOrder: galleryImages.length,
        });
      } else {
        // For new products, store as base64 temporarily; upload after product is created
        const dataUrl = e.target?.result as string;
        setGalleryImages((prev) =>
          prev.map((img) => (img.uploading ? { uid: img.uid, url: dataUrl, uploading: false, _file: file } as GalleryImg & { _file: File } : img))
        );
        setUploadingGallery(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeGalleryImage = (index: number) => {
    const img = galleryImages[index];
    if (img.id) deleteGalleryImageMutation.mutate({ id: img.id });
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const createMutation = trpc.products.create.useMutation({
    onSuccess: async (newProduct) => {
      // Upload any pending gallery images for the new product
      const pending = galleryImages.filter((img) => img.url.startsWith("data:"));
      if (pending.length > 0 && newProduct?.id) {
        for (let i = 0; i < pending.length; i++) {
          const img = pending[i];
          const base64 = img.url.split(",")[1];
          const mimeMatch = img.url.match(/data:([^;]+);/);
          const contentType = mimeMatch?.[1] ?? "image/jpeg";
          const ext = contentType.split("/")[1] ?? "jpg";
          try {
            await addGalleryImageMutation.mutateAsync({
              productId: newProduct.id,
              filename: `gallery-${i}.${ext}`,
              contentType,
              dataBase64: base64,
              sortOrder: i,
            });
          } catch (_) { /* individual errors already toasted */ }
        }
      }
      toast.success("تم إضافة المنتج بنجاح");
      setDialogOpen(false);
      refetch();
    },
    onError: (e) => toast.error("خطأ: " + e.message),
  });

  const reorderImagesMutation = trpc.productImages.reorder.useMutation({
    onError: (e) => toast.error("خطأ في حفظ ترتيب الصور: " + e.message),
  });

  const updateMutation = trpc.products.update.useMutation({
    onSuccess: async () => {
      // Persist the new sort order for gallery images that have DB ids
      const itemsWithId = galleryImages
        .filter((img) => img.id !== undefined)
        .map((img, idx) => ({ id: img.id!, sortOrder: idx }));
      if (itemsWithId.length > 0) {
        await reorderImagesMutation.mutateAsync({ items: itemsWithId });
      }
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

  // Pre-fill product form from AI description draft (set by ImageEnhancerPage)
  useEffect(() => {
    const draft = readAndClearDescriptionDraft();
    if (!draft) return;

    // Build a rich description combining all generated fields
    const fullDescription = [
      draft.description,
      draft.features.length ? `\nالمميزات:\n${draft.features.map((f) => `✅ ${f}`).join("\n")}` : "",
      `\n${draft.cta}`,
    ]
      .filter(Boolean)
      .join("\n");

    setEditingId(null);
    setForm((prev) => ({
      ...emptyForm,
      name: draft.title,
      description: fullDescription,
      image: draft.imageUrl ?? prev.image,
      tags: draft.hashtags.map((h) => h.replace(/^#/, "")).join(","),
    }));
    setDialogOpen(true);
    setActiveTab("products");

    // Small delay so the toast appears after navigation animation
    setTimeout(() => {
      toast.success("تم تعبئة نموذج المنتج من وصف الذكاء الاصطناعي ✨", { duration: 4000 });
    }, 300);
  }, []); // run once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2EDE4" }}>
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
    setPriceSuggestion(null);
    setCompetitorPrice("");
    setGalleryImages([]);
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
      badgeColor: p.badgeColor ?? "#B89050",
      description: p.description,
      rating: p.rating,
      inStock: p.inStock,
      tags: p.tags ?? "",
      occasionKeys: p.occasionKeys ?? "",
      sortOrder: p.sortOrder,
    });
    setPriceSuggestion(null);
    setCompetitorPrice("");
    // Load existing gallery images from the product data
    const existingGallery = (p as ProductRow & { galleryImages?: { id: number; imageUrl: string }[] }).galleryImages ?? [];
    setGalleryImages(existingGallery.map((img) => ({ uid: `existing-${img.id}`, id: img.id, url: img.imageUrl })));
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    const payload = {
      ...form,
      priceNote: form.priceNote || null,
      badge: form.badge || null,
      badgeColor: form.badgeColor || null,
      tags: form.tags || null,
      occasionKeys: form.occasionKeys || null,
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
      style={{ background: "#F2EDE4", direction: "rtl", fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between"
        style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.2)", boxShadow: "0 1px 8px rgba(0,0,0,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-yellow-500" />
          <div>
            <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
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
            onClick={() => navigate("/admin/media")}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            إدارة الصور
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/image-enhancer")}
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            ✨ محسّن الصور
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
      <div className="border-b px-6" style={{ borderColor: "rgba(156,122,60,0.2)", background: "#F7F3EC" }}>
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("products")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              color: activeTab === "products" ? "#B89050" : "#6B5A3E",
              borderBottom: activeTab === "products" ? "2px solid #B89050" : "2px solid transparent",
            }}
          >
            <Package className="w-4 h-4" />
            المنتجات
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 relative"
            style={{
              color: activeTab === "requests" ? "#B89050" : "#6B5A3E",
              borderBottom: activeTab === "requests" ? "2px solid #B89050" : "2px solid transparent",
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
          <button
            onClick={() => setActiveTab("orders")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2 relative"
            style={{
              color: activeTab === "orders" ? "#B89050" : "#6B5A3E",
              borderBottom: activeTab === "orders" ? "2px solid #B89050" : "2px solid transparent",
            }}
          >
            <CreditCard className="w-4 h-4" />
            الطلبات والمدفوعات
            {pendingOrdersCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center"
                style={{ background: "#f59e0b", color: "#fff" }}
              >
                {pendingOrdersCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("announcements")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              color: activeTab === "announcements" ? "#B89050" : "#6B5A3E",
              borderBottom: activeTab === "announcements" ? "2px solid #B89050" : "2px solid transparent",
            }}
          >
            <Megaphone className="w-4 h-4" />
            شريط الإعلانات
          </button>
          <button
            onClick={() => setActiveTab("testimonials")}
            className="px-5 py-3 text-sm font-medium transition-all duration-200 flex items-center gap-2"
            style={{
              color: activeTab === "testimonials" ? "#B89050" : "#6B5A3E",
              borderBottom: activeTab === "testimonials" ? "2px solid #B89050" : "2px solid transparent",
            }}
          >
            <Star className="w-4 h-4" />
            آراء العملاء
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
            <Card key={stat.label} style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.15)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <CardContent className="p-4 flex items-center gap-3">
                <stat.icon className={`w-8 h-8 ${stat.color ?? "text-yellow-500"}`} />
                <div>
                  <p className="text-2xl font-bold" style={{ color: "#2C2416" }}>{stat.value}</p>
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
            style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
          />
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416", width: "200px" }}>
              <SelectValue placeholder="كل الفئات" />
            </SelectTrigger>
            <SelectContent style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)" }}>
              <SelectItem value="all">كل الفئات</SelectItem>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={() => {
              if (!products || products.length === 0) { toast.error("لا توجد منتجات للتصدير"); return; }
              const json = JSON.stringify(products, null, 2);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bader-products-${new Date().toISOString().slice(0,10)}.json`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`تم تصدير ${products.length} منتج كـ JSON ✓`);
            }}
            variant="outline"
            className="border-yellow-600 text-yellow-700 hover:bg-yellow-50"
            title="تصدير JSON"
          >
            <FileJson className="w-4 h-4 ml-1" />
            JSON
          </Button>
          <Button
            onClick={() => {
              if (!products || products.length === 0) { toast.error("لا توجد منتجات للتصدير"); return; }
              const headers = ["الرقم","الاسم","الاسم الإنجليزي","الفئة","السعر","قيمة السعر","ملاحظة السعر","الوصف","متوفر","الشارة","الوسوم","رابط الصورة","تاريخ الإنشاء"];
              const rows = products.map(p => [
                p.id,
                p.name,
                p.nameEn ?? "",
                p.category,
                p.price,
                p.priceValue ?? "",
                p.priceNote ?? "",
                (p.description ?? "").replace(/,/g, "،"),
                p.inStock ? "نعم" : "لا",
                p.badge ?? "",
                p.tags ?? "",
                p.image,
                p.createdAt ? new Date(p.createdAt).toLocaleDateString("ar-KW") : "",
              ]);
              const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
              const BOM = "\uFEFF";
              const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bader-products-${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              toast.success(`تم تصدير ${products.length} منتج كـ Excel ✓`);
            }}
            variant="outline"
            className="border-green-600 text-green-700 hover:bg-green-50"
            title="تصدير Excel"
          >
            <Download className="w-4 h-4 ml-1" />
            Excel
          </Button>
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
          <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(156,122,60,0.2)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <table className="w-full text-sm">
              <thead style={{ background: "rgba(156,122,60,0.08)" }}>
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
                      background: idx % 2 === 0 ? "#F7F3EC" : "#F2EDE4",
                      borderBottom: "1px solid rgba(156,122,60,0.08)",
                    }}
                  >
                    {/* Product Info */}
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                          style={{ border: "1px solid rgba(156,122,60,0.2)" }}
                        />
                        <div>
                          <p className="font-semibold text-sm" style={{ color: "#2C2416" }}>{product.name}</p>
                          <p className="text-xs" style={{ color: "#8A7560" }}>{product.nameEn}</p>
                          {product.badge && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block"
                              style={{ background: `${product.badgeColor}22`, color: product.badgeColor ?? "#B89050" }}
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
                          title="نسخ رابط المنتج"
                          onClick={() => {
                            const url = `https://www.markzbader.org/product/${product.id}`;
                            navigator.clipboard.writeText(url).then(() =>
                              toast.success("تم نسخ رابط المنتج ✔")
                            );
                          }}
                          className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 h-8 w-8 p-0"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
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

        {/* ─── Orders Tab ─────────────────────────────────────────────────────────────── */}
        {activeTab === "orders" && (
          <div>
            {/* Header + Filters */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
                  الطلبات والمدفوعات
                </h2>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!orders?.length) return;
                      const now = new Date();
                      const filtered = orders.filter((order) => {
                        if (filterOrderStatus !== "all" && order.status !== filterOrderStatus) return false;
                        if (filterOrderDate !== "all") {
                          const d = new Date(order.createdAt);
                          if (filterOrderDate === "today" && d.toDateString() !== now.toDateString()) return false;
                          if (filterOrderDate === "week") { const w = new Date(now); w.setDate(now.getDate() - 7); if (d < w) return false; }
                          if (filterOrderDate === "month") { const m = new Date(now); m.setMonth(now.getMonth() - 1); if (d < m) return false; }
                        }
                        return true;
                      });
                      const header = ["رقم الطلب", "اسم العميل", "هاتف العميل", "المنتج", "الكمية", "تاريخ التسليم", "الملاحظات", "الحالة", "تاريخ الطلب"];
                      const rows = filtered.map((o) => {
                        let productName = "";
                        let qty = "";
                        let deliveryDate = "";
                        let notes = "";
                        try {
                          const items = JSON.parse(o.cartItems || "[]");
                          productName = items[0]?.name || "";
                          qty = String(items[0]?.qty || 1);
                        } catch {}
                        try {
                          const n = o.notes || "";
                          const dateMatch = n.match(/تاريخ التسليم: ([\d-]+)/);
                          const notesMatch = n.match(/ملاحظات: (.+)/);
                          deliveryDate = dateMatch?.[1] || "";
                          notes = notesMatch?.[1] || n;
                        } catch {}
                        return [
                          o.id,
                          o.customerName || "",
                          o.customerPhone || "",
                          productName,
                          qty,
                          deliveryDate,
                          notes,
                          o.status,
                          new Date(o.createdAt).toLocaleString("ar-KW"),
                        ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",");
                      });
                      const bom = "\uFEFF";
                      const csv = bom + [header.join(","), ...rows].join("\n");
                      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `طلبات-مركز-بدر-${new Date().toISOString().split("T")[0]}.csv`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="border-green-500/30 text-green-400 hover:bg-green-500/10 flex items-center gap-1.5"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    تصدير CSV
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchOrders()}
                    className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
                  >
                    تحديث
                  </Button>
                </div>
              </div>
              {/* Filter bar */}
              <div className="flex flex-wrap gap-2">
                {/* Status filter */}
                {(["all", "pending", "confirmed", "paid", "cancelled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilterOrderStatus(s)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: filterOrderStatus === s ? "rgba(156,122,60,0.25)" : "rgba(156,122,60,0.06)",
                      border: filterOrderStatus === s ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(156,122,60,0.15)",
                      color: filterOrderStatus === s ? "#C9A84C" : "#8A7560",
                    }}
                  >
                    {{ all: "جميع الحالات", pending: "• معلق", confirmed: "• مؤكد", paid: "• مدفوع", cancelled: "• ملغي" }[s]}
                  </button>
                ))}
                <div className="w-px bg-yellow-500/20 mx-1" />
                {/* Date filter */}
                {(["all", "today", "week", "month"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterOrderDate(d)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: filterOrderDate === d ? "rgba(156,122,60,0.25)" : "rgba(156,122,60,0.06)",
                      border: filterOrderDate === d ? "1px solid rgba(201,168,76,0.5)" : "1px solid rgba(156,122,60,0.15)",
                      color: filterOrderDate === d ? "#C9A84C" : "#8A7560",
                    }}
                  >
                    {{ all: "كل التواريخ", today: "اليوم", week: "هذا الأسبوع", month: "هذا الشهر" }[d]}
                  </button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
              </div>
            ) : !orders?.length ? (
              <div className="text-center py-20" style={{ color: "#8A7560" }}>
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-lg">لا توجد طلبات حتى الآن</p>
                <p className="text-sm mt-1">ستظهر طلبات الواتساب هنا بعد إرسالها من العملاء</p>
              </div>
            ) : (() => {
              // Apply filters
              const now = new Date();
              const filtered = orders.filter((order) => {
                if (filterOrderStatus !== "all" && order.status !== filterOrderStatus) return false;
                if (filterOrderDate !== "all") {
                  const d = new Date(order.createdAt);
                  if (filterOrderDate === "today") {
                    if (d.toDateString() !== now.toDateString()) return false;
                  } else if (filterOrderDate === "week") {
                    const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
                    if (d < weekAgo) return false;
                  } else if (filterOrderDate === "month") {
                    const monthAgo = new Date(now); monthAgo.setMonth(now.getMonth() - 1);
                    if (d < monthAgo) return false;
                  }
                }
                return true;
              });
              if (!filtered.length) return (
                <div className="text-center py-16" style={{ color: "#8A7560" }}>
                  <ShoppingCart className="w-10 h-10 mx-auto mb-2 opacity-20" />
                  <p>لا توجد طلبات تطابق الفلتر المحدد</p>
                </div>
              );
              return (
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(156,122,60,0.2)", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
                <table className="w-full text-sm">
                  <thead style={{ background: "rgba(156,122,60,0.08)" }}>
                    <tr>
                      <th className="text-right p-3 text-yellow-400 font-semibold">#</th>
                      <th className="text-right p-3 text-yellow-400 font-semibold">العميل</th>
                      <th className="text-right p-3 text-yellow-400 font-semibold hidden md:table-cell">المبلغ</th>
                      <th className="text-center p-3 text-yellow-400 font-semibold">الحالة</th>
                      <th className="text-right p-3 text-yellow-400 font-semibold hidden lg:table-cell">التاريخ</th>
                      <th className="text-center p-3 text-yellow-400 font-semibold">إجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((order, idx) => {
                      const orderStatusColors: Record<string, string> = {
                        pending: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
                        confirmed: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                        paid: "bg-green-500/20 text-green-300 border-green-500/30",
                        cancelled: "bg-gray-500/20 text-gray-300 border-gray-500/30",
                      };
                      const orderStatusLabels: Record<string, string> = {
                        pending: "معلق — بانتظار المراجعة",
                        confirmed: "مؤكد — تم التواصل",
                        paid: "مدفوع",
                        cancelled: "ملغي",
                      };
                      let cartItems: Array<{ name: string; qty: number; price: number }> = [];
                      try { cartItems = JSON.parse(order.cartItems); } catch {}
                      return (
                        <tr
                          key={order.id}
                          style={{
                            background: idx % 2 === 0 ? "#F7F3EC" : "#F2EDE4",
                            borderBottom: "1px solid rgba(156,122,60,0.08)",
                          }}
                        >
                          <td className="p-3 font-mono text-xs" style={{ color: "#9C7A3C" }}>#{order.id}</td>
                          <td className="p-3">
                            {/* Product name + qty */}
                            <p className="font-semibold" style={{ color: "#2C2416" }}>
                              {cartItems.length > 0 ? cartItems.map(i => `${i.name} ×${i.qty}`).join(" · ") : order.customerName}
                            </p>
                            {/* Delivery date & notes parsed from order.notes */}
                            {order.notes && (() => {
                              const parts = order.notes.split(" | ");
                              const datePart = parts.find(p => p.startsWith("تاريخ التسليم:"));
                              const notesPart = parts.find(p => p.startsWith("ملاحظات:"));
                              return (
                                <div className="mt-1 flex flex-col gap-0.5">
                                  {datePart && (
                                    <p className="text-xs flex items-center gap-1" style={{ color: "#9C7A3C" }}>
                                      📅 {datePart.replace("تاريخ التسليم: ", "")}
                                    </p>
                                  )}
                                  {notesPart && (
                                    <p className="text-xs" style={{ color: "#8A7560" }}>
                                      📝 {notesPart.replace("ملاحظات: ", "")}
                                    </p>
                                  )}
                                </div>
                              );
                            })()}
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <span className="font-bold" style={{ color: "#B89050" }}>
                              {Number(order.totalAmount) > 0 ? `${Number(order.totalAmount).toFixed(3)} ${order.currency}` : "—"}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span className={`text-xs px-2 py-1 rounded-full border ${orderStatusColors[order.status]}`}>
                              {orderStatusLabels[order.status]}
                            </span>
                          </td>
                          <td className="p-3 hidden lg:table-cell text-xs" style={{ color: "#8A7560" }}>
                            {new Date(order.createdAt).toLocaleString("ar-KW", { dateStyle: "short", timeStyle: "short" })}
                          </td>
                          <td className="p-3">
                            <Select
                              value={order.status}
                              onValueChange={(v) => updateOrderStatusMutation.mutate({ id: order.id, status: v as "pending" | "confirmed" | "paid" | "cancelled" })}
                            >
                              <SelectTrigger className="h-8 text-xs w-28" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)" }}>
                                <SelectItem value="pending">معلق — بانتظار المراجعة</SelectItem>
                                <SelectItem value="confirmed">مؤكد — تم التواصل</SelectItem>
                                <SelectItem value="paid">مدفوع</SelectItem>
                                <SelectItem value="cancelled">ملغي</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              );
            })()}
          </div>
        )}

        {/* ─── Service Requests Tab ───────────────────────────────── */}
        {activeTab === "requests" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
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
                      style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.2)", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="font-bold text-lg" style={{ color: "#2C2416" }}>{req.name}</h3>
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
                            <SelectTrigger className="h-8 text-xs w-32" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)" }}>
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

        {/* ─── Testimonials Tab ───────────────────────────────────────────────────────── */}
        {activeTab === "testimonials" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}>آراء العملاء</h2>
                <p className="text-sm mt-1" style={{ color: "#8A7560" }}>تحكم في التقييمات الظاهرة في صفحة "من نحن"</p>
              </div>
              <Button onClick={openAddTestimonial} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                <Plus className="w-4 h-4 ml-1" />
                إضافة تقييم
              </Button>
            </div>

            {!allTestimonials || allTestimonials.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "#F7F3EC", border: "1px dashed rgba(156,122,60,0.3)" }}>
                <Star className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#B89050" }} />
                <p className="text-sm" style={{ color: "#8A7560" }}>لا توجد تقييمات حتى الآن. أضف تقييمات عملائك لتظهر في صفحة "من نحن".</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allTestimonials.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start gap-4 p-4 rounded-xl"
                    style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.15)", opacity: t.isActive ? 1 : 0.5 }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0 border" style={{ background: "#EDE8DF", borderColor: "rgba(156,122,60,0.2)" }}>
                      {t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm" style={{ color: "#2C2416" }}>{t.name}</span>
                        {t.position && <span className="text-xs" style={{ color: "#8A7560" }}>— {t.position}</span>}
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= t.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"}`} />)}
                        </div>
                      </div>
                      <p className="text-sm line-clamp-2" style={{ color: "#4A3D2A" }}>{t.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Switch
                        checked={t.isActive}
                        onCheckedChange={(v) => updateTestimonialMutation.mutate({ id: t.id, isActive: v })}
                      />
                      <Button size="sm" variant="outline" onClick={() => openEditTestimonial(t)}
                        style={{ borderColor: "rgba(156,122,60,0.3)", color: "#B89050" }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => { if (confirm("حذف هذا التقييم؟")) deleteTestimonialMutation.mutate({ id: t.id }); }}
                        style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Announcements Tab ───────────────────────────────────────────────────────── */}
        {activeTab === "announcements" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold" style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}>شريط الإعلانات</h2>
                <p className="text-sm mt-1" style={{ color: "#8A7560" }}>تحكم في الإعلانات الظاهرة في الشريط المتحرك أعلى الصفحة الرئيسية</p>
              </div>
              <Button onClick={openAddAnnouncement} className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                <Plus className="w-4 h-4 ml-1" />
                إضافة إعلان
              </Button>
            </div>

            {!allAnnouncements || allAnnouncements.length === 0 ? (
              <div className="text-center py-16 rounded-xl" style={{ background: "#F7F3EC", border: "1px dashed rgba(156,122,60,0.3)" }}>
                <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30" style={{ color: "#B89050" }} />
                <p className="text-sm" style={{ color: "#8A7560" }}>لا توجد إعلانات حتى الآن. سيظهر الشريط بالبيانات الافتراضية حتى تضيف إعلانات جديدة.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allAnnouncements.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center gap-4 p-4 rounded-xl"
                    style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.15)", opacity: a.isActive ? 1 : 0.5 }}
                  >
                    <span className="text-2xl">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#2C2416" }}>{a.text}</p>
                      <div className="flex items-center gap-3 mt-1">
                        {a.cta && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(184,144,80,0.15)", color: "#B89050" }}>
                            زر: {a.cta} → {a.ctaLink}
                          </span>
                        )}
                        <span className="text-xs" style={{ color: "#8A7560" }}>ترتيب: {a.sortOrder}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={a.isActive}
                        onCheckedChange={(v) => updateAnnouncementMutation.mutate({ id: a.id, isActive: v })}
                      />
                      <Button size="sm" variant="outline" onClick={() => openEditAnnouncement(a)}
                        style={{ borderColor: "rgba(156,122,60,0.3)", color: "#B89050" }}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => { if (confirm("حذف هذا الإعلان؟")) deleteAnnouncementMutation.mutate({ id: a.id }); }}
                        style={{ borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Announcement Add/Edit Dialog */}
      <Dialog open={announcementDialogOpen} onOpenChange={setAnnouncementDialogOpen}>
        <DialogContent className="max-w-lg" style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.3)", direction: "rtl" }}>
          <DialogHeader>
            <DialogTitle className="text-right" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
              {editingAnnouncementId !== null ? "تعديل الإعلان" : "إضافة إعلان جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>أيقونة</Label>
                <Input value={announcementForm.icon} onChange={(e) => setAnnouncementForm({ ...announcementForm, icon: e.target.value })}
                  placeholder="✨" className="text-center text-xl" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>نص الإعلان *</Label>
                <Input value={announcementForm.text} onChange={(e) => setAnnouncementForm({ ...announcementForm, text: e.target.value })}
                  placeholder="مثال: عروض رمضان الكريم..." style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>نص زر CTA (اختياري)</Label>
                <Input value={announcementForm.cta} onChange={(e) => setAnnouncementForm({ ...announcementForm, cta: e.target.value })}
                  placeholder="اطلب الآن" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>رابط CTA</Label>
                <Input value={announcementForm.ctaLink} onChange={(e) => setAnnouncementForm({ ...announcementForm, ctaLink: e.target.value })}
                  placeholder="/request" dir="ltr" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>الترتيب</Label>
                <Input type="number" value={announcementForm.sortOrder} onChange={(e) => setAnnouncementForm({ ...announcementForm, sortOrder: Number(e.target.value) })}
                  style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>مفعّل</Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch checked={announcementForm.isActive} onCheckedChange={(v) => setAnnouncementForm({ ...announcementForm, isActive: v })} />
                  <span className="text-sm" style={{ color: "#6B5A3E" }}>{announcementForm.isActive ? "ظاهر" : "مخفي"}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleAnnouncementSubmit} disabled={createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                {(createAnnouncementMutation.isPending || updateAnnouncementMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ الإعلان"}
              </Button>
              <Button variant="outline" onClick={() => setAnnouncementDialogOpen(false)}
                style={{ borderColor: "rgba(156,122,60,0.3)", color: "#6B5A3E" }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.3)", direction: "rtl" }}
        >
          <DialogHeader>
            <DialogTitle className="text-right" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
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
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
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
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>
            {/* Category */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الفئة *</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
                <SelectTrigger style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)" }}>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {/* Competitor Price (optional) */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>
                سعر المنافس <span className="text-xs" style={{ color: "#8A7560" }}>(اختياري)</span>
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  min="0"
                  step="0.5"
                  value={competitorPrice}
                  onChange={(e) => setCompetitorPrice(e.target.value)}
                  placeholder="مثال: 35"
                  style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416", paddingLeft: "3.5rem" }}
                />
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none"
                  style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}
                >
                  د.ك
                </span>
              </div>
              <p className="text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                أدخل سعر المنافس للحصول على تحليل تنافسي مقارن
              </p>
            </div>

            {/* Price Display */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>السعر (للعرض) *</Label>
                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={suggestingPrice || !form.name.trim()}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: competitorPrice && parseFloat(competitorPrice) > 0
                      ? "rgba(34,197,94,0.1)"
                      : "rgba(107,94,168,0.1)",
                    color: competitorPrice && parseFloat(competitorPrice) > 0 ? "#16a34a" : "#6B5EA8",
                    border: competitorPrice && parseFloat(competitorPrice) > 0
                      ? "1px solid rgba(34,197,94,0.3)"
                      : "1px solid rgba(107,94,168,0.25)",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {suggestingPrice ? (
                    <Loader2 size={11} className="animate-spin" />
                  ) : (
                    <Sparkles size={11} />
                  )}
                  {suggestingPrice
                    ? "جاري التحليل..."
                    : competitorPrice && parseFloat(competitorPrice) > 0
                    ? "تحليل تنافسي"
                    : "اقتراح سعر"}
                </button>
              </div>
              <Input
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="من 45 د.ك"
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
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
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>
            {/* Price Note */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>ملاحظة السعر</Label>
              <Input
                value={form.priceNote}
                onChange={(e) => setForm({ ...form, priceNote: e.target.value })}
                placeholder="يشمل التوصيل"
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>

            {/* AI Price Suggestion Result */}
            {priceSuggestion && (
              <div
                className="md:col-span-2 rounded-xl p-4 space-y-3"
                style={{
                  background: priceSuggestion.competitorPrice
                    ? "rgba(34,197,94,0.04)"
                    : "rgba(107,94,168,0.06)",
                  border: priceSuggestion.competitorPrice
                    ? "1px solid rgba(34,197,94,0.2)"
                    : "1px solid rgba(107,94,168,0.2)",
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center"
                      style={{ background: priceSuggestion.competitorPrice ? "rgba(34,197,94,0.15)" : "rgba(107,94,168,0.15)" }}
                    >
                      <Wand2 size={13} style={{ color: priceSuggestion.competitorPrice ? "#16a34a" : "#6B5EA8" }} />
                    </div>
                    <p
                      className="text-sm font-bold"
                      style={{ color: priceSuggestion.competitorPrice ? "#16a34a" : "#6B5EA8", fontFamily: "'Cairo', sans-serif" }}
                    >
                      {priceSuggestion.competitorPrice ? "تحليل تنافسي مقارن" : "اقتراح السعر بالذكاء الاصطناعي"}
                    </p>
                  </div>
                  {/* Competitive badge */}
                  {priceSuggestion.competitorPrice && priceSuggestion.competitivePosition && (
                    <div className="flex items-center gap-2">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-bold"
                        style={{
                          background: (priceSuggestion.priceDiffPercent ?? 0) > 0
                            ? "rgba(234,179,8,0.15)"
                            : (priceSuggestion.priceDiffPercent ?? 0) < 0
                            ? "rgba(34,197,94,0.15)"
                            : "rgba(107,94,168,0.15)",
                          color: (priceSuggestion.priceDiffPercent ?? 0) > 0
                            ? "#854d0e"
                            : (priceSuggestion.priceDiffPercent ?? 0) < 0
                            ? "#15803d"
                            : "#6B5EA8",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        {priceSuggestion.competitivePosition}
                      </span>
                      <span
                        className="text-xs font-bold"
                        style={{
                          color: (priceSuggestion.priceDiffPercent ?? 0) > 0 ? "#854d0e" : "#15803d",
                          fontFamily: "'Cairo', sans-serif",
                        }}
                      >
                        {(priceSuggestion.priceDiffPercent ?? 0) > 0 ? "+" : ""}{priceSuggestion.priceDiffPercent?.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>

                {/* Competitor vs Suggested comparison row */}
                {priceSuggestion.competitorPrice && (
                  <div
                    className="grid grid-cols-2 gap-3 rounded-lg p-3"
                    style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>سعر المنافس</p>
                      <p className="text-lg font-bold" style={{ color: "#c0392b", fontFamily: "'Cairo', sans-serif" }}>
                        {priceSuggestion.competitorPrice} د.ك
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs mb-1" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>سعرنا المقترح</p>
                      <p className="text-lg font-bold" style={{ color: "#16a34a", fontFamily: "'Cairo', sans-serif" }}>
                        {priceSuggestion.suggested} د.ك
                      </p>
                    </div>
                  </div>
                )}

                {/* Range bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs" style={{ color: "#8A7560", fontFamily: "'Cairo', sans-serif" }}>
                    <span>أدنى: {priceSuggestion.min} د.ك</span>
                    <span>مقترح: {priceSuggestion.suggested} د.ك</span>
                    <span>أعلى: {priceSuggestion.max} د.ك</span>
                  </div>
                  <div className="relative h-2 rounded-full" style={{ background: "rgba(107,94,168,0.15)" }}>
                    <div
                      className="absolute top-0 h-2 rounded-full"
                      style={{
                        background: priceSuggestion.competitorPrice
                          ? "linear-gradient(90deg, #16a34a, #22c55e)"
                          : "linear-gradient(90deg, #6B5EA8, #9C7A3C)",
                        left: "0%",
                        width: `${Math.min(100, ((priceSuggestion.suggested - priceSuggestion.min) / Math.max(1, priceSuggestion.max - priceSuggestion.min)) * 100)}%`,
                      }}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
                      style={{
                        background: priceSuggestion.competitorPrice ? "#16a34a" : "#6B5EA8",
                        left: `calc(${Math.min(100, ((priceSuggestion.suggested - priceSuggestion.min) / Math.max(1, priceSuggestion.max - priceSuggestion.min)) * 100)}% - 6px)`,
                      }}
                    />
                  </div>
                </div>

                {/* Apply buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, price: `من ${priceSuggestion.min} د.ك`, priceValue: priceSuggestion.min }))}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "rgba(107,94,168,0.1)", color: "#6B5EA8", border: "1px solid rgba(107,94,168,0.25)", fontFamily: "'Cairo', sans-serif" }}
                  >
                    تطبيق الأدنى ({priceSuggestion.min} د.ك)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, price: `${priceSuggestion.suggested} د.ك`, priceValue: priceSuggestion.suggested }))}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80 font-bold"
                    style={{
                      background: priceSuggestion.competitorPrice ? "rgba(34,197,94,0.18)" : "rgba(107,94,168,0.18)",
                      color: priceSuggestion.competitorPrice ? "#16a34a" : "#6B5EA8",
                      border: priceSuggestion.competitorPrice ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(107,94,168,0.4)",
                      fontFamily: "'Cairo', sans-serif",
                    }}
                  >
                    ★ تطبيق المقترح ({priceSuggestion.suggested} د.ك)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, price: `حتى ${priceSuggestion.max} د.ك`, priceValue: priceSuggestion.max }))}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "rgba(107,94,168,0.1)", color: "#6B5EA8", border: "1px solid rgba(107,94,168,0.25)", fontFamily: "'Cairo', sans-serif" }}
                  >
                    تطبيق الأعلى ({priceSuggestion.max} د.ك)
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, price: priceSuggestion.displayText, priceValue: priceSuggestion.suggested }))}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
                    style={{ background: "rgba(156,122,60,0.1)", color: "#9C7A3C", border: "1px solid rgba(156,122,60,0.25)", fontFamily: "'Cairo', sans-serif" }}
                  >
                    نص العرض: "{priceSuggestion.displayText}"
                  </button>
                </div>

                {/* Rationale */}
                <p className="text-xs leading-relaxed" style={{ color: "#7A6A50", fontFamily: "'Cairo', sans-serif" }}>
                  💡 {priceSuggestion.rationale}
                </p>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-3 md:col-span-2">
              <Label className="text-sm font-semibold" style={{ color: "#4A3D2A" }}>صور المنتج (1-5 صور)</Label>

              {/* Image grid: primary + gallery */}
              <div className="flex flex-wrap gap-3">

                {/* Primary image slot */}
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs font-medium" style={{ color: "#8A7560" }}>رئيسية *</span>
                  {form.image ? (
                    <div className="relative">
                      <img
                        src={form.image}
                        alt="primary"
                        className="w-24 h-24 rounded-xl object-cover"
                        style={{ border: "2px solid rgba(156,122,60,0.5)" }}
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
                  ) : (
                    <label
                      className="flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        background: uploadingImage ? "rgba(156,122,60,0.05)" : "rgba(156,122,60,0.08)",
                        border: "2px dashed rgba(156,122,60,0.5)",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleImageFile(f); }}
                    >
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); }}
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" /> : (
                        <><ImagePlus className="w-5 h-5 text-yellow-500 mb-1" /><span className="text-xs text-yellow-600 text-center leading-tight">ارفع<br/>صورة</span></>
                      )}
                    </label>
                  )}
                </div>

                {/* Drag-and-drop gallery image slots */}
                {(() => {
                  // SortableGalleryItem component defined inline
                  function SortableGalleryItem({ img, idx, onRemove }: { img: GalleryImg; idx: number; onRemove: (idx: number) => void }) {
                    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.uid });
                    const style = {
                      transform: CSS.Transform.toString(transform),
                      transition,
                      opacity: isDragging ? 0.5 : 1,
                      zIndex: isDragging ? 50 : undefined,
                    };
                    return (
                      <div ref={setNodeRef} style={style} className="flex flex-col items-center gap-1">
                        <span className="text-xs" style={{ color: "#8A7560" }}>إضافية {idx + 1}</span>
                        <div className="relative group">
                          {img.uploading ? (
                            <div className="w-24 h-24 rounded-xl flex items-center justify-center" style={{ background: "rgba(156,122,60,0.08)", border: "2px dashed rgba(156,122,60,0.3)" }}>
                              <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <img
                                src={img.url}
                                alt={`gallery-${idx}`}
                                className="w-24 h-24 rounded-xl object-cover select-none"
                                style={{ border: "1px solid rgba(156,122,60,0.3)" }}
                                draggable={false}
                              />
                              {/* Drag handle overlay */}
                              <div
                                {...attributes}
                                {...listeners}
                                className="absolute inset-0 rounded-xl flex items-end justify-center pb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-grab active:cursor-grabbing"
                                style={{ background: "rgba(0,0,0,0.35)" }}
                              >
                                <span className="text-white text-xs font-medium select-none">⠿ اسحب</span>
                              </div>
                            </>
                          )}
                          {!img.uploading && (
                            <button
                              type="button"
                              onClick={() => onRemove(idx)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center"
                              style={{ background: "#ef4444" }}
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  }

                  const sensors = useSensors(
                    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
                    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
                  );

                  const handleDragEnd = (event: DragEndEvent) => {
                    const { active, over } = event;
                    if (!over || active.id === over.id) return;
                    setGalleryImages((items) => {
                      const oldIdx = items.findIndex((i) => i.uid === active.id);
                      const newIdx = items.findIndex((i) => i.uid === over.id);
                      return arrayMove(items, oldIdx, newIdx);
                    });
                  };

                  return (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                      <SortableContext items={galleryImages.map((i) => i.uid)} strategy={rectSortingStrategy}>
                        {galleryImages.map((img, idx) => (
                          <SortableGalleryItem key={img.uid} img={img} idx={idx} onRemove={removeGalleryImage} />
                        ))}
                      </SortableContext>
                    </DndContext>
                  );
                })()}

                {/* Add more slot — show if total < 5 */}
                {galleryImages.length < 4 && form.image && (
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs" style={{ color: "#8A7560" }}>إضافية {galleryImages.length + 1}</span>
                    <label
                      className="flex flex-col items-center justify-center w-24 h-24 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        background: uploadingGallery ? "rgba(156,122,60,0.05)" : "rgba(156,122,60,0.06)",
                        border: "2px dashed rgba(156,122,60,0.3)",
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleGalleryImageFile(f); }}
                    >
                      <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleGalleryImageFile(f); }}
                        disabled={uploadingGallery}
                      />
                      {uploadingGallery ? <Loader2 className="w-5 h-5 text-yellow-500 animate-spin" /> : (
                        <><Plus className="w-5 h-5 text-yellow-500 mb-1" /><span className="text-xs text-yellow-600 text-center leading-tight">أضف<br/>صورة</span></>
                      )}
                    </label>
                  </div>
                )}
              </div>

              {/* URL fallback for primary image */}
              {!form.image && (
                <div className="space-y-1">
                  <p className="text-xs" style={{ color: "#8A7560" }}>أو الصق رابط URL للصورة الرئيسية:</p>
                  <Input
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    placeholder="https://..."
                    dir="ltr"
                    style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416", fontSize: "0.75rem" }}
                  />
                </div>
              )}
              <p className="text-xs" style={{ color: "#8A7560" }}>الصورة الرئيسية مطلوبة. يمكن إضافة حتى 4 صور إضافية — JPEG, PNG, WebP, GIF — حد أقصى 5MB لكل صورة</p>
            </div>
            {/* Description */}
            <div className="space-y-1 md:col-span-2">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الوصف *</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="وصف مختصر للمنتج..."
                rows={2}
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>
            {/* Badge */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>الشارة (اختياري)</Label>
              <Input
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="الأكثر طلباً"
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>
            {/* Badge Color */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>لون الشارة</Label>
              <div className="flex gap-2">
                <Input
                  value={form.badgeColor}
                  onChange={(e) => setForm({ ...form, badgeColor: e.target.value })}
                  placeholder="#B89050"
                  dir="ltr"
                  style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
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
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
            </div>
            {/* Occasion Keys */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>مفاتيح المناسبات (JSON مثال: ["weddings","corporate"])</Label>
              <Input
                value={form.occasionKeys}
                onChange={(e) => setForm({ ...form, occasionKeys: e.target.value })}
                placeholder='["weddings","corporate"]'
                dir="ltr"
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
              />
              <p className="text-xs" style={{ color: "#9C7A3C" }}>
                المفاتيح المتاحة: weddings, corporate, schools, catering, occasions, newborn, shields, boxes, calligraphy
              </p>
            </div>
            {/* Sort Order */}
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>ترتيب العرض</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
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
                style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}
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

      {/* Testimonial Add/Edit Dialog */}
      <Dialog open={testimonialDialogOpen} onOpenChange={setTestimonialDialogOpen}>
        <DialogContent className="max-w-lg" style={{ background: "#F7F3EC", border: "1px solid rgba(156,122,60,0.3)", direction: "rtl" }}>
          <DialogHeader>
            <DialogTitle className="text-right" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#9C7A3C" }}>
              {editingTestimonialId !== null ? "تعديل التقييم" : "إضافة تقييم جديد"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>اسم العميل *</Label>
                <Input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  placeholder="محمد العلي" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>المنصب (اختياري)</Label>
                <Input value={testimonialForm.position} onChange={(e) => setTestimonialForm({ ...testimonialForm, position: e.target.value })}
                  placeholder="مدير شركة" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm" style={{ color: "#4A3D2A" }}>نص التقييم *</Label>
              <Textarea value={testimonialForm.text} onChange={(e) => setTestimonialForm({ ...testimonialForm, text: e.target.value })}
                placeholder="اكتب رأي العميل..." rows={3} style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>التقييم (1-5)</Label>
                <Select value={String(testimonialForm.rating)} onValueChange={(v) => setTestimonialForm({ ...testimonialForm, rating: Number(v) })}>
                  <SelectTrigger style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5,4,3,2,1].map(n => <SelectItem key={n} value={String(n)}>{n} ★</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm" style={{ color: "#4A3D2A" }}>الترتيب</Label>
                <Input type="number" value={testimonialForm.sortOrder} onChange={(e) => setTestimonialForm({ ...testimonialForm, sortOrder: Number(e.target.value) })}
                  style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.3)", color: "#2C2416" }} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={testimonialForm.isActive} onCheckedChange={(v) => setTestimonialForm({ ...testimonialForm, isActive: v })} />
              <span className="text-sm" style={{ color: "#6B5A3E" }}>{testimonialForm.isActive ? "ظاهر" : "مخفي"}</span>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleTestimonialSubmit} disabled={createTestimonialMutation.isPending || updateTestimonialMutation.isPending}
                className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
                {(createTestimonialMutation.isPending || updateTestimonialMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "حفظ التقييم"}
              </Button>
              <Button variant="outline" onClick={() => setTestimonialDialogOpen(false)}
                style={{ borderColor: "rgba(156,122,60,0.3)", color: "#6B5A3E" }}>إلغاء</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
