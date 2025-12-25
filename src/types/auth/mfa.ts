import z from "zod";

export const MFAVerifySchema = z.object({
  factorId: z.string().min(1, "Factor ID is required"),
  code: z.string().length(6, "Code must be 6 digits"),
});
