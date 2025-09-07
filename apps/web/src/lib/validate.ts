import { z } from "zod";

export const OfferCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name too long"),
  price_usd: z.number().nonnegative("Price must be >= 0").optional(),
  summary: z.string().max(2_000, "Summary too long").optional().default(""),
  features: z.array(z.string().min(1)).max(50, "Too many features").optional().default([]),
});

export const OfferUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120, "Name too long").optional(),
  price_usd: z.number().nonnegative("Price must be >= 0").optional(),
  summary: z.string().max(2_000, "Summary too long").optional(),
  features: z.array(z.string().min(1)).max(50, "Too many features").optional(),
});

export type OfferCreateInput = z.infer<typeof OfferCreateSchema>;
export type OfferUpdateInput = z.infer<typeof OfferUpdateSchema>;

export function toErrorResponse(err: unknown) {
  if (err && typeof err === "object" && "issues" in (err as any)) {
    const zerr = err as any;
    return {
      error: "validation_failed",
      issues: zerr.issues.map((i: any) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    };
  }
  return { error: "invalid_request" };
}