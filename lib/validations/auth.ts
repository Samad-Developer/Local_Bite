import * as z from 'zod';

export const SignupFormSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .max(50, "Name must be at most 50 characters long")
        .trim(),

    email: z
        .string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(100, "Password must be at most 100 characters long")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase, one lowercase, and one number"
        ),

    restaurantName: z
        .string()
        .min(2, "Restaurant name must be at least 2 characters")
        .max(100, "Restaurant name must be less than 100 characters")
        .trim(),
})

export const LoginSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .toLowerCase()
        .trim(),

    password: z
        .string()
        .min(1, "Password is required"),
})