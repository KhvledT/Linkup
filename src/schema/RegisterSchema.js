import * as zod from 'zod'

export const registerSchema = zod
  .object({
    name: zod.string()
      .nonempty('Name is required')
      .min(3, 'Name must be at least 3 characters')
      .max(20, 'Name must be at most 20 characters'),

    email: zod.string()
      .nonempty('Email is required')
      .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email format'),

    password: zod.string()
      .nonempty('Password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/, 
        'Minimum eight characters, one uppercase, one lowercase, one number, and one special character'),

    rePassword: zod.string()
      .nonempty('Confirm Password is required'),
      
    dateOfBirth: zod.coerce.date()
      .refine((date) => {
        const currentYear = new Date().getFullYear();
        const birthYear = date.getFullYear();
        return currentYear - birthYear >= 18;
      }, 'You must be at least 18 years old to register'),

    gender: zod.string()
      .nonempty('Gender is required')
      .regex(/^(male|female)$/, 'Gender must be "male" or "female"'),

  })
  .refine((data) => data.password === data.rePassword, {
    message: 'Passwords do not match',
    path: ['rePassword'], // ✅ خليها زي اسم الـ field بالظبط
  });
