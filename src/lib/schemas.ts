import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signUpSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// ============================================================================
// MEMORY SCHEMAS
// ============================================================================

export const memoryVisibilityEnum = z.enum([
  'PUBLIC',
  'PROGRAM_ONLY',
  'BATCH_ONLY',
  'PRIVATE',
]);

/** Schema for creating a memory — used by the form (client-side). */
export const createMemorySchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title must be 255 characters or less'),
  description: z
    .string()
    .trim()
    .max(5000, 'Description is too long')
    .optional(),
  visibility: memoryVisibilityEnum.default('PUBLIC'),
  locationId: z.string().uuid('Invalid location'),
  tags: z
    .array(z.string().trim().min(1).max(50))
    .max(10, 'Maximum 10 tags')
    .optional(),
});

/** Server-side schema — same fields sent over the wire (no File objects). */
export const createMemoryServerSchema = createMemorySchema.extend({
  programBatchId: z.string().uuid('Invalid program batch'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Auth types
export type LoginInput = z.infer<typeof loginSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Memory types
export type MemoryVisibility = z.infer<typeof memoryVisibilityEnum>;
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;
export type CreateMemoryServerInput = z.infer<typeof createMemoryServerSchema>;
