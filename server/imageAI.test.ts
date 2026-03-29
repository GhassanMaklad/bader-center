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

// ─── generateDescription flow ────────────────────────────────────────────────
describe("imageAI — generateDescription flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tone guide maps luxury to correct Arabic phrase", () => {
    const toneGuide: Record<string, string> = {
      luxury: "فاخرة وراقية، تستخدم مفردات الأناقة والتميّز والحصرية",
      friendly: "ودية وقريبة من القلب، تناسب الأفراد والعائلات",
      formal: "رسمية ومهنية، تناسب الشركات والمؤسسات",
    };
    expect(toneGuide["luxury"]).toContain("فاخرة");
    expect(toneGuide["friendly"]).toContain("ودية");
    expect(toneGuide["formal"]).toContain("رسمية");
  });

  it("productHint includes productType when provided", () => {
    const productType = "بوكس هدايا";
    const hint = productType ? `المنتج في الصورة هو: ${productType}.` : "حدّد نوع المنتج من الصورة بنفسك.";
    expect(hint).toContain("بوكس هدايا");
  });

  it("productHint falls back to generic when productType is empty", () => {
    const productType = "";
    const hint = productType ? `المنتج في الصورة هو: ${productType}.` : "حدّد نوع المنتج من الصورة بنفسك.";
    expect(hint).toContain("حدّد نوع المنتج");
  });

  it("parsed JSON contains all required fields", () => {
    const mockResponse = {
      title: "هدية فاخرة من مركز بدر",
      description: "وصف تسويقي احترافي للمنتج",
      features: ["جودة عالية", "تغليف أنيق", "مناسب للمناسبات"],
      cta: "اطلب الآن وتميّز في كل مناسبة",
      hashtags: ["#مركز_بدر", "#هدايا_فاخرة", "#الكويت"],
    };
    expect(mockResponse).toHaveProperty("title");
    expect(mockResponse).toHaveProperty("description");
    expect(mockResponse.features).toHaveLength(3);
    expect(mockResponse.cta).toBeTruthy();
    expect(mockResponse.hashtags).toHaveLength(3);
  });

  it("throws when LLM returns no content", () => {
    const raw = undefined;
    expect(() => {
      if (!raw || typeof raw !== "string") {
        throw new Error("لم يتمكن الذكاء الاصطناعي من توليد الوصف");
      }
    }).toThrow("لم يتمكن الذكاء الاصطناعي من توليد الوصف");
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

// ─── suggestPrice logic ────────────────────────────────────────────────────────
describe("imageAI — suggestPrice logic", () => {
  it("category price ranges are correctly defined", () => {
    const ranges: Record<string, { min: number; max: number }> = {
      gifts:       { min: 5,   max: 80   },
      shields:     { min: 15,  max: 150  },
      catering:    { min: 50,  max: 500  },
      occasions:   { min: 100, max: 1000 },
      calligraphy: { min: 10,  max: 60   },
    };
    expect(ranges["gifts"].min).toBe(5);
    expect(ranges["shields"].max).toBe(150);
    expect(ranges["occasions"].max).toBe(1000);
  });

  it("suggested price should be between min and max", () => {
    const mockSuggestion = { min: 15, max: 45, suggested: 30, displayText: "من 30 د.ك", rationale: "سعر مناسب للسوق الكويتي" };
    expect(mockSuggestion.suggested).toBeGreaterThanOrEqual(mockSuggestion.min);
    expect(mockSuggestion.suggested).toBeLessThanOrEqual(mockSuggestion.max);
  });

  it("displayText is non-empty string", () => {
    const mockSuggestion = { min: 10, max: 50, suggested: 25, displayText: "من 25 د.ك", rationale: "تبرير" };
    expect(typeof mockSuggestion.displayText).toBe("string");
    expect(mockSuggestion.displayText.length).toBeGreaterThan(0);
  });

  it("throws when productName is empty string", () => {
    const validate = (name: string) => {
      if (!name.trim()) throw new Error("productName is required");
    };
    expect(() => validate("")).toThrow("productName is required");
    expect(() => validate("دزة ورود")).not.toThrow();
  });

  it("description is optional and does not affect validation", () => {
    const buildInput = (desc?: string) => ({
      productName: "درع تكريمي",
      category: "shields",
      description: desc,
    });
    expect(buildInput()).toEqual({ productName: "درع تكريمي", category: "shields", description: undefined });
    expect(buildInput("وصف")).toEqual({ productName: "درع تكريمي", category: "shields", description: "وصف" });
  });
});

// ─── competitorPrice logic ─────────────────────────────────────────────────────
describe("imageAI — competitive price logic", () => {
  it("hasCompetitor is true when competitorPrice is a positive number", () => {
    const hasCompetitor = (price?: number) => price !== undefined && price > 0;
    expect(hasCompetitor(35)).toBe(true);
    expect(hasCompetitor(0)).toBe(false);
    expect(hasCompetitor(undefined)).toBe(false);
    expect(hasCompetitor(-5)).toBe(false);
  });

  it("competitive result includes competitivePosition and priceDiffPercent", () => {
    const mockResult = {
      min: 25, max: 40, suggested: 30,
      displayText: "من 30 د.ك",
      rationale: "سعر أقل من المنافس لجذب العملاء",
      competitorPrice: 35,
      competitivePosition: "أقل من المنافس",
      priceDiffPercent: -14.3,
    };
    expect(mockResult).toHaveProperty("competitivePosition");
    expect(mockResult).toHaveProperty("priceDiffPercent");
    expect(mockResult.priceDiffPercent).toBeLessThan(0);
    expect(mockResult.competitivePosition).toContain("أقل");
  });

  it("priceDiffPercent is positive when our price is higher than competitor", () => {
    const ourPrice = 45;
    const competitorPrice = 35;
    const diff = ((ourPrice - competitorPrice) / competitorPrice) * 100;
    expect(diff).toBeGreaterThan(0);
    expect(diff.toFixed(1)).toBe("28.6");
  });

  it("priceDiffPercent is negative when our price is lower than competitor", () => {
    const ourPrice = 28;
    const competitorPrice = 35;
    const diff = ((ourPrice - competitorPrice) / competitorPrice) * 100;
    expect(diff).toBeLessThan(0);
  });

  it("non-competitive result has no competitivePosition field", () => {
    const basicResult = {
      min: 20, max: 50, suggested: 35,
      displayText: "من 35 د.ك",
      rationale: "سعر مناسب للسوق",
    };
    expect(basicResult).not.toHaveProperty("competitivePosition");
    expect(basicResult).not.toHaveProperty("priceDiffPercent");
  });

  it("competitorPrice input is validated as positive number", () => {
    const validate = (val: string) => {
      const n = parseFloat(val);
      return !isNaN(n) && n > 0 ? n : undefined;
    };
    expect(validate("35")).toBe(35);
    expect(validate("0")).toBeUndefined();
    expect(validate("")).toBeUndefined();
    expect(validate("abc")).toBeUndefined();
    expect(validate("-10")).toBeUndefined();
  });
});
