/**
 * MediaManagerPage — Admin page for managing:
 * 1. "أعمالنا" (Gallery) section images
 * 2. "خدماتنا" (Services) section cards
 *
 * Accessible only to admins via /admin/media
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Pencil, Plus, Upload, Eye, EyeOff, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

// ─── Types ────────────────────────────────────────────────────────────────────

type GalleryItem = {
  id: number;
  image: string;
  title: string;
  category: string;
  span: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type ServiceCard = {
  id: number;
  title: string;
  description: string;
  features: string;
  bgGradient: string;
  iconColor: string;
  accentColor: string;
  image: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

const SPAN_OPTIONS = [
  { value: "col-span-1 row-span-1", label: "عادي (1×1)" },
  { value: "col-span-2 row-span-1", label: "عريض (2×1)" },
  { value: "col-span-1 row-span-2", label: "طويل (1×2)" },
  { value: "col-span-2 row-span-2", label: "كبير (2×2)" },
];

const GRADIENT_PRESETS = [
  { label: "ذهبي", value: "linear-gradient(135deg, #B89050 0%, #9C7A3C 40%, #7A5C28 100%)" },
  { label: "أخضر", value: "linear-gradient(135deg, #5A8A5A 0%, #3D6B3D 40%, #2A5A2A 100%)" },
  { label: "وردي", value: "linear-gradient(135deg, #C4909A 0%, #A87080 40%, #8B5060 100%)" },
  { label: "أزرق", value: "linear-gradient(135deg, #5A7A9A 0%, #3D6080 40%, #2A4A6A 100%)" },
  { label: "بني", value: "linear-gradient(135deg, #8B6914 0%, #6B4F10 40%, #4A380A 100%)" },
];

// ─── Image Upload Helper ───────────────────────────────────────────────────────

function useImageUpload(
  uploadFn: (args: { base64: string; mimeType: string; filename: string }) => Promise<{ url: string }>
) {
  const [uploading, setUploading] = useState(false);

  const uploadFile = async (file: File): Promise<string | null> => {
    setUploading(true);
    try {
      const reader = new FileReader();
      return await new Promise((resolve, reject) => {
        reader.onload = async (e) => {
          try {
            const base64 = (e.target?.result as string).split(",")[1];
            const result = await uploadFn({ base64, mimeType: file.type, filename: file.name });
            resolve(result.url);
          } catch (err) {
            reject(err);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    } catch {
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab() {
  const utils = trpc.useUtils();
  const { data: items = [], isLoading } = trpc.gallery.list.useQuery();

  const uploadMutation = trpc.gallery.uploadImage.useMutation();
  const { uploadFile, uploading } = useImageUpload((args) => uploadMutation.mutateAsync(args));

  const createMutation = trpc.gallery.create.useMutation({
    onSuccess: () => {
      utils.gallery.list.invalidate();
      toast.success("تم إضافة الصورة بنجاح");
      setShowAddDialog(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.gallery.update.useMutation({
    onSuccess: () => {
      utils.gallery.list.invalidate();
      toast.success("تم تحديث الصورة");
      setEditItem(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.gallery.delete.useMutation({
    onSuccess: () => {
      utils.gallery.list.invalidate();
      toast.success("تم حذف الصورة");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editItem, setEditItem] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState({ image: "", title: "", category: "", span: "col-span-1 row-span-1", sortOrder: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => setForm({ image: "", title: "", category: "", span: "col-span-1 row-span-1", sortOrder: 0 });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      if (isEdit && editItem) {
        setEditItem({ ...editItem, image: url });
      } else {
        setForm((f) => ({ ...f, image: url }));
      }
    } else {
      toast.error("فشل رفع الصورة");
    }
  };

  const handleAdd = () => {
    if (!form.image || !form.title || !form.category) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    createMutation.mutate(form);
  };

  const handleUpdate = () => {
    if (!editItem) return;
    updateMutation.mutate({
      id: editItem.id,
      image: editItem.image,
      title: editItem.title,
      category: editItem.category,
      span: editItem.span,
      sortOrder: editItem.sortOrder,
      isActive: editItem.isActive,
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#2C2416" }}>
            صور قسم "أعمالنا"
          </h2>
          <p className="text-sm mt-1" style={{ color: "#7A6A50" }}>
            إدارة الصور التي تظهر في قسم أعمالنا على الصفحة الرئيسية
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddDialog(true); }}
          className="flex items-center gap-2"
          style={{ background: "#9C7A3C", color: "#fff" }}
        >
          <Plus size={16} />
          إضافة صورة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl animate-pulse" style={{ background: "#E8DFD0" }} />
          ))}
        </div>
      ) : (items as GalleryItem[]).length === 0 ? (
        <div className="text-center py-16" style={{ color: "#7A6A50" }}>
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد صور بعد</p>
          <p className="text-sm mt-1">اضغط "إضافة صورة" لإضافة أول صورة</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {(items as GalleryItem[]).map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden group"
              style={{
                border: "1px solid rgba(156,122,60,0.2)",
                opacity: item.isActive ? 1 : 0.5,
              }}
            >
              <img src={item.image} alt={item.title} className="w-full h-48 object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <p className="text-white text-sm font-bold text-center px-2">{item.title}</p>
                <p className="text-white/70 text-xs">{item.category}</p>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                    onClick={() => setEditItem(item)}
                  >
                    <Pencil size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 border-white/40 text-white hover:bg-red-500/60"
                    onClick={() => {
                      if (confirm("هل تريد حذف هذه الصورة؟")) {
                        deleteMutation.mutate({ id: item.id });
                      }
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/20 border-white/40 text-white hover:bg-white/30"
                    onClick={() => updateMutation.mutate({ id: item.id, isActive: !item.isActive })}
                  >
                    {item.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                  </Button>
                </div>
              </div>
              {!item.isActive && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                  مخفي
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>إضافة صورة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>الصورة *</Label>
              <div className="mt-1 flex flex-col gap-2">
                {form.image && (
                  <img src={form.image} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  <Upload size={16} className="ml-2" />
                  {uploading ? "جاري الرفع..." : "رفع صورة"}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, false)}
                />
                <p className="text-xs text-center" style={{ color: "#7A6A50" }}>أو</p>
                <Input
                  placeholder="رابط الصورة (URL)"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>العنوان *</Label>
              <Input
                className="mt-1"
                placeholder="مثال: بوكسات فاخرة"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
            </div>
            <div>
              <Label>التصنيف *</Label>
              <Input
                className="mt-1"
                placeholder="مثال: هدايا فاخرة"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              />
            </div>
            <div>
              <Label>الحجم في الشبكة</Label>
              <Select value={form.span} onValueChange={(v) => setForm((f) => ({ ...f, span: v }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SPAN_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>ترتيب العرض</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.sortOrder}
                onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleAdd}
              disabled={createMutation.isPending || uploading}
              style={{ background: "#9C7A3C", color: "#fff" }}
            >
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editItem && (
        <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
          <DialogContent className="max-w-md" dir="rtl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>تعديل الصورة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>الصورة</Label>
                <div className="mt-1 flex flex-col gap-2">
                  {editItem.image && (
                    <img src={editItem.image} alt="preview" className="w-full h-40 object-cover rounded-lg" />
                  )}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    <Upload size={16} className="ml-2" />
                    {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                  </Button>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, true)}
                  />
                  <Input
                    placeholder="رابط الصورة (URL)"
                    value={editItem.image}
                    onChange={(e) => setEditItem({ ...editItem, image: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>العنوان</Label>
                <Input
                  className="mt-1"
                  value={editItem.title}
                  onChange={(e) => setEditItem({ ...editItem, title: e.target.value })}
                />
              </div>
              <div>
                <Label>التصنيف</Label>
                <Input
                  className="mt-1"
                  value={editItem.category}
                  onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                />
              </div>
              <div>
                <Label>الحجم في الشبكة</Label>
                <Select value={editItem.span} onValueChange={(v) => setEditItem({ ...editItem, span: v })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SPAN_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={editItem.sortOrder}
                  onChange={(e) => setEditItem({ ...editItem, sortOrder: Number(e.target.value) })}
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditItem(null)}>إلغاء</Button>
              <Button
                onClick={handleUpdate}
                disabled={updateMutation.isPending || uploading}
                style={{ background: "#9C7A3C", color: "#fff" }}
              >
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Services Tab ─────────────────────────────────────────────────────────────

function ServicesTab() {
  const utils = trpc.useUtils();
  const { data: cards = [], isLoading } = trpc.services.list.useQuery();

  const uploadMutation = trpc.services.uploadImage.useMutation();
  const { uploadFile, uploading } = useImageUpload((args) => uploadMutation.mutateAsync(args));

  const createMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success("تم إضافة الخدمة بنجاح");
      setShowAddDialog(false);
      resetForm();
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success("تم تحديث الخدمة");
      setEditCard(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success("تم حذف الخدمة");
    },
    onError: (e) => toast.error(e.message),
  });

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editCard, setEditCard] = useState<ServiceCard | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    features: "",
    bgGradient: GRADIENT_PRESETS[0].value,
    iconColor: "#FFF3D0",
    accentColor: "#F5E0A0",
    image: "",
    sortOrder: 0,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => setForm({
    title: "",
    description: "",
    features: "",
    bgGradient: GRADIENT_PRESETS[0].value,
    iconColor: "#FFF3D0",
    accentColor: "#F5E0A0",
    image: "",
    sortOrder: 0,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadFile(file);
    if (url) {
      if (isEdit && editCard) {
        setEditCard({ ...editCard, image: url });
      } else {
        setForm((f) => ({ ...f, image: url }));
      }
    } else {
      toast.error("فشل رفع الصورة");
    }
  };

  const handleAdd = () => {
    if (!form.title || !form.description) {
      toast.error("يرجى تعبئة العنوان والوصف");
      return;
    }
    const featuresArr = form.features.split("\n").map((f) => f.trim()).filter(Boolean);
    createMutation.mutate({
      ...form,
      features: JSON.stringify(featuresArr),
      image: form.image || undefined,
    });
  };

  const handleUpdate = () => {
    if (!editCard) return;
    const featuresArr = editCard.features.startsWith("[")
      ? editCard.features
      : JSON.stringify(editCard.features.split("\n").map((f) => f.trim()).filter(Boolean));
    updateMutation.mutate({
      id: editCard.id,
      title: editCard.title,
      description: editCard.description,
      features: featuresArr,
      bgGradient: editCard.bgGradient,
      iconColor: editCard.iconColor,
      accentColor: editCard.accentColor,
      image: editCard.image || null,
      sortOrder: editCard.sortOrder,
      isActive: editCard.isActive,
    });
  };

  const getFeaturesList = (features: string): string[] => {
    try { return JSON.parse(features); } catch { return features.split("\n").filter(Boolean); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#2C2416" }}>
            بطاقات قسم "خدماتنا"
          </h2>
          <p className="text-sm mt-1" style={{ color: "#7A6A50" }}>
            إدارة بطاقات الخدمات التي تظهر في قسم خدماتنا على الصفحة الرئيسية
          </p>
        </div>
        <Button
          onClick={() => { resetForm(); setShowAddDialog(true); }}
          className="flex items-center gap-2"
          style={{ background: "#9C7A3C", color: "#fff" }}
        >
          <Plus size={16} />
          إضافة خدمة
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl animate-pulse" style={{ background: "#E8DFD0" }} />
          ))}
        </div>
      ) : (cards as ServiceCard[]).length === 0 ? (
        <div className="text-center py-16" style={{ color: "#7A6A50" }}>
          <ImageIcon size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg">لا توجد خدمات بعد</p>
          <p className="text-sm mt-1">اضغط "إضافة خدمة" لإضافة أول خدمة</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(cards as ServiceCard[]).map((card) => (
            <div
              key={card.id}
              className="rounded-xl overflow-hidden flex"
              style={{
                border: "1px solid rgba(156,122,60,0.2)",
                opacity: card.isActive ? 1 : 0.5,
              }}
            >
              {/* Color / image preview */}
              <div
                className="w-24 flex-shrink-0 flex items-center justify-center"
                style={{ background: card.bgGradient }}
              >
                {card.image ? (
                  <img src={card.image} alt={card.title} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={28} style={{ color: card.iconColor }} />
                )}
              </div>
              {/* Content */}
              <div className="flex-1 p-4" style={{ background: "#F7F3EC" }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-sm" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#2C2416" }}>
                      {card.title}
                    </h3>
                    <p className="text-xs mt-1 line-clamp-2" style={{ color: "#7A6A50" }}>{card.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {getFeaturesList(card.features).map((f, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(156,122,60,0.1)", color: "#9C7A3C" }}>
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-1 mr-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditCard(card)}>
                      <Pencil size={14} style={{ color: "#9C7A3C" }} />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => updateMutation.mutate({ id: card.id, isActive: !card.isActive })}>
                      {card.isActive ? <EyeOff size={14} style={{ color: "#7A6A50" }} /> : <Eye size={14} style={{ color: "#9C7A3C" }} />}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => { if (confirm("هل تريد حذف هذه الخدمة؟")) deleteMutation.mutate({ id: card.id }); }}
                    >
                      <Trash2 size={14} style={{ color: "#DC2626" }} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>إضافة خدمة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>عنوان الخدمة *</Label>
              <Input className="mt-1" placeholder="مثال: كيترنج وبوثات" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>الوصف *</Label>
              <Textarea className="mt-1" rows={3} placeholder="وصف مختصر للخدمة" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>المميزات (كل ميزة في سطر)</Label>
              <Textarea className="mt-1" rows={3} placeholder={"ميزة 1\nميزة 2\nميزة 3"} value={form.features} onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))} />
            </div>
            <div>
              <Label>لون الخلفية</Label>
              <Select value={form.bgGradient} onValueChange={(v) => setForm((f) => ({ ...f, bgGradient: v }))}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GRADIENT_PRESETS.map((g) => (
                    <SelectItem key={g.value} value={g.value}>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded" style={{ background: g.value }} />
                        {g.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>صورة اختيارية (تستبدل الأيقونة)</Label>
              <div className="mt-1 flex flex-col gap-2">
                {form.image && <img src={form.image} alt="preview" className="w-full h-32 object-cover rounded-lg" />}
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                  <Upload size={16} className="ml-2" />
                  {uploading ? "جاري الرفع..." : "رفع صورة"}
                </Button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, false)} />
                <Input placeholder="أو أدخل رابط الصورة" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>ترتيب العرض</Label>
              <Input type="number" className="mt-1" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button onClick={handleAdd} disabled={createMutation.isPending || uploading} style={{ background: "#9C7A3C", color: "#fff" }}>
              {createMutation.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editCard && (
        <Dialog open={!!editCard} onOpenChange={() => setEditCard(null)}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>تعديل الخدمة</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>عنوان الخدمة</Label>
                <Input className="mt-1" value={editCard.title} onChange={(e) => setEditCard({ ...editCard, title: e.target.value })} />
              </div>
              <div>
                <Label>الوصف</Label>
                <Textarea className="mt-1" rows={3} value={editCard.description} onChange={(e) => setEditCard({ ...editCard, description: e.target.value })} />
              </div>
              <div>
                <Label>المميزات (كل ميزة في سطر)</Label>
                <Textarea
                  className="mt-1"
                  rows={3}
                  value={(() => { try { return JSON.parse(editCard.features).join("\n"); } catch { return editCard.features; } })()}
                  onChange={(e) => setEditCard({ ...editCard, features: e.target.value })}
                />
              </div>
              <div>
                <Label>لون الخلفية</Label>
                <Select value={editCard.bgGradient} onValueChange={(v) => setEditCard({ ...editCard, bgGradient: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GRADIENT_PRESETS.map((g) => (
                      <SelectItem key={g.value} value={g.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded" style={{ background: g.value }} />
                          {g.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>صورة اختيارية</Label>
                <div className="mt-1 flex flex-col gap-2">
                  {editCard.image && <img src={editCard.image} alt="preview" className="w-full h-32 object-cover rounded-lg" />}
                  <Button variant="outline" className="w-full" onClick={() => editFileInputRef.current?.click()} disabled={uploading}>
                    <Upload size={16} className="ml-2" />
                    {uploading ? "جاري الرفع..." : "تغيير الصورة"}
                  </Button>
                  <input ref={editFileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                  <Input placeholder="رابط الصورة" value={editCard.image ?? ""} onChange={(e) => setEditCard({ ...editCard, image: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input type="number" className="mt-1" value={editCard.sortOrder} onChange={(e) => setEditCard({ ...editCard, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setEditCard(null)}>إلغاء</Button>
              <Button onClick={handleUpdate} disabled={updateMutation.isPending || uploading} style={{ background: "#9C7A3C", color: "#fff" }}>
                {updateMutation.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MediaManagerPage() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#F2EDE4" }}>
        <div
          className="animate-spin w-8 h-8 rounded-full border-2"
          style={{ borderColor: "#9C7A3C", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: "#F2EDE4", direction: "rtl" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b" style={{ background: "#F7F3EC", borderColor: "rgba(156,122,60,0.2)" }}>
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} style={{ color: "#9C7A3C" }}>
            ← لوحة التحكم
          </Button>
          <span style={{ color: "rgba(156,122,60,0.4)" }}>|</span>
          <h1 className="text-lg font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#2C2416" }}>
            إدارة الصور والخدمات
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Tabs defaultValue="gallery" dir="rtl">
          <TabsList className="mb-6" style={{ background: "rgba(156,122,60,0.1)" }}>
            <TabsTrigger value="gallery" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              صور أعمالنا
            </TabsTrigger>
            <TabsTrigger value="services" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              بطاقات الخدمات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="gallery">
            <GalleryTab />
          </TabsContent>
          <TabsContent value="services">
            <ServicesTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
