import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStock,
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
});

export type AppRouter = typeof appRouter;
