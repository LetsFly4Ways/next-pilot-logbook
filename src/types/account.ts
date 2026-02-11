import { z } from "zod";

/**
 * User form schema - used for creating/editing user information
 */
export const UserInfoFormSchema = z.object({
	first_name: z.string().min(1, "First Name is required."),
	last_name: z.string().min(1, "Last Name is required."),
	email: z.email("Invalid email address.").min(1, "Last Name is required."),

	phone: z.string().nullable().optional(),

	license_number: z.string().nullable().optional(),
	company: z.string().nullable().optional(),
	company_id: z.string().nullable().optional(),
});

/**
 * Complete user schema with database fields
 */
export const UserInfoSchema = UserInfoFormSchema.extend({
	id: z.uuid(),
	user_id: z.uuid(),
	created_at: z.iso.datetime(),
	updated_at: z.iso.datetime(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type UserInfo = z.infer<typeof UserInfoSchema>;
export type UserInfoForm = z.infer<typeof UserInfoFormSchema>;
