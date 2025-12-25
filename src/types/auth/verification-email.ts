import z from "zod";

export const VerificationEmailSchema = z.object({
  email: z.email({ message: "Email is required" }),
});
