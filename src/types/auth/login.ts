import z from "zod";

export const LoginFormSchema = z.object({
  email: z.email({
    message: "Email is required",
  }),
  password: z.string().min(1, {
    message: "Password is required",
  }),
});
