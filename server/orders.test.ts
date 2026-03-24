/**
 * Tests for the orders router (WhatsApp-based order flow).
 * Orders are saved to DB for admin tracking; the actual order message
 * is sent to WhatsApp by the frontend.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "./_core/context";

// ── Mock DB helpers so tests don't need a real database ──────────────────────
vi.mock("./db", () => ({
  createOrder: vi.fn().mockResolvedValue({ insertId: 42 }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  getAllOrders: vi.fn().mockResolvedValue([]),
  // other db helpers used by the router
  getAllProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(null),
  createProduct: vi.fn().mockResolvedValue({ insertId: 1 }),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  toggleProductStock: vi.fn().mockResolvedValue(undefined),
  createServiceRequest: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllServiceRequests: vi.fn().mockResolvedValue([]),
  updateServiceRequestStatus: vi.fn().mockResolvedValue(undefined),
}));

// ── Mock notification helper ──────────────────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// ── Mock LLM helper ───────────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: "مرحباً" } }],
  }),
}));

// ── Mock S3 storage helper ────────────────────────────────────────────────────
vi.mock("./storage", () => ({
  storagePut: vi.fn().mockResolvedValue({ url: "https://cdn.example.com/test.jpg", key: "test.jpg" }),
}));

import { appRouter } from "./routers";

// ── Helper to build a minimal TrpcContext ────────────────────────────────────
function makeCtx(overrides?: Partial<TrpcContext>): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
      cookie: vi.fn(),
    } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

function makeAdminCtx(): TrpcContext {
  return makeCtx({
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@bader.com",
      name: "Admin",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

describe("orders.saveOrder", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws when cart is empty (zod min(1))", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.saveOrder({
        customerName: "Test",
        customerPhone: "96512345678",
        totalAmount: 0,
        cartItems: [], // empty — zod min(1) should reject
      })
    ).rejects.toThrow();
  });

  it("throws when customerName is empty", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.saveOrder({
        customerName: "",
        customerPhone: "96512345678",
        totalAmount: 10,
        cartItems: [{ productId: 1, name: "Product", qty: 1, price: 10 }],
      })
    ).rejects.toThrow();
  });

  it("throws when customerPhone is too short", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.saveOrder({
        customerName: "Test",
        customerPhone: "123", // too short (min 7)
        totalAmount: 10,
        cartItems: [{ productId: 1, name: "Product", qty: 1, price: 10 }],
      })
    ).rejects.toThrow();
  });

  it("saves order and returns orderId on valid input", async () => {
    const { createOrder } = await import("./db");
    vi.mocked(createOrder).mockResolvedValueOnce({ insertId: 99 });

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.orders.saveOrder({
      customerName: "أحمد الكويتي",
      customerPhone: "96512345678",
      totalAmount: 25.5,
      cartItems: [{ productId: 1, name: "درع فاخر", qty: 2, price: 12.75 }],
      notes: "يرجى التغليف الفاخر",
    });

    expect(result).toEqual({ success: true, orderId: 99 });
    expect(createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        customerName: "أحمد الكويتي",
        customerPhone: "96512345678",
        status: "pending",
        currency: "KWD",
      })
    );
  });

  it("notifies owner after saving order", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const caller = appRouter.createCaller(makeCtx());

    await caller.orders.saveOrder({
      customerName: "فاطمة",
      customerPhone: "96598765432",
      totalAmount: 15,
      cartItems: [{ productId: 2, name: "صندوق هدايا", qty: 1, price: 15 }],
    });

    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("فاطمة"),
      })
    );
  });
});

describe("orders.list (admin only)", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const userCtx = makeCtx({
      user: {
        id: 2,
        openId: "regular-user",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
    const caller = appRouter.createCaller(userCtx);
    await expect(caller.orders.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(caller.orders.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("returns empty array for admin when no orders exist", async () => {
    const { getAllOrders } = await import("./db");
    vi.mocked(getAllOrders).mockResolvedValueOnce([]);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.list();
    expect(result).toEqual([]);
  });
});

describe("orders.updateStatus (admin only)", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const userCtx = makeCtx({
      user: {
        id: 2,
        openId: "regular-user",
        email: "user@example.com",
        name: "Regular User",
        loginMethod: "manus",
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      },
    });
    const caller = appRouter.createCaller(userCtx);
    await expect(
      caller.orders.updateStatus({ id: 1, status: "paid" })
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("allows admin to mark order as confirmed", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.updateStatus({ id: 1, status: "confirmed" });
    expect(result).toEqual({ success: true });
    expect(updateOrderStatus).toHaveBeenCalledWith(1, "confirmed");
  });

  it("allows admin to mark order as paid", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.updateStatus({ id: 5, status: "paid" });
    expect(result).toEqual({ success: true });
    expect(updateOrderStatus).toHaveBeenCalledWith(5, "paid");
  });

  it("allows admin to cancel an order", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.updateStatus({ id: 3, status: "cancelled" });
    expect(result).toEqual({ success: true });
    expect(updateOrderStatus).toHaveBeenCalledWith(3, "cancelled");
  });
});
