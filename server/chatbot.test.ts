import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the LLM helper
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: "أهلاً! يمكنني مساعدتك في الاستفسار عن خدمات مركز بدر.",
        },
      },
    ],
  }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("chatbot.chat", () => {
  it("returns a reply for a valid user message", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbot.chat({
      messages: [{ role: "user", content: "ما هي خدماتكم؟" }],
    });

    expect(result).toHaveProperty("reply");
    expect(typeof result.reply).toBe("string");
    expect(result.reply.length).toBeGreaterThan(0);
  });

  it("accepts multi-turn conversation history", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.chatbot.chat({
      messages: [
        { role: "user", content: "كم سعر الدزة؟" },
        { role: "assistant", content: "تبدأ الدزات من 45 د.ك" },
        { role: "user", content: "هل يوجد توصيل؟" },
      ],
    });

    expect(result.reply).toBeTruthy();
  });

  it("rejects empty message content", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.chatbot.chat({
        messages: [{ role: "user", content: "" }],
      })
    ).rejects.toThrow();
  });

  it("rejects messages array exceeding 20 items", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const tooManyMessages = Array.from({ length: 21 }, (_, i) => ({
      role: "user" as const,
      content: `Message ${i + 1}`,
    }));

    await expect(
      caller.chatbot.chat({ messages: tooManyMessages })
    ).rejects.toThrow();
  });

  it("rejects message content over 1000 characters", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.chatbot.chat({
        messages: [{ role: "user", content: "أ".repeat(1001) }],
      })
    ).rejects.toThrow();
  });

  it("handles LLM failure gracefully", async () => {
    const { invokeLLM } = await import("./_core/llm");
    vi.mocked(invokeLLM).mockRejectedValueOnce(new Error("LLM unavailable"));

    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.chatbot.chat({
        messages: [{ role: "user", content: "سؤال اختباري" }],
      })
    ).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
  });
});
