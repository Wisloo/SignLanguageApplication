import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Enter a valid email address.")),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(100, "That password is too long."),
});

export const registerSchema = credentialsSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "Please add a name.")
    .max(60, "That name is too long."),
  guardianConsent: z
    .boolean()
    .refine(
      (value) => value === true,
      "Please confirm you have consent from a parent, guardian, or teacher.",
    ),
});

export const progressSchema = z.object({
  language: z.enum(["asl", "fsl"]),
  letter: z.string().trim().toUpperCase().length(1),
  success: z.boolean().optional().default(false),
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ProgressInput = z.infer<typeof progressSchema>;
