import { z } from 'zod';

export const attendanceSchema = z.discriminatedUnion('category', [
  z.object({
    category: z.literal('student'),
    studentId: z.string()
      .min(1, 'Student ID is required')
      .regex(/^\d{2}-\d{4}$/, 'Format must be 00-0000 (e.g. 23-1024)'),
  }),
  z.object({
    category: z.literal('employee'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
  z.object({
    category: z.literal('guest'),
    name: z.string().min(2, 'Name must be at least 2 characters'),
  }),
]);

export type AttendanceSchemaType = z.infer<typeof attendanceSchema>;
