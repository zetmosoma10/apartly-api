import z from "zod";

export const userSchema = z.object({
  firstName: z
    .string({ invalid_type_error: "first name must be a string" })
    .min(1, "firstName required")
    .max(255, "first too long"),
  lastName: z
    .string({ invalid_type_error: "last name must be a string" })
    .min(1, "lastName is required")
    .max(255, "last too long"),
  email: z.string().email().max(255, "email too long"),
  password: z
    .string({ invalid_type_error: "password must be a string" })
    .min(4, "password too short")
    .max(255, "password too long"),
  phone: z.string().min(1, "phone required").max(255, "phone too long"),
  role: z.enum(["tenant", "landlord", "admin"]).default("tenant"),
});

export const loginSchema = userSchema.pick({ email: true, password: true });
export const deleteProfileSchema = userSchema.pick({ password: true });
export const forgotPasswordSchema = userSchema.pick({ email: true });

export const updateMeSchema = z.object({
  firstName: z
    .string({ invalid_type_error: "first name must be a string" })
    .min(1, "firstName required")
    .max(255, "first too long")
    .optional(),
  lastName: z
    .string({ invalid_type_error: "last name must be a string" })
    .min(1, "lastName is required")
    .max(255, "last too long")
    .optional(),
  email: z.string().email().max(255, "email too long").optional(),
  phone: z
    .string()
    .min(1, "phone required")
    .max(255, "phone too long")
    .optional(),
});
