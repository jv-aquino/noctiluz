import { z } from "zod";

export const uploadSchema = z.object({
  fileName: z.string().min(3).max(100),
  fileType: z.string().min(3).max(100),
  folder: z.string().min(2).max(100),
});
