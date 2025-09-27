import z from "zod";
import { idArraySchema, idSchema } from "./base.schema";

export const reorderContentPagesSchema = z.object({
  lessonId: idSchema,
  pageIds: idArraySchema,
  variantId: idSchema.optional()
});

export const reorderContentBlocksSchema = z.object({
  blockIds: idArraySchema,
});