import { z } from "zod";

export const apartmentSchema = z.object({
  title: z.string().min(1, "title required").max(255, "title too long"),
  description: z
    .string()
    .min(1, "description required")
    .max(1020, "description too long"),
  price: z.coerce
    .number({ invalid_type_error: "price must be a number" })
    .positive("price must be a positive number"),
  bedrooms: z.coerce
    .number({ invalid_type_error: "bedrooms must be a number" })
    .int()
    .min(0, "bedrooms must be a whole number"),
  bathrooms: z.coerce
    .number({ invalid_type_error: "bathrooms must be a number" })
    .int()
    .min(0, "bathrooms must be a whole number"),
  city: z.string().min(1, "city required").max(255, "city too long"),
  address: z.string().min(1, "address required").max(255, "address too long"),
  status: z.enum(["available", "rented", "maintenance"]).default("available"),
  type: z.enum([
    "studio",
    "bachelor",
    "1-bedroom",
    "2-bedroom",
    "3-bedroom",
    "other",
  ]),
  amenities: z
    .union([
      z.string().transform((val) => val.split(",").map((a) => a.trim())), // if sent as "wifi,parking"
      z.array(z.string()), // if already sent as ["wifi","parking"]
    ])
    .optional(),
});
