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
  createServiceRequest,
  getAllServiceRequests,
  updateServiceRequestStatus,
  createOrder,
  getOrderById,
  updateOrderStatus,
  updateOrderInvoice,
  getAllOrders,
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

// ─── MyFatoorah helpers ────────────────────────────────────────────────────────
const MF_BASE_URL = "https://api.myfatoorah.com";

async function myfatoorahRequest(path: string, body: unknown) {
  const apiKey = process.env.MYFATOORAH_API_KEY;
  if (!apiKey) throw new Error("MYFATOORAH_API_KEY not configured");

  const res = await fetch(`${MF_BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { IsSuccess: boolean; Message?: string; Data?: unknown };
  if (!json.IsSuccess) {
    throw new Error(json.Message ?? "MyFatoorah request failed");
  }
  return json.Data;
}

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
      await createProduct({
        ...input,
        priceValue: String(input.priceValue),
        nameEn: input.nameEn ?? "",
        tags: input.tags ?? null,
        badge: input.badge ?? null,
        badgeColor: input.badgeColor ?? null,
        priceNote: input.priceNote ?? null,
      });
      return { success: true };
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

  // ─── Orders & Payments (MyFatoorah) ───────────────────────────────────────
  orders: router({
    /**
     * Initiate a payment: create an order in DB, call MyFatoorah SendPayment,
     * return the payment URL to redirect the user.
     */
    initiatePayment: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email().optional(),
          customerPhone: z.string().min(7),
          cartItems: z.array(cartItemSchema).min(1),
          notes: z.string().optional(),
          origin: z.string().url(), // frontend origin for callback URLs
        })
      )
      .mutation(async ({ input }) => {
        const totalAmount = input.cartItems.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        );

        if (totalAmount <= 0) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "المبلغ الإجمالي يجب أن يكون أكبر من صفر",
          });
        }

        // Create order in DB first
        const result = await createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail ?? null,
          customerPhone: input.customerPhone,
          totalAmount: String(totalAmount.toFixed(3)),
          currency: "KWD",
          status: "pending",
          cartItems: JSON.stringify(input.cartItems),
          notes: input.notes ?? null,
        });

        const orderId = (result as { insertId: number }).insertId;

        // Call MyFatoorah SendPayment API
        try {
          const callbackUrl = `${input.origin}/payment/callback?orderId=${orderId}`;
          const errorUrl = `${input.origin}/payment/error?orderId=${orderId}`;

          const mfData = (await myfatoorahRequest("/v2/SendPayment", {
            NotificationOption: "LNK",
            InvoiceValue: Number(totalAmount.toFixed(3)),
            CustomerName: input.customerName,
            CustomerEmail: input.customerEmail ?? "",
            CustomerMobile: input.customerPhone,
            Language: "AR",
            CallBackUrl: callbackUrl,
            ErrorUrl: errorUrl,
            UserDefinedField: String(orderId),
            DisplayCurrencyIso: "KWD",
            InvoiceItems: input.cartItems.map((item) => ({
              ItemName: item.name,
              Quantity: item.qty,
              UnitPrice: Number(item.price.toFixed(3)),
            })),
          })) as { InvoiceId: number; InvoiceURL: string };

          // Save invoice info
          await updateOrderInvoice(
            orderId,
            String(mfData.InvoiceId),
            mfData.InvoiceURL
          );

          return {
            orderId,
            invoiceUrl: mfData.InvoiceURL,
            invoiceId: mfData.InvoiceId,
          };
        } catch (err) {
          console.error("[MyFatoorah] Payment initiation failed:", err);
          await updateOrderStatus(orderId, "failed");
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: err instanceof Error ? err.message : "فشل في إنشاء الفاتورة. يرجى المحاولة مجدداً.",
          });
        }
      }),

    /**
     * Verify payment after user returns from MyFatoorah gateway.
     * Called by the frontend on the callback page.
     */
    verifyPayment: publicProcedure
      .input(
        z.object({
          paymentId: z.string().min(1), // PaymentId from MyFatoorah callback query param
          orderId: z.number(),
        })
      )
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({ code: "NOT_FOUND", message: "الطلب غير موجود" });
        }

        // Already confirmed
        if (order.status === "paid") {
          return { success: true, status: "paid" as const };
        }

        try {
          const mfData = (await myfatoorahRequest("/v2/GetPaymentStatus", {
            Key: input.paymentId,
            KeyType: "PaymentId",
          })) as {
            InvoiceStatus: string;
            InvoiceTransactions?: Array<{ TransactionId: string; PaymentGateway: string }>;
          };

          const isPaid = mfData.InvoiceStatus === "Paid";
          const status = isPaid ? "paid" : "failed";
          const txId = mfData.InvoiceTransactions?.[0]?.TransactionId;

          await updateOrderStatus(input.orderId, status, {
            myfatoorahPaymentId: txId ?? input.paymentId,
          });

          if (isPaid) {
            notifyOwner({
              title: `💳 دفعة جديدة — طلب #${input.orderId}`,
              content: [
                `👤 العميل: ${order.customerName}`,
                `📞 الهاتف: ${order.customerPhone ?? "—"}`,
                `💰 المبلغ: ${order.totalAmount} ${order.currency}`,
                `🧾 رقم الطلب: ${input.orderId}`,
              ].join("\n"),
            }).catch((err) => console.warn("[Notification] Failed:", err));
          }

          return { success: true, status };
        } catch (err) {
          console.error("[MyFatoorah] Verify payment failed:", err);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "فشل في التحقق من الدفع. يرجى التواصل معنا.",
          });
        }
      }),

    /**
     * Get order details (public, by ID — for confirmation page).
     */
    getOrder: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.id);
        if (!order) throw new TRPCError({ code: "NOT_FOUND" });
        return order;
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
          status: z.enum(["pending", "paid", "failed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        await updateOrderStatus(input.id, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
