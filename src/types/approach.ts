import z from "zod";

export const ApproachSchema = z.object({
  title: z.string(),
  type: z.enum(["precision", "non-precision", "visual", "other"]).optional(),
});

export type Approach = z.infer<typeof ApproachSchema>;
