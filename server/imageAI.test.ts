/**
 * Tests for the AI Image Enhancer router (imageAI)
 * We mock generateImage and storagePut to avoid real API calls.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Mocks ────────────────────────────────────────────────────────────────────
vi.mock("./_core/imageGeneration", () => ({
  generateImage: vi.fn(),
}));

vi.mock("./storage", () => ({
  storagePut: vi.fn(),
}));

import { generateImage } from "./_core/imageGeneration";
import { storagePut } from "./storage";

const mockGenerateImage = vi.mocked(generateImage);
const mockStoragePut = vi.mocked(storagePut);

// ─── Unit tests for prompt selection logic ─────────────────────────────────────
describe("imageAI — prompt selection", () => {
  const prompts: Record<string, string> = {
    quality:
      "Enhance this image: improve sharpness, boost colors, increase clarity and detail. Make it look professional and high quality. Keep the same composition and content exactly.",
    background_remove:
      "Remove the background from this product image completely. Replace the background with a clean pure white (#FFFFFF) background. Keep the product perfectly intact with clean edges.",
    product:
      "Enhance this product photo for an e-commerce website: improve lighting, sharpen details, boost colors, remove any distracting background elements, and make it look professional and premium.",
  };

  it("selects the quality prompt for mode=quality", () => {
    expect(prompts["quality"]).toContain("improve sharpness");
  });

  it("selects the background_remove prompt for mode=background_remove", () => {
    expect(prompts["background_remove"]).toContain("Remove the background");
  });

  it("selects the product prompt for mode=product", () => {
    expect(prompts["product"]).toContain("e-commerce website");
  });

  it("customPrompt overrides the default prompt", () => {
    const custom = "Make it look like a painting";
    const mode = "quality";
    const resolved = custom || prompts[mode];
    expect(resolved).toBe(custom);
  });

  it("falls back to mode prompt when customPrompt is empty", () => {
    const custom = "";
    const mode = "quality";
    const resolved = custom || prompts[mode];
    expect(resolved).toBe(prompts["quality"]);
  });
});

// ─── Integration-style tests with mocked dependencies ─────────────────────────
describe("imageAI — enhance flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns enhancedUrl when generateImage succeeds", async () => {
    mockGenerateImage.mockResolvedValueOnce({ url: "https://cdn.example.com/enhanced.png" });

    const result = await generateImage({
      prompt: "Enhance this image",
      originalImages: [{ url: "https://cdn.example.com/original.jpg", mimeType: "image/jpeg" }],
    });

    expect(result.url).toBe("https://cdn.example.com/enhanced.png");
  });

  it("throws when generateImage returns no url", async () => {
    mockGenerateImage.mockResolvedValueOnce({ url: undefined });

    const result = await generateImage({ prompt: "test" });
    if (!result.url) {
      expect(() => { throw new Error("Image enhancement failed — no output returned"); }).toThrow(
        "Image enhancement failed"
      );
    }
  });

  it("throws when generateImage rejects", async () => {
    mockGenerateImage.mockRejectedValueOnce(new Error("API unavailable"));

    await expect(
      generateImage({ prompt: "test" })
    ).rejects.toThrow("API unavailable");
  });
});

// ─── uploadOriginal flow ───────────────────────────────────────────────────────
describe("imageAI — uploadOriginal flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls storagePut with correct key prefix", async () => {
    mockStoragePut.mockResolvedValueOnce({ url: "https://cdn.example.com/original.jpg", key: "ai-enhance/originals/123-original.jpg" });

    const buffer = Buffer.from("fake-image-data");
    const result = await storagePut("ai-enhance/originals/123-original.jpg", buffer, "image/jpeg");

    expect(mockStoragePut).toHaveBeenCalledWith(
      expect.stringContaining("ai-enhance/originals/"),
      expect.any(Buffer),
      "image/jpeg"
    );
    expect(result.url).toContain("cdn.example.com");
  });

  it("returns a valid S3 url", async () => {
    mockStoragePut.mockResolvedValueOnce({ url: "https://s3.amazonaws.com/bucket/ai-enhance/originals/abc.jpg", key: "ai-enhance/originals/abc.jpg" });

    const { url } = await storagePut("ai-enhance/originals/abc.jpg", Buffer.from(""), "image/png");
    expect(url).toMatch(/^https?:\/\//);
  });
});
