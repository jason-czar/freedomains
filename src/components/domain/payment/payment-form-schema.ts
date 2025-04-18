
import { z } from "zod";

export const formSchema = z.object({
  cardNumber: z.string()
    .min(16, "Card number must have at least 16 digits")
    .max(19, "Card number cannot exceed 19 digits")
    .regex(/^[0-9]+$/, "Card number must contain only digits"),
  expiryMonth: z.string()
    .min(1, "Expiry month is required")
    .max(2, "Expiry month cannot exceed 2 digits")
    .regex(/^(0?[1-9]|1[0-2])$/, "Expiry month must be between 1-12"),
  expiryYear: z.string()
    .min(2, "Expiry year is required")
    .max(4, "Expiry year cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "Expiry year must contain only digits"),
  cvc: z.string()
    .min(3, "CVC must have at least 3 digits")
    .max(4, "CVC cannot exceed 4 digits")
    .regex(/^[0-9]+$/, "CVC must contain only digits"),
  name: z.string()
    .min(3, "Name must have at least 3 characters")
    .max(100, "Name is too long"),
});

export type PaymentFormValues = z.infer<typeof formSchema>;
