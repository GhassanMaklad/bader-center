import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
import { invokeLLM } from "./_core/llm";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
  getProductImages,
  createProductImage,
  deleteProductImage,
  updateProductImagesSortOrder,
  getRelatedProducts,
  createServiceRequest,
  getAllServiceRequests,
  updateServiceRequestStatus,
  createOrder,
  updateOrderStatus,
  updateOrderAdminNotes,
  getAllOrders,
  getAllGalleryItems,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  getAllServiceCards,
  createServiceCard,
  updateServiceCard,
  deleteServiceCard,
  getOccasionPhotos,
  createOccasionPhoto,
  updateOccasionPhoto,
  deleteOccasionPhoto,
  getAllOccasions,
  createOccasion,
  updateOccasion,
  deleteOccasion,
  getAllAnnouncements,
  getActiveAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  getActiveTestimonials,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from "./db";

// ─── Admin middleware ──────────────────────────────────────────────────────────
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// ─── Product input schema ──────────────────────────────────────────────────────
const productInput = z.object({
  name: z.string().min(1),
  nameEn: z.string().optional().default(""),
  category: z.enum(["gifts", "shields", "catering", "occasions", "calligraphy"]),
  price: z.string().min(1),
  priceValue: z.number().min(0).default(0),
  priceNote: z.string().nullable().optional(),
  image: z.string().min(1),
  badge: z.string().nullable().optional(),
  badgeColor: z.string().nullable().optional(),
  description: z.string().min(1),
  rating: z.number().min(1).max(5).default(5),
  inStock: z.boolean().default(true),
  tags: z.string().nullable().optional(),
  occasionKeys: z.string().nullable().optional(),
  sortOrder: z.number().default(0),
});

// ─── Bader Center AI knowledge base ───────────────────────────────────────────
const BADER_SYSTEM_PROMPT = `أنت مساعد ذكي لـ "مركز بدر" — شركة كويتية فاخرة متخصصة في تنظيم المناسبات والهدايا والكيترنج منذ عام 2004، تقع في الفحيحيل، الكويت.

معلومات الشركة:
- الاسم: مركز بدر (Bader Center)
- الموقع: الفحيحيل، الكويت
- الهاتف / واتساب: 22675826 (الكويت)
- الإنستغرام: @badercenterco
- سنوات الخبرة: أكثر من 20 عاماً (منذ 2004)
- ساعات العمل: السبت–الخميس 9 صباحاً–10 مساءً، الجمعة 4 مساءً–10 مساءً

الخدمات الرئيسية:
1. الكيترنج والبوثات: تجهيز بوثات الكيترنج الفاخرة للمناسبات والفعاليات، توصيل لجميع مناطق الكويت
2. الهدايا والدزات: دزات الورود، هدايا رمضان، هدايا الأعياد، بوكسات مخصصة، تغليف فاخر
3. الدروع والتكريم: دروع تكريمية فاخرة مخصصة، شهادات تقدير، هدايا المؤسسات
4. الأفراح والاستقبالات: تجهيز حفلات الأعراس والاستقبالات بالكامل
5. الخط العربي والنقش: لوحات خط عربي يدوي، نقش على الهدايا والدروع
6. المناسبات الوطنية: تجهيزات العيد الوطني الكويتي، قرقيعان، رمضان، الأعياد

المنتجات والأسعار التقريبية:
- دزة الورود الفاخرة: من 45 د.ك
- هبّة رمضان: من 35 د.ك
- عيدية العيد الذهبية: من 25 د.ك
- درع تكريمي فاخر: من 30 د.ك
- درع بلوري مخصص: من 55 د.ك
- بوكس هدية مخصص: من 20 د.ك
- لوحة خط عربي بالخيوط: من 120 د.ك
- تجهيز بوث كيترنج: تواصل للسعر
- قرقيعان 2026: من 15 د.ك

المناسبات التي يخدمها المركز:
الأعراس والأفراح، حفلات التخرج، الأعياد الوطنية، رمضان والعيد، قرقيعان، حفلات الشركات، مناسبات التكريم، المؤتمرات والفعاليات، حفلات الميلاد، الاحتفالات العائلية

تعليمات الرد:
- تحدث دائماً بالعربية الفصيحة السهلة (يمكن استخدام بعض العبارات الكويتية)
- كن ودوداً ومحترفاً وموجزاً
- إذا سأل العميل عن السعر، أعطه السعر التقريبي وشجعه على التواصل للحصول على عرض دقيق
- إذا أراد العميل طلب خدمة، وجّهه إلى صفحة طلب الخدمة: /request أو واتساب: 22675826
- لا تخترع معلومات غير موجودة في هذا الملف
- إذا لم تعرف الإجابة، قل ذلك بأدب وشجّع على التواصل المباشر
- الردود يجب أن تكون قصيرة ومفيدة (3-5 جمل كحد أقصى)
`;



// ─── Cart item schema ──────────────────────────────────────────────────────────
const cartItemSchema = z.object({
  productId: z.number(),
  name: z.string(),
  qty: z.number().min(1),
  price: z.number().min(0),
});

// ─── App Router ────────────────────────────────────────────────────────────────
export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── AI Chatbot ─────────────────────────────────────────────────────────────
  chatbot: router({
    chat: publicProcedure
      .input(
        z.object({
          messages: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().min(1).max(1000),
              })
            )
            .min(1)
            .max(20),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const result = await invokeLLM({
            messages: [
              { role: "system", content: BADER_SYSTEM_PROMPT },
              ...input.messages.map((m) => ({ role: m.role, content: m.content })),
            ],
            maxTokens: 400,
          });

          const content = result.choices[0]?.message?.content;
          const text =
            typeof content === "string"
              ? content
              : "عذراً، حدث خطأ. يرجى المحاولة مجدداً.";
          return { reply: text };
        } catch (err) {
          console.error("[Chatbot] LLM error:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "عذراً، الخدمة غير متاحة حالياً. يرجى التواصل عبر واتساب.",
          });
        }
      }),
  }),

  // ─── Image Upload (admin only) ─────────────────────────────────────────────
  upload: router({
    productImage: adminProcedure
      .input(
        z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          dataBase64: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF",
          });
        }
        if (input.dataBase64.length > 7_000_000) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "حجم الصورة يتجاوز الحد المسموح (5MB)",
          });
        }
        const buffer = Buffer.from(input.dataBase64, "base64");
        const ext = input.filename.split(".").pop() ?? "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const key = `products/${Date.now()}-${randomSuffix}.${ext}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        return { url };
      }),
  }),

  // ─── Products (public read, admin write) ───────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      return getAllProducts();
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        return product;
      }),

    create: adminProcedure.input(productInput).mutation(async ({ input }) => {
      const result = await createProduct({
        ...input,
        priceValue: String(input.priceValue),
        nameEn: input.nameEn ?? "",
        tags: input.tags ?? null,
        badge: input.badge ?? null,
        badgeColor: input.badgeColor ?? null,
        priceNote: input.priceNote ?? null,
      });
      const insertId = (result as unknown as { insertId?: number })?.insertId ?? null;
      return { success: true, id: insertId };
    }),

    bulkCreate: adminProcedure
      .input(z.object({ products: z.array(productInput) }))
      .mutation(async ({ input }) => {
        let created = 0;
        const errors: string[] = [];
        for (const p of input.products) {
          try {
            await createProduct({
              ...p,
              priceValue: String(p.priceValue),
              nameEn: p.nameEn ?? "",
              tags: p.tags ?? null,
              badge: p.badge ?? null,
              badgeColor: p.badgeColor ?? null,
              priceNote: p.priceNote ?? null,
            });
            created++;
          } catch (e) {
            errors.push(`${p.name}: ${(e as Error).message}`);
          }
        }
        return { success: true, created, errors };
      }),

    update: adminProcedure
      .input(z.object({ id: z.number(), data: productInput.partial() }))
      .mutation(async ({ input }) => {
        const updateData: Record<string, unknown> = { ...input.data };
        if (input.data.priceValue !== undefined) {
          updateData.priceValue = String(input.data.priceValue);
        }
        await updateProduct(input.id, updateData as Parameters<typeof updateProduct>[1]);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),

    toggleStock: adminProcedure
      .input(z.object({ id: z.number(), inStock: z.boolean() }))
      .mutation(async ({ input }) => {
        await toggleProductStock(input.id, input.inStock);
        return { success: true };
      }),

    // Get full product detail with images and related products
    detail: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await getProductById(input.id);
        if (!product) throw new TRPCError({ code: "NOT_FOUND" });
        const images = await getProductImages(input.id);
        const related = await getRelatedProducts(input.id, product.category, product.occasionKeys ?? null);
        return { product, images, related };
      }),
  }),

  // ─── Product Images (admin only) ───────────────────────────────────────────────────
  productImages: router({
    list: publicProcedure
      .input(z.object({ productId: z.number() }))
      .query(async ({ input }) => {
        return getProductImages(input.productId);
      }),

    add: adminProcedure
      .input(
        z.object({
          productId: z.number(),
          filename: z.string().min(1),
          contentType: z.string().min(1),
          dataBase64: z.string().min(1),
          caption: z.string().optional(),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(input.contentType)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "نوع الملف غير مدعوم" });
        }
        if (input.dataBase64.length > 7_000_000) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "حجم الصورة يتجاوز الحد المسموح (5MB)" });
        }
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.dataBase64, "base64");
        const ext = input.filename.split(".").pop() ?? "jpg";
        const randomSuffix = Math.random().toString(36).substring(2, 10);
        const key = `product-gallery/${input.productId}/${Date.now()}-${randomSuffix}.${ext}`;
        const { url } = await storagePut(key, buffer, input.contentType);
        await createProductImage({
          productId: input.productId,
          imageUrl: url,
          caption: input.caption ?? null,
          sortOrder: input.sortOrder,
        });
        return { url };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProductImage(input.id);
        return { success: true };
      }),

    // Persist new sort order after drag-and-drop reordering
    reorder: adminProcedure
      .input(
        z.object({
          // Array of { id, sortOrder } pairs in the new order
          items: z.array(z.object({ id: z.number(), sortOrder: z.number() })),
        })
      )
      .mutation(async ({ input }) => {
        await updateProductImagesSortOrder(input.items);
        return { success: true };
      }),
  }),

  // ─── Service Requests ──────────────────────────────────────────────────────
  serviceRequests: router({
    submit: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          phone: z.string().min(7),
          occasion: z.string().min(1),
          occasionLabel: z.string().min(1),
          date: z.string().min(1),
          budget: z.string().min(1),
          budgetLabel: z.string().min(1),
          notes: z.string().optional().default(""),
        })
      )
      .mutation(async ({ input }) => {
        await createServiceRequest({
          name: input.name,
          phone: input.phone,
          occasion: input.occasion,
          occasionLabel: input.occasionLabel,
          date: input.date,
          budget: input.budget,
          budgetLabel: input.budgetLabel,
          notes: input.notes || null,
          status: "new",
        });

        notifyOwner({
          title: `🌟 طلب خدمة جديد — ${input.name}`,
          content: [
            `👤 الاسم: ${input.name}`,
            `📞 الهاتف: ${input.phone}`,
            `🎉 المناسبة: ${input.occasionLabel}`,
            `📅 التاريخ: ${input.date}`,
            `💰 الميزانية: ${input.budgetLabel}`,
            input.notes ? `📝 ملاحظات: ${input.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }).catch((err) => console.warn("[Notification] Failed:", err));

        return { success: true };
      }),

    list: adminProcedure.query(async () => {
      return getAllServiceRequests();
    }),

    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["new", "contacted", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateServiceRequestStatus(input.id, input.status);
        return { success: true };
      }),
  }),

  // ─── Orders (WhatsApp-based flow) ────────────────────────────────────────
  orders: router({
    /**
     * Log a single-product WhatsApp order (from product page / catalog).
     * Called just before the frontend opens the WhatsApp link.
     */
    logWhatsappOrder: publicProcedure
      .input(
        z.object({
          productId: z.number(),
          productName: z.string(),
          productPrice: z.string(),
          productUrl: z.string(),
          qty: z.number().min(1).default(1),
          deliveryDate: z.string().optional(),  // ISO date string e.g. "2026-04-15"
          notes: z.string().optional(),
          customerName: z.string().optional(),
          customerPhone: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const cartItems = JSON.stringify([{
          productId: input.productId,
          name: input.productName,
          qty: input.qty,
          price: 0,
        }]);

        const notesLines: string[] = [];
        if (input.deliveryDate) notesLines.push(`تاريخ التسليم: ${input.deliveryDate}`);
        if (input.notes?.trim()) notesLines.push(`ملاحظات: ${input.notes.trim()}`);

        const result = await createOrder({
          customerName: input.customerName?.trim() || "عميل واتساب",
          customerPhone: input.customerPhone?.trim() || "",
          totalAmount: "0",
          currency: "KWD",
          status: "pending",
          cartItems,
          notes: notesLines.join(" | ") || null,
        });

        const orderId = (result as { insertId: number }).insertId;

        // Notify owner immediately
        const customerLabel = input.customerName?.trim() || "عميل واتساب";
        notifyOwner({
          title: `📦 طلب واتساب جديد — ${input.productName}`,
          content: [
            `📦 *المنتج:* ${input.productName}`,
            `💰 *السعر:* ${input.productPrice}`,
            `🔢 *الكمية:* ${input.qty}`,
            input.deliveryDate ? `📅 *تاريخ التسليم:* ${input.deliveryDate}` : "",
            input.notes?.trim() ? `📝 *ملاحظات:* ${input.notes.trim()}` : "",
            `👤 *العميل:* ${customerLabel}`,
            input.customerPhone?.trim() ? `📞 *الهاتف:* ${input.customerPhone.trim()}` : "",
            `🔗 *رابط المنتج:* ${input.productUrl}`,
            `🔖 *رقم الطلب:* #${orderId}`,
          ].filter(Boolean).join("\n"),
        }).catch((err) => console.warn("[Notification] Failed:", err));

        return { success: true, orderId };
      }),

    /**
     * Save an order from the cart to the DB for admin tracking.
     * The actual order is sent to WhatsApp by the frontend.
     */
    saveOrder: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerPhone: z.string().min(7),
          totalAmount: z.number().min(0),
          cartItems: z.array(cartItemSchema).min(1),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await createOrder({
          customerName: input.customerName,
          customerPhone: input.customerPhone,
          totalAmount: String(input.totalAmount.toFixed(3)),
          currency: "KWD",
          status: "pending",
          cartItems: JSON.stringify(input.cartItems),
          notes: input.notes ?? null,
        });

        const orderId = (result as { insertId: number }).insertId;

        // Notify owner of new WhatsApp order
        notifyOwner({
          title: `🛒 طلب واتساب جديد — ${input.customerName}`,
          content: [
            `👤 الاسم: ${input.customerName}`,
            `📞 الهاتف: ${input.customerPhone}`,
            `💰 الإجمالي: ${input.totalAmount.toFixed(3)} د.ك`,
            `📦 المنتجات: ${input.cartItems.map((i) => `${i.name} ×${i.qty}`).join("، ")}`,
            input.notes ? `📝 ملاحظات: ${input.notes}` : "",
          ]
            .filter(Boolean)
            .join("\n"),
        }).catch((err) => console.warn("[Notification] Failed:", err));

        return { success: true, orderId };
      }),

    /**
     * Admin: list all orders.
     */
    list: adminProcedure.query(async () => {
      return getAllOrders();
    }),

    /**
     * Admin: update order status manually.
     */
    updateStatus: adminProcedure
      .input(
        z.object({
          id: z.number(),
          status: z.enum(["pending", "confirmed", "paid", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        return { success: true };
      }),

    /**
     * Admin: update internal notes for an order (not visible to customers).
     */
    updateAdminNotes: adminProcedure
      .input(
        z.object({
          id: z.number(),
          adminNotes: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderAdminNotes(input.id, input.adminNotes);
        return { success: true };
      }),
  }),

  // ─── Gallery Items (Homepage "أعمالنا" section) ────────────────────────────────────────
  gallery: router({
    list: publicProcedure.query(async () => {
      return getAllGalleryItems();
    }),

    create: adminProcedure
      .input(
        z.object({
          image: z.string().min(1),
          title: z.string().min(1),
          category: z.string().min(1),
          span: z.string().default("col-span-1 row-span-1"),
          sortOrder: z.number().default(0),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        await createGalleryItem(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          image: z.string().optional(),
          title: z.string().optional(),
          category: z.string().optional(),
          span: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateGalleryItem(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteGalleryItem(input.id);
        return { success: true };
      }),

    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
          filename: z.string().default("gallery.jpg"),
        })
      )
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const key = `gallery/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),

  // ─── Service Cards (Homepage "خدماتنا" section) ─────────────────────────────────────────────
  services: router({
    list: publicProcedure.query(async () => {
      return getAllServiceCards();
    }),

    create: adminProcedure
      .input(
        z.object({
          title: z.string().min(1),
          description: z.string().min(1),
          features: z.string().min(1),  // JSON array string
          bgGradient: z.string().default("linear-gradient(135deg, #B89050 0%, #9C7A3C 40%, #7A5C28 100%)"),
          iconColor: z.string().default("#FFF3D0"),
          accentColor: z.string().default("#F5E0A0"),
          image: z.string().nullable().optional(),
          sortOrder: z.number().default(0),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ input }) => {
        await createServiceCard(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          features: z.string().optional(),
          bgGradient: z.string().optional(),
          iconColor: z.string().optional(),
          accentColor: z.string().optional(),
          image: z.string().nullable().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateServiceCard(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteServiceCard(input.id);
        return { success: true };
      }),

    uploadImage: adminProcedure
      .input(
        z.object({
          base64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
          filename: z.string().default("service.jpg"),
        })
      )
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const key = `services/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),
  }),

  // ─── Occasions Management Router ────────────────────────────────────────────────────
  occasions: router({
    // Public: list all occasions
    list: publicProcedure.query(async () => {
      return getAllOccasions();
    }),
    // Admin: create a new occasion
    create: adminProcedure
      .input(
        z.object({
          key: z.string().min(1),
          title: z.string().min(1),
          icon: z.string().default("🎉"),
          desc: z.string().default(""),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        await createOccasion({
          key: input.key,
          title: input.title,
          icon: input.icon,
          desc: input.desc,
          sortOrder: input.sortOrder,
          isActive: true,
        });
        return { success: true };
      }),
    // Admin: update an occasion
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          title: z.string().optional(),
          icon: z.string().optional(),
          desc: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateOccasion(id, data);
        return { success: true };
      }),
    // Admin: delete an occasion
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteOccasion(input.id);
        return { success: true };
      }),
  }),

  // ─── Occasion Photos Router ─────────────────────────────────────────────────────
  occasionPhotos: router({
    // Public: list photos for a specific occasion (used in OccasionsSection)
    list: publicProcedure
      .input(z.object({ occasionKey: z.string().optional() }))
      .query(async ({ input }) => {
        return getOccasionPhotos(input.occasionKey);
      }),

    // Admin: add a new photo
    add: adminProcedure
      .input(
        z.object({
          occasionKey: z.string().min(1),
          occasionLabel: z.string().min(1),
          base64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
          caption: z.string().optional(),
          sortOrder: z.number().default(0),
        })
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.base64, "base64");
        const key = `occasions/${input.occasionKey}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        await createOccasionPhoto({
          occasionKey: input.occasionKey,
          occasionLabel: input.occasionLabel,
          imageUrl: url,
          caption: input.caption ?? null,
          sortOrder: input.sortOrder,
          isActive: true,
        });
        return { url };
      }),

    // Admin: update caption or sortOrder
    update: adminProcedure
      .input(
        z.object({
          id: z.number(),
          caption: z.string().optional(),
          sortOrder: z.number().optional(),
          isActive: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateOccasionPhoto(id, data);
        return { success: true };
      }),

    // Admin: delete a photo
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteOccasionPhoto(input.id);
        return { success: true };
      }),
  }),
  // ─── Announcements ─────────────────────────────────────────────────────────
  announcements: router({
    // Public: fetch only active announcements for the banner
    listActive: publicProcedure.query(async () => {
      return getActiveAnnouncements();
    }),

    // Admin: fetch all (including inactive) for management
    listAll: adminProcedure.query(async () => {
      return getAllAnnouncements();
    }),

    create: adminProcedure
      .input(z.object({
        icon: z.string().default("✨"),
        text: z.string().min(1),
        cta: z.string().default(""),
        ctaLink: z.string().default("/request"),
        sortOrder: z.number().default(0),
        isActive: z.boolean().default(true),
      }))
      .mutation(async ({ input }) => {
        await createAnnouncement(input);
        return { success: true };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        icon: z.string().optional(),
        text: z.string().optional(),
        cta: z.string().optional(),
        ctaLink: z.string().optional(),
        sortOrder: z.number().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateAnnouncement(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  // ─── Testimonials (public read, admin write) ──────────────────────────────────────────────
  testimonials: router({
    list: publicProcedure.query(async () => {
      return getActiveTestimonials();
    }),
    listAll: adminProcedure.query(async () => {
      return getAllTestimonials();
    }),
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1),
        position: z.string().optional(),
        text: z.string().min(1),
        rating: z.number().min(1).max(5).default(5),
        avatarUrl: z.string().optional(),
        isActive: z.boolean().default(true),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        await createTestimonial(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        position: z.string().optional(),
        text: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
        avatarUrl: z.string().optional(),
        isActive: z.boolean().optional(),
        sortOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateTestimonial(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteTestimonial(input.id);
        return { success: true };
      }),
  }),

  // ─── AI Image Enhancer ────────────────────────────────────────────────────────
  imageAI: router({
    /**
     * Enhance an image using AI:
     * - Upscale / sharpen / improve quality
     * - Optionally provide a custom prompt to guide the enhancement
     */
    enhance: adminProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          mode: z.enum(["quality", "background_remove", "product"]).default("quality"),
          customPrompt: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { generateImage } = await import("./_core/imageGeneration");

        const prompts: Record<string, string> = {
          quality:
            "Enhance this image: improve sharpness, boost colors, increase clarity and detail. Make it look professional and high quality. Keep the same composition and content exactly.",
          background_remove:
            "Remove the background from this product image completely. Replace the background with a clean pure white (#FFFFFF) background. Keep the product perfectly intact with clean edges.",
          product:
            "Enhance this product photo for an e-commerce website: improve lighting, sharpen details, boost colors, remove any distracting background elements, and make it look professional and premium.",
        };

        const prompt = input.customPrompt || prompts[input.mode];

        const result = await generateImage({
          prompt,
          originalImages: [{ url: input.imageUrl, mimeType: "image/jpeg" }],
        });

        if (!result.url) {
          throw new Error("Image enhancement failed — no output returned");
        }

        return { enhancedUrl: result.url };
      }),

    /**
     * Analyse an image (original or enhanced) and generate a professional
     * Arabic marketing description for the product shown.
     */
    generateDescription: adminProcedure
      .input(
        z.object({
          imageUrl: z.string().url(),
          productType: z.string().optional(), // e.g. "بوكس هدايا", "درع تكريم"
          tone: z.enum(["luxury", "friendly", "formal"]).default("luxury"),
        })
      )
      .mutation(async ({ input }) => {
        const { invokeLLM } = await import("./_core/llm");

        const toneGuide: Record<string, string> = {
          luxury: "فاخرة وراقية، تستخدم مفردات الأناقة والتميّز والحصرية",
          friendly: "ودية وقريبة من القلب، تناسب الأفراد والعائلات",
          formal: "رسمية ومهنية، تناسب الشركات والمؤسسات",
        };

        const productHint = input.productType
          ? `المنتج في الصورة هو: ${input.productType}.`
          : "حدّد نوع المنتج من الصورة بنفسك.";

        const systemPrompt = `أنت خبير تسويق متخصص في كتابة أوصاف منتجات احترافية باللغة العربية لمركز بدر الكويتي، المتخصص في الهدايا الفاخرة والمناسبات والتكريمات.

أسلوب الكتابة: ${toneGuide[input.tone]}

قواعد الإخراج (JSON فقط):
- title: عنوان تسويقي جذاب (5-8 كلمات)
- description: وصف تسويقي كامل (40-60 كلمة) يبرز الجودة والفائدة
- features: مصفوفة من 3-4 مميزات قصيرة (كل ميزة 2-4 كلمات)
- cta: جملة دعوة للتصرف (call-to-action) قصيرة وجذابة
- hashtags: مصفوفة من 4-5 هاشتاقات عربية مناسبة للمنتج`;

        const result = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: input.imageUrl, detail: "high" },
                },
                {
                  type: "text",
                  text: `${productHint} اكتب وصفاً تسويقياً احترافياً لهذا المنتج بالعربية بصيغة JSON فقط.`,
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "product_description",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  features: { type: "array", items: { type: "string" } },
                  cta: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                },
                required: ["title", "description", "features", "cta", "hashtags"],
                additionalProperties: false,
              },
            },
          },
        });

        const raw = result.choices[0]?.message?.content;
        if (!raw || typeof raw !== "string") {
          throw new Error("لم يتمكن الذكاء الاصطناعي من توليد الوصف");
        }

        const parsed = JSON.parse(raw) as {
          title: string;
          description: string;
          features: string[];
          cta: string;
          hashtags: string[];
        };

        return parsed;
      }),

    /**
     * Upload a raw image to S3 so it can be passed to the enhance procedure
     */
    uploadOriginal: adminProcedure
      .input(
        z.object({
          base64: z.string().min(1),
          mimeType: z.string().default("image/jpeg"),
          filename: z.string().default("original.jpg"),
        })
      )
      .mutation(async ({ input }) => {
        const { storagePut } = await import("./storage");
        const buffer = Buffer.from(input.base64, "base64");
        const key = `ai-enhance/originals/${Date.now()}-${input.filename}`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        return { url };
      }),

    /**
     * Suggest a Kuwaiti Dinar price range for a product based on its name,
     * category, and description. Returns min, max, suggested, displayText,
     * and a short rationale in Arabic.
     */
    suggestPrice: adminProcedure
      .input(
        z.object({
          productName: z.string().min(1),
          category: z.string().min(1),
          description: z.string().optional(),
          competitorPrice: z.number().positive().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const hasCompetitor = input.competitorPrice !== undefined && input.competitorPrice > 0;

        const systemPrompt = hasCompetitor
          ? `أنت خبير تسعير تنافسي كويتي متخصص في سوق الهدايا والتكريم والمناسبات.
العملة: دينار كويتي (KWD).
مهمتك: تحليل سعر المنافس واقتراح سعر تنافسي ذكي يحقق التوازن بين الجاذبية والربحية.
استراتيجيات التسعير التنافسي:
- إذا كان المنتج متميزاً: يمكن تسعيره أعلى من المنافس بـ 10-20%
- إذا كان مشابهاً: سعّره أقل بـ 5-15% لجذب العملاء
- إذا كان أقل جودة: سعّره أقل بـ 20-30%
أعط تحليلاً تنافسياً واضحاً مع توصية سعرية محددة.`
          : `أنت خبير تسعير منتجات كويتي متخصص في سوق الهدايا والتكريم والمناسبات.
العملة: دينار كويتي (KWD).
فئات المنتجات المتاحة:
- gifts: الهدايا والدزات (نطاق شائع: 5–80 KWD)
- shields: الدروع والتكريم (نطاق شائع: 15–150 KWD)
- catering: الكيترنج والبوثات (نطاق شائع: 50–500 KWD)
- occasions: المناسبات الخاصة (نطاق شائع: 100–1000 KWD)
- calligraphy: الخط والنقش (نطاق شائع: 10–60 KWD)
أعط نطاقاً سعرياً واقعياً وتنافسياً للسوق الكويتي.`;

        const userMessage = [
          `اسم المنتج: ${input.productName}`,
          `الفئة: ${input.category}`,
          input.description ? `الوصف: ${input.description.slice(0, 300)}` : "",
          hasCompetitor ? `سعر المنافس: ${input.competitorPrice} د.ك` : "",
        ]
          .filter(Boolean)
          .join("\n");

        const schema = hasCompetitor
          ? {
              type: "object" as const,
              properties: {
                min: { type: "number", description: "الحد الأدنى للسعر المقترح بالدينار الكويتي" },
                max: { type: "number", description: "الحد الأعلى للسعر المقترح" },
                suggested: { type: "number", description: "السعر التنافسي المقترح الأمثل" },
                displayText: { type: "string", description: "نص السعر للعرض بالعربية مثل 'من 45 د.ك'" },
                rationale: { type: "string", description: "تبرير تنافسي قصير بالعربية (20-50 كلمة) يشرح العلاقة مع سعر المنافس" },
                competitivePosition: { type: "string", description: "موقعنا التنافسي: أعلى / مساوٍ / أقل من المنافس" },
                priceDiffPercent: { type: "number", description: "نسبة الفرق المئوية بين سعرنا المقترح وسعر المنافس (موجبة إذا أعلى، سالبة إذا أقل)" },
              },
              required: ["min", "max", "suggested", "displayText", "rationale", "competitivePosition", "priceDiffPercent"],
              additionalProperties: false,
            }
          : {
              type: "object" as const,
              properties: {
                min: { type: "number", description: "الحد الأدنى للسعر بالدينار الكويتي" },
                max: { type: "number", description: "الحد الأعلى للسعر" },
                suggested: { type: "number", description: "السعر المقترح الأمثل" },
                displayText: { type: "string", description: "نص السعر للعرض بالعربية مثل 'من 45 د.ك'" },
                rationale: { type: "string", description: "تبرير قصير بالعربية (20-40 كلمة)" },
              },
              required: ["min", "max", "suggested", "displayText", "rationale"],
              additionalProperties: false,
            };

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: hasCompetitor ? "competitive_price_suggestion" : "price_suggestion",
              strict: true,
              schema,
            },
          },
        });

        const content = response.choices?.[0]?.message?.content;
        if (!content) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "فشل توليد اقتراح السعر" });

        try {
          const parsed = typeof content === "string" ? JSON.parse(content) : content;
          return {
            min: Number(parsed.min),
            max: Number(parsed.max),
            suggested: Number(parsed.suggested),
            displayText: String(parsed.displayText),
            rationale: String(parsed.rationale),
            // Competitive fields (only present when competitorPrice was provided)
            competitorPrice: input.competitorPrice,
            competitivePosition: parsed.competitivePosition as string | undefined,
            priceDiffPercent: parsed.priceDiffPercent !== undefined ? Number(parsed.priceDiffPercent) : undefined,
          };
        } catch {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "خطأ في تحليل اقتراح السعر" });
        }
      }),
  }),
});
export type AppRouter = typeof appRouter;
