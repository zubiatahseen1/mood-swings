import { z } from "zod";
import { MOOD_KEYS, RUNTIME_KEYS } from "./moods";

/**
 * Every value that arrives from outside (URLs, API queries, forms) is
 * checked here. A hand-edited URL can never put a page in an impossible state.
 */

export const moodSchema = z.enum(MOOD_KEYS as [string, ...string[]]);
export const runtimeSchema = z.enum(RUNTIME_KEYS as [string, ...string[]]);

/** ?runtime=short&round=2 on a mood page. Bad values fall back to defaults. */
export const moodSearchSchema = z.object({
  runtime: runtimeSchema.catch("any"),
  round: z.coerce.number().int().min(0).max(100).catch(0),
});

/** Query for GET /api/discover. Bad values are rejected with a 400. */
export const discoverQuerySchema = z.object({
  mood: moodSchema,
  runtime: runtimeSchema.default("any"),
  batch: z.coerce.number().int().min(0).max(6).default(0),
});

export const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100),
  page: z.coerce.number().int().min(1).max(500).default(1),
});

export const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signupSchema = z.object({
  name: z.string().trim().max(60, "Keep your name under 60 characters.").optional(),
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Use at least 8 characters."),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type SignupValues = z.infer<typeof signupSchema>;
