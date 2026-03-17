import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock DB helpers
vi.mock("./db", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./db")>();
  return {
    ...actual,
    createServiceRequest: vi.fn().mockResolvedValue(undefined),
    getAllServiceRequests: vi.fn().mockResolvedValue([
      {
        id: 1,
        name: "أحمد الكويتي",
        phone: "96512345678",
        occasion: "wedding",
        occasionLabel: "💒 فرح / زفاف",
        date: "2026-05-15",
        budget: "300_500",
        budgetLabel: "300 — 500 د.ك",
        notes: "نريد بوث كيترنج",
        status: "new",
        createdAt: new Date("2026-03-17T10:00:00Z"),
      },
    ]),
    updateServiceRequestStatus: vi.fn().mockResolvedValue(undefined),
    getAllProducts: vi.fn().mockResolvedValue([]),
    createProduct: vi.fn().mockResolvedValue(undefined),
    updateProduct: vi.fn().mockResolvedValue(undefined),
    deleteProduct: vi.fn().mockResolvedValue(undefined),
    toggleProductStock: vi.fn().mockResolvedValue(undefined),
    getProductById: vi.fn().mockResolvedValue(null),
  };
});

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock storage
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeAdminCtx(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@bader.kw",
      name: "مدير النظام",
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

function makeUserCtx(): TrpcContext {
  return {
    user: {
      id: 2,
      openId: "regular-user",
      email: "user@example.com",
      name: "مستخدم عادي",
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

describe("serviceRequests.submit", () => {
  it("saves a valid service request and returns success", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.serviceRequests.submit({
      name: "فاطمة العلي",
      phone: "96598765432",
      occasion: "graduation",
      occasionLabel: "🎓 حفل تخرج",
      date: "2026-06-20",
      budget: "150_300",
      budgetLabel: "150 — 300 د.ك",
      notes: "نريد دزة هدايا",
    });
    expect(result).toEqual({ success: true });
  });

  it("rejects request with missing required fields", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.serviceRequests.submit({
        name: "",
        phone: "96598765432",
        occasion: "graduation",
        occasionLabel: "🎓 حفل تخرج",
        date: "2026-06-20",
        budget: "150_300",
        budgetLabel: "150 — 300 د.ك",
      })
    ).rejects.toThrow();
  });
});

describe("serviceRequests.list", () => {
  it("returns all requests for admin", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.serviceRequests.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("أحمد الكويتي");
  });

  it("blocks non-admin users from listing requests", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(caller.serviceRequests.list()).rejects.toThrow("Admin access required");
  });

  it("blocks unauthenticated users from listing requests", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.serviceRequests.list()).rejects.toThrow();
  });
});

describe("serviceRequests.updateStatus", () => {
  it("allows admin to update request status", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.serviceRequests.updateStatus({ id: 1, status: "contacted" });
    expect(result).toEqual({ success: true });
  });

  it("blocks regular users from updating request status", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.serviceRequests.updateStatus({ id: 1, status: "contacted" })
    ).rejects.toThrow("Admin access required");
  });
});

describe("upload.productImage", () => {
  it("allows admin to upload a product image", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.upload.productImage({
      filename: "product.jpg",
      contentType: "image/jpeg",
      dataBase64: Buffer.from("fake-image-data").toString("base64"),
    });
    expect(result).toHaveProperty("url");
    expect(result.url).toContain("https://");
  });

  it("rejects unsupported file types", async () => {
    const caller = appRouter.createCaller(makeAdminCtx());
    await expect(
      caller.upload.productImage({
        filename: "doc.pdf",
        contentType: "application/pdf",
        dataBase64: Buffer.from("fake-pdf").toString("base64"),
      })
    ).rejects.toThrow();
  });

  it("blocks non-admin users from uploading images", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.upload.productImage({
        filename: "img.jpg",
        contentType: "image/jpeg",
        dataBase64: Buffer.from("fake").toString("base64"),
      })
    ).rejects.toThrow("Admin access required");
  });
});
