import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { notifyOwner } from "./_core/notification";
import { storagePut } from "./storage";
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
} from "./db";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

// Product input schema
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

  // ─── Image Upload (admin only) ─────────────────────────────────────────────
  upload: router({
    productImage: adminProcedure
      .input(
        z.object({
          filename: z.string().min(1),
          contentType: z.string().min(1),
          dataBase64: z.string().min(1), // base64-encoded file bytes
        })
      )
      .mutation(async ({ input }) => {
        // Validate content type
        const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
        if (!allowed.includes(input.contentType)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "نوع الملف غير مدعوم. يُسمح فقط بـ JPEG, PNG, WebP, GIF",
          });
        }

        // Validate size (max 5MB base64 ≈ 3.75MB actual)
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

    create: adminProcedure
      .input(productInput)
      .mutation(async ({ input }) => {
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
    // Public: submit a new service request and notify the owner
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
        // Save to database
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

        // Send notification to owner (non-blocking)
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

    // Admin: list all service requests
    list: adminProcedure.query(async () => {
      return getAllServiceRequests();
    }),

    // Admin: update request status
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
});

export type AppRouter = typeof appRouter;
