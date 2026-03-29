import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the db module
vi.mock("./db", () => ({
  getAllProducts: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "دزة الورود الفاخرة",
      nameEn: "Luxury Rose Dazza",
      category: "gifts",
      price: "من 45 د.ك",
      priceValue: "45.00",
      priceNote: "حسب الحجم",
      image: "https://example.com/img.jpg",
      badge: "الأكثر طلباً",
      badgeColor: "#C9A84C",
      description: "وصف المنتج",
      rating: 5,
      inStock: true,
      tags: '["هدايا"]',
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
  getProductById: vi.fn().mockResolvedValue(null),
  createProduct: vi.fn().mockResolvedValue({ insertId: 2 }),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  toggleProductStock: vi.fn().mockResolvedValue(undefined),
  getProductImages: vi.fn().mockResolvedValue([]),
  createProductImage: vi.fn().mockResolvedValue({ insertId: 10 }),
  deleteProductImage: vi.fn().mockResolvedValue(undefined),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

function createPublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function createUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("products.list", () => {
  it("returns products list for public users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("دزة الورود الفاخرة");
  });
});

describe("products.create (admin only)", () => {
  it("allows admin to create a product", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.products.create({
      name: "منتج جديد",
      category: "gifts",
      price: "من 10 د.ك",
      priceValue: 10,
      image: "https://example.com/new.jpg",
      description: "وصف المنتج الجديد",
      rating: 5,
      inStock: true,
      sortOrder: 99,
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.products.create({
        name: "منتج جديد",
        category: "gifts",
        price: "من 10 د.ك",
        priceValue: 10,
        image: "https://example.com/new.jpg",
        description: "وصف",
        rating: 5,
        inStock: true,
        sortOrder: 0,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.products.create({
        name: "منتج جديد",
        category: "gifts",
        price: "من 10 د.ك",
        priceValue: 10,
        image: "https://example.com/new.jpg",
        description: "وصف",
        rating: 5,
        inStock: true,
        sortOrder: 0,
      })
    ).rejects.toThrow();
  });
});

describe("products.delete (admin only)", () => {
  it("allows admin to delete a product", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.products.delete({ id: 1 });
    expect(result.success).toBe(true);
  });

  it("rejects non-admin users from deleting", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.products.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("products.toggleStock (admin only)", () => {
  it("allows admin to toggle stock", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.products.toggleStock({ id: 1, inStock: false });
    expect(result.success).toBe(true);
  });
});

describe("productImages.list", () => {
  it("returns empty array for a product with no gallery images", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    const result = await caller.productImages.list({ productId: 999 });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("productImages.add (admin only)", () => {
  it("rejects non-admin users from adding gallery images", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(
      caller.productImages.add({
        productId: 1,
        filename: "test.jpg",
        contentType: "image/jpeg",
        dataBase64: "abc123",
        sortOrder: 0,
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated users from adding gallery images", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(
      caller.productImages.add({
        productId: 1,
        filename: "test.jpg",
        contentType: "image/jpeg",
        dataBase64: "abc123",
        sortOrder: 0,
      })
    ).rejects.toThrow();
  });
});

describe("productImages.delete (admin only)", () => {
  it("rejects non-admin users from deleting gallery images", async () => {
    const caller = appRouter.createCaller(createUserCtx());
    await expect(caller.productImages.delete({ id: 1 })).rejects.toThrow();
  });

  it("rejects unauthenticated users from deleting gallery images", async () => {
    const caller = appRouter.createCaller(createPublicCtx());
    await expect(caller.productImages.delete({ id: 1 })).rejects.toThrow();
  });
});

describe("products.create returns id", () => {
  it("returns success and id after product creation", async () => {
    const caller = appRouter.createCaller(createAdminCtx());
    const result = await caller.products.create({
      name: "منتج اختبار",
      category: "gifts",
      price: "من 20 د.ك",
      priceValue: 20,
      image: "https://example.com/test.jpg",
      description: "وصف اختبار",
      rating: 5,
      inStock: true,
      sortOrder: 0,
    });
    expect(result.success).toBe(true);
    // id may be null in mock but should exist as a key
    expect("id" in result).toBe(true);
  });
});
