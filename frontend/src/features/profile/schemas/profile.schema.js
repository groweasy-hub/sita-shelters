import { z } from "zod";

export const MOBILE_PATTERN = /^\+?[0-9][0-9\s\-()]{6,19}$/;

export const profileInputSchema = z.object({
  name: z.string().trim().min(1, "Enter your full name").max(255),
  mobile: z
    .string()
    .trim()
    .refine((value) => value === "" || MOBILE_PATTERN.test(value), {
      message: "Enter a valid mobile number",
    }),
});

export const changePasswordInputSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "Use at least 8 characters")
      .max(128, "Use at most 128 characters")
      .regex(/[A-Za-z]/, "Include at least one letter")
      .regex(/[0-9]/, "Include at least one number"),
    confirmPassword: z.string().min(1, "Re-enter your new password"),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: "Choose a password different from your current one",
    path: ["newPassword"],
  });

export const changePasswordDefaults = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};
