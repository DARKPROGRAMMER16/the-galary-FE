import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .email('Enter a valid email address.'),
  password: z
    .string()
    .min(1, 'Password is required.'),
})

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Full name must be at least 2 characters.')
      .max(60, 'Full name must be under 60 characters.'),
    organisation: z
      .string()
      .min(2, 'Organisation must be at least 2 characters.')
      .max(80, 'Organisation must be under 80 characters.'),
    email: z
      .string()
      .min(1, 'Email is required.')
      .email('Enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter.')
      .regex(/[0-9]/, 'Password must contain at least one number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  })

export type LoginFields = z.infer<typeof loginSchema>
export type SignUpFields = z.infer<typeof signUpSchema>
