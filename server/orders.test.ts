/**
 * Tests for the orders router (MyFatoorah payment integration).
 * These tests focus on input validation and business logic that does NOT
 * require a live database or MyFatoorah API call.
 */
import { describe, expect, it, vi, beforeEach } from "vitest";
import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";

// ── Mock DB helpers so tests don't need a real database ──────────────────────
vi.mock("./db", () => ({
  createOrder: vi.fn().mockResolvedValue({ insertId: 42 }),
  getOrderById: vi.fn().mockResolvedValue({
    id: 42,
    customerName: "Test Customer",
    customerPhone: "96512345678",
    totalAmount: "10.000",
    currency: "KWD",
    status: "pending",
    cartItems: JSON.stringify([{ productId: 1, name: "Test Product", qty: 1, price: 10 }]),
    notes: null,
    myfatoorahInvoiceId: null,
    myfatoorahPaymentId: null,
    invoiceUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  updateOrderStatus: vi.fn().mockResolvedValue(undefined),
  updateOrderInvoice: vi.fn().mockResolvedValue(undefined),
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

describe("orders.initiatePayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws BAD_REQUEST when cart is empty", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.initiatePayment({
        customerName: "Test",
        customerPhone: "96512345678",
        cartItems: [], // empty cart — zod min(1) should reject
        origin: "https://example.com",
      })
    ).rejects.toThrow();
  });

  it("throws BAD_REQUEST when totalAmount is zero", async () => {
    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.initiatePayment({
        customerName: "Test",
        customerPhone: "96512345678",
        cartItems: [{ productId: 1, name: "Free Item", qty: 1, price: 0 }],
        origin: "https://example.com",
      })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("throws when MyFatoorah API key is missing", async () => {
    const originalKey = process.env.MYFATOORAH_API_KEY;
    delete process.env.MYFATOORAH_API_KEY;

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.initiatePayment({
        customerName: "Test Customer",
        customerPhone: "96512345678",
        cartItems: [{ productId: 1, name: "Product", qty: 1, price: 10 }],
        origin: "https://example.com",
      })
    ).rejects.toThrow();

    process.env.MYFATOORAH_API_KEY = originalKey;
  });
});

describe("orders.verifyPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws NOT_FOUND when order does not exist", async () => {
    const { getOrderById } = await import("./db");
    vi.mocked(getOrderById).mockResolvedValueOnce(null);

    const caller = appRouter.createCaller(makeCtx());
    await expect(
      caller.orders.verifyPayment({ paymentId: "pay_123", orderId: 9999 })
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("returns paid immediately if order is already paid", async () => {
    const { getOrderById } = await import("./db");
    vi.mocked(getOrderById).mockResolvedValueOnce({
      id: 42,
      customerName: "Test",
      customerPhone: "96512345678",
      totalAmount: "10.000",
      currency: "KWD",
      status: "paid",
      cartItems: "[]",
      notes: null,
      myfatoorahInvoiceId: "INV123",
      myfatoorahPaymentId: "PAY123",
      invoiceUrl: "https://myfatoorah.com/invoice/123",
      userId: null,
      customerEmail: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.orders.verifyPayment({ paymentId: "pay_123", orderId: 42 });
    expect(result).toEqual({ success: true, status: "paid" });
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

  it("allows admin to update order status", async () => {
    const { updateOrderStatus } = await import("./db");
    vi.mocked(updateOrderStatus).mockResolvedValueOnce(undefined);

    const caller = appRouter.createCaller(makeAdminCtx());
    const result = await caller.orders.updateStatus({ id: 1, status: "cancelled" });
    expect(result).toEqual({ success: true });
    expect(updateOrderStatus).toHaveBeenCalledWith(1, "cancelled");
  });
});
