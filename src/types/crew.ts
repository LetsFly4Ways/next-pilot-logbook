import { z } from "zod";

// ============================================================================
// Form Schemas
// ============================================================================

/**
 * Crew form schema - used for creating/editing crew members
 */

export const CrewFormSchema = z.object({
  first_name: z.string().min(1, "First Name is required."),
  last_name: z.string().min(1, "Last Name is required."),
  email: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  license_number: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  company_id: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
});

/**
 * Complete crew schema with database fields
 */
export const CrewSchema = CrewFormSchema.extend({
  id: z.uuid(),
  user_id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});

// ============================================================================
// Type Exports
// ============================================================================

export type Crew = z.infer<typeof CrewSchema>;
export type CrewForm = z.infer<typeof CrewFormSchema>;
