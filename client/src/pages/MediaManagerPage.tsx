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

// ─── Occasions Tab ───────────────────────────────────────────────────────────

const OCCASION_OPTIONS = [
  { key: "catering", label: "الكيترنج والبوثات" },
  { key: "weddings", label: "الدزات والأفراح" },
  { key: "schools", label: "المدارس والمعلمات" },
  { key: "corporate", label: "الشركات والوزارات" },
  { key: "newborn", label: "الاستقبال والمواليد" },
  { key: "boxes", label: "العلب والصناديق" },
  { key: "shields", label: "الدروع والهديا" },
  { key: "occasions", label: "الأعياد والمناسبات" },
  { key: "printing", label: "المطبوعات الورقية" },
  { key: "manufacturing", label: "الطباعة والتصنيع" },
  { key: "decor", label: "الديكور الداخلي والنجارة" },
];

// ─── Occasion Manager Tab ─────────────────────────────────────────────────────
function OccasionManagerTab() {
  const utils = trpc.useUtils();
  const { data: dbOccasions = [], isLoading } = trpc.occasions.list.useQuery();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editOccasion, setEditOccasion] = useState<{ id: number; title: string; icon: string; desc: string; sortOrder: number } | null>(null);
  const [form, setForm] = useState({ key: "", title: "", icon: "🎉", desc: "", sortOrder: 0 });

  const createMut = trpc.occasions.create.useMutation({
    onSuccess: () => { utils.occasions.list.invalidate(); setShowAddDialog(false); setForm({ key: "", title: "", icon: "🎉", desc: "", sortOrder: 0 }); toast.success("تمت إضافة المناسبة"); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.occasions.update.useMutation({
    onSuccess: () => { utils.occasions.list.invalidate(); setEditOccasion(null); toast.success("تم تحديث المناسبة"); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.occasions.delete.useMutation({
    onSuccess: () => { utils.occasions.list.invalidate(); toast.success("تم حذف المناسبة"); },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#4A3728" }}>
          إدارة المناسبات
        </h2>
        <Button onClick={() => setShowAddDialog(true)} style={{ background: "#C9A84C", color: "#fff" }}>
          <Plus className="w-4 h-4 ml-1" /> إضافة مناسبة
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center py-8" style={{ color: "#9C7A3C" }}>جاري التحميل...</p>
      ) : dbOccasions.length === 0 ? (
        <div className="text-center py-12 rounded-xl border-2 border-dashed" style={{ borderColor: "#C9A84C", color: "#9C7A3C" }}>
          <p style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>لا توجد مناسبات بعد. اضغط "إضافة مناسبة" للبدء.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dbOccasions.map((occ) => (
            <div key={occ.id} className="rounded-xl p-4 border flex flex-col gap-2" style={{ background: "#FEFAF3", borderColor: "#E8D5A3" }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{occ.icon}</span>
                <div className="flex-1">
                  <p className="font-bold" style={{ fontFamily: "'Noto Naskh Arabic', serif", color: "#4A3728" }}>{occ.title}</p>
                  <p className="text-xs" style={{ color: "#9C7A3C" }}>key: {occ.key}</p>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditOccasion({ id: occ.id, title: occ.title, icon: occ.icon, desc: occ.desc ?? "", sortOrder: occ.sortOrder })}>
                    <Pencil className="w-4 h-4" style={{ color: "#C9A84C" }} />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("حذف هذه المناسبة؟")) deleteMut.mutate({ id: occ.id }); }}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
              {occ.desc && <p className="text-sm" style={{ color: "#7A6040", fontFamily: "'Noto Naskh Arabic', serif" }}>{occ.desc}</p>}
              <p className="text-xs" style={{ color: "#B0A080" }}>الترتيب: {occ.sortOrder}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>إضافة مناسبة جديدة</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>المفتاح (key) — بالإنجليزية بدون مسافات</Label>
              <Input className="mt-1" placeholder="مثال: catering" value={form.key} onChange={(e) => setForm(f => ({ ...f, key: e.target.value.replace(/\s/g, "-").toLowerCase() }))} />
            </div>
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>اسم المناسبة (عربي)</Label>
              <Input className="mt-1" placeholder="مثال: الكيترينج والبوثات" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>أيقونة (إيموجي)</Label>
              <Input className="mt-1" placeholder="🎉" value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>وصف مختصر (اختياري)</Label>
              <Input className="mt-1" placeholder="تجهيزات وخدمات متنوعة" value={form.desc} onChange={(e) => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>الترتيب</Label>
              <Input type="number" className="mt-1" value={form.sortOrder} onChange={(e) => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))} />
            </div>
          </div>
          <DialogFooter className="gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)} style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>إلغاء</Button>
            <Button disabled={!form.key || !form.title || createMut.isPending} onClick={() => createMut.mutate(form)} style={{ background: "#C9A84C", color: "#fff", fontFamily: "'Noto Naskh Arabic', serif" }}>
              {createMut.isPending ? "جاري..." : "إضافة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {editOccasion && (
        <Dialog open onOpenChange={() => setEditOccasion(null)}>
          <DialogContent dir="rtl" className="max-w-md">
            <DialogHeader>
              <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>تعديل المناسبة</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>اسم المناسبة (عربي)</Label>
                <Input className="mt-1" value={editOccasion.title} onChange={(e) => setEditOccasion({ ...editOccasion, title: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>أيقونة (إيموجي)</Label>
                <Input className="mt-1" value={editOccasion.icon} onChange={(e) => setEditOccasion({ ...editOccasion, icon: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>وصف مختصر</Label>
                <Input className="mt-1" value={editOccasion.desc} onChange={(e) => setEditOccasion({ ...editOccasion, desc: e.target.value })} />
              </div>
              <div>
                <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>الترتيب</Label>
                <Input type="number" className="mt-1" value={editOccasion.sortOrder} onChange={(e) => setEditOccasion({ ...editOccasion, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter className="gap-2 mt-4">
              <Button variant="outline" onClick={() => setEditOccasion(null)} style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>إلغاء</Button>
              <Button disabled={updateMut.isPending} onClick={() => updateMut.mutate({ id: editOccasion.id, title: editOccasion.title, icon: editOccasion.icon, desc: editOccasion.desc, sortOrder: editOccasion.sortOrder })} style={{ background: "#C9A84C", color: "#fff", fontFamily: "'Noto Naskh Arabic', serif" }}>
                {updateMut.isPending ? "جاري..." : "حفظ"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function OccasionsTab() {
  const utils = trpc.useUtils();
  // Load occasions dynamically from DB, fall back to static list
  const { data: dbOccasions = [] } = trpc.occasions.list.useQuery();
  const occasionOptions = dbOccasions.length > 0
    ? dbOccasions.map(o => ({ key: o.key, label: o.title }))
    : OCCASION_OPTIONS;

  const [selectedOccasion, setSelectedOccasion] = useState("");
  const activeKey = selectedOccasion || occasionOptions[0]?.key || "";

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const occasionLabel = occasionOptions.find(o => o.key === activeKey)?.label || "";

  const { data: photos = [], isLoading } = trpc.occasionPhotos.list.useQuery(
    { occasionKey: activeKey },
    { enabled: !!activeKey }
  );

  const addMutation = trpc.occasionPhotos.add.useMutation({
    onSuccess: () => {
      utils.occasionPhotos.list.invalidate();
      setShowAddDialog(false);
      setCaption("");
      setPreviewUrl(null);
      setSelectedFile(null);
      toast.success("تمت إضافة الصورة بنجاح");
    },
    onError: () => toast.error("حدث خطأ أثناء رفع الصورة"),
  });

  const deleteMutation = trpc.occasionPhotos.delete.useMutation({
    onSuccess: () => {
      utils.occasionPhotos.list.invalidate();
      toast.success("تم حذف الصورة");
    },
    onError: () => toast.error("حدث خطأ أثناء الحذف"),
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreviewUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = (e.target?.result as string).split(",")[1];
        await addMutation.mutateAsync({
          occasionKey: selectedOccasion,
          occasionLabel,
          base64,
          mimeType: selectedFile.type,
          caption: caption || undefined,
          sortOrder: photos.length,
        });
        setUploading(false);
      };
      reader.readAsDataURL(selectedFile);
    } catch {
      setUploading(false);
    }
  };

  return (
    <div dir="rtl">
      {/* Occasion selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {occasionOptions.map((occ) => (
          <button
            key={occ.key}
            onClick={() => setSelectedOccasion(occ.key)}
            className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: activeKey === occ.key ? "#9C7A3C" : "rgba(156,122,60,0.1)",
              color: activeKey === occ.key ? "#FFF" : "#9C7A3C",
              fontFamily: "'Noto Naskh Arabic', serif",
            }}
          >
            {occ.label}
          </button>
        ))}
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: "#2C2416", fontFamily: "'Noto Naskh Arabic', serif" }}>
          صور {occasionLabel} ({photos.length})
        </h3>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="flex items-center gap-2"
          style={{ background: "#9C7A3C", color: "#FFF" }}
        >
          <Plus className="w-4 h-4" />
          إضافة صورة
        </Button>
      </div>

      {/* Photos grid */}
      {isLoading ? (
        <div className="text-center py-12" style={{ color: "#9C7A3C" }}>جاري التحميل...</div>
      ) : photos.length === 0 ? (
        <div className="text-center py-16 rounded-2xl" style={{ background: "rgba(156,122,60,0.05)", border: "2px dashed rgba(156,122,60,0.2)" }}>
          <ImageIcon className="w-12 h-12 mx-auto mb-3" style={{ color: "rgba(156,122,60,0.4)" }} />
          <p style={{ color: "#9C7A3C", fontFamily: "'Noto Naskh Arabic', serif" }}>
            لا توجد صور لهذه المناسبة بعد
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-xl overflow-hidden" style={{ aspectRatio: "1", background: "#EDE8DF" }}>
              <img src={photo.imageUrl} alt={photo.caption || ""} className="w-full h-full object-cover" />
              {photo.caption && (
                <div className="absolute bottom-0 inset-x-0 px-2 py-1 text-xs text-white" style={{ background: "rgba(0,0,0,0.5)" }}>
                  {photo.caption}
                </div>
              )}
              {/* Delete overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deleteMutation.mutate({ id: photo.id })}
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add photo dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              إضافة صورة لـ {occasionLabel}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* File picker */}
            <div
              className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-amber-500 transition-colors"
              style={{ borderColor: "rgba(156,122,60,0.3)" }}
              onClick={() => fileInputRef.current?.click()}
            >
              {previewUrl ? (
                <img src={previewUrl} alt="preview" className="max-h-48 mx-auto rounded-lg object-contain" />
              ) : (
                <div>
                  <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(156,122,60,0.5)" }} />
                  <p className="text-sm" style={{ color: "#9C7A3C", fontFamily: "'Noto Naskh Arabic', serif" }}>
                    اضغط لاختيار صورة
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
            {/* Caption */}
            <div>
              <Label style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>وصف اختياري</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="مثال: بوكس هدايا رمضانية"
                dir="rtl"
                style={{ fontFamily: "'Noto Naskh Arabic', serif" }}
              />
            </div>
          </div>
          <DialogFooter className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>إلغاء</Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              style={{ background: "#9C7A3C", color: "#FFF" }}
            >
              {uploading ? "جاري الرفع..." : "رفع الصورة"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
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
        <Tabs defaultValue="occasions" dir="rtl">
          <TabsList className="mb-6" style={{ background: "rgba(156,122,60,0.1)" }}>
            <TabsTrigger value="manage-occasions" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              إدارة المناسبات
            </TabsTrigger>
            <TabsTrigger value="occasions" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              صور المناسبات
            </TabsTrigger>
            <TabsTrigger value="gallery" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              صور أعمالنا
            </TabsTrigger>
            <TabsTrigger value="services" style={{ fontFamily: "'Noto Naskh Arabic', serif" }}>
              بطاقات الخدمات
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manage-occasions">
            <OccasionManagerTab />
          </TabsContent>
          <TabsContent value="occasions">
            <OccasionsTab />
          </TabsContent>
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
