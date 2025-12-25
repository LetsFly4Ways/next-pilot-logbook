import z from "zod";
import { passwordValidation } from "@/lib/password-validation";

export const RegisterFormSchema = z
  .object({
    email: z.email({
      message: "Email is required",
    }),
    password: z.string().min(6, {
      message: "Least 6 characters required",
    }),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  })
  .superRefine(({ password }, checkPassComplexity) => {
    passwordValidation(password, checkPassComplexity.addIssue);
  });
