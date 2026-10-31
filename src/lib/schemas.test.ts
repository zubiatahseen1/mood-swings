import { describe, expect, it } from "vitest";
import { discoverQuerySchema, loginSchema, moodSearchSchema, signupSchema } from "./schemas";

describe("moodSearchSchema", () => {
  it("reads valid URL params", () => {
    expect(moodSearchSchema.parse({ runtime: "short", round: "2" })).toEqual({ runtime: "short", round: 2 });
  });

  it("falls back to defaults for hand-edited nonsense", () => {
    expect(moodSearchSchema.parse({ runtime: "forever", round: "-3" })).toEqual({ runtime: "any", round: 0 });
    expect(moodSearchSchema.parse({})).toEqual({ runtime: "any", round: 0 });
  });
});

describe("discoverQuerySchema", () => {
  it("rejects an unknown mood", () => {
    expect(discoverQuerySchema.safeParse({ mood: "grumpy" }).success).toBe(false);
  });

  it("caps the batch number", () => {
    expect(discoverQuerySchema.safeParse({ mood: "happy", batch: "50" }).success).toBe(false);
  });
});

describe("auth schemas", () => {
  it("requires a real email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("requires sign-up passwords of at least 8 characters", () => {
    const result = signupSchema.safeParse({ email: "a@b.com", password: "short" });
    expect(result.error?.issues[0].message).toBe("Use at least 8 characters.");
  });
});
