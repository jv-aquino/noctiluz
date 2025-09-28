import { z } from "zod";

const AlternativeSchema = z.object({
  markdown: z.string(),
  explanation: z.string(),
  isCorrect: z.boolean(),
  order: z.number().int().nonnegative(),
});

export const AlternativesSchema = z.array(AlternativeSchema);