import * as zod from 'zod'


//   Login schema for login functionality
export const loginSchema = zod
  .object({
    email: zod.string()
        .nonempty('Email is required')
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),

    password: zod.string()
        .nonempty('Password is required')
        .min(8, 'Password must be at least 8 characters')
        .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, 'Minimum eight characters, at least one letter and one number'),
  })
