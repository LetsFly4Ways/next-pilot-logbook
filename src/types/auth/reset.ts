import z from "zod";

export const ResetFormSchema = z.object({
  email: z.email({ message: "Email is required" }),
});
