import z from "zod";
import { passwordValidation } from "@/lib/password-validation";

export const ChangePasswordFormSchema = z
	.object({
		current_password: z.string().min(1, {
			message: "Old password is required",
		}),
		new_password: z.string().min(6, {
			message: "Minimum 6 characters required",
		}),
		confirm_new_password: z.string(),
	})
	.refine((data) => data.new_password === data.confirm_new_password, {
		path: ["confirm_password"],
		message: "Passwords do not match",
	})
	.superRefine(({ new_password }, checkPassComplexity) => {
		passwordValidation(new_password, checkPassComplexity.addIssue);
	});

export type ChangePasswordForm = z.infer<typeof ChangePasswordFormSchema>;
