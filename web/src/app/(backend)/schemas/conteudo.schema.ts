import z from "zod";
import { idArraySchema, idSchema } from "./base.schema";

export const reorderConteudoPagesSchema = z.object({
  lessonId: idSchema,
  pageIds: idArraySchema,
});

export const reorderContentBlocksSchema = z.object({
  blockIds: idArraySchema,
});