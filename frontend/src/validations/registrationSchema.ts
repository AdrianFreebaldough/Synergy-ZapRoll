import { z } from 'zod';

const studentIdRegex = /^\d{2}-\d{4}$/;

// Shared basic fields
const baseSchema = z.object({
  category: z.enum(['employee', 'guest', 'student']),
});

// Employee Schema
export const employeeSchema = baseSchema.extend({
  category: z.literal('employee'),
  name: z.string().min(2, 'Name is required'),
  department: z.string().min(2, 'Department is required'),
});

// Guest Schema
export const guestSchema = baseSchema.extend({
  category: z.literal('guest'),
  guestType: z.enum(['Speaker', 'Others']),
  name: z.string().min(2, 'Name is required'),
});

// Student Schema with Conditional Logic
export const studentSchema = baseSchema.extend({
  category: z.literal('student'),
  yearLevel: z.enum(['3rd Year', '4th Year']),
  email: z.string().email('Invalid email address'),
  studentId: z.string().regex(studentIdRegex, 'Format must be 00-0000').optional(),
  name: z.string().min(2, 'Name is required').optional(),
  section: z.string().min(1, 'Section is required').optional(),
  studentRole: z.enum(['Participant', 'Presenter', 'Poster']).optional(),
  representativeName: z.string().min(2, 'Representative name is required').optional(),
  groupNumber: z.string().min(1, 'Group number is required').optional(),
  capstoneTitle: z.string().min(2, 'Capstone title is required').optional(),
}).superRefine((data, ctx) => {
  // 1. Year Level & Section Validation
  if (data.yearLevel === '3rd Year' && data.section && !data.section.includes('3')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Section must match your year level (e.g., SBIT-3G)",
      path: ["section"],
    });
  }
  if (data.yearLevel === '4th Year' && data.section && !data.section.includes('4')) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Section must match your year level (e.g., SBIT-4A)",
      path: ["section"],
    });
  }

  // 1.1 ID Batch Validation (e.g. 23-1234)
  if (data.studentId && data.studentId.includes('-')) {
    const batch = parseInt(data.studentId.split('-')[0], 10);
    if (!isNaN(batch)) {
      if (data.yearLevel === '4th Year' && batch > 22) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "4th Year IDs must start with 22 or below",
          path: ["studentId"],
        });
      }
      if (data.yearLevel === '3rd Year' && batch > 23) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "3rd Year IDs must start with 23 or below",
          path: ["studentId"],
        });
      }
    }
  }

  // 2. Conditional Role Fields Validation
  if (data.yearLevel === '3rd Year') {
    if (!data.studentId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID is required", path: ["studentId"] });
    if (!data.name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Name is required", path: ["name"] });
    if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Section is required", path: ["section"] });
  }

  if (data.yearLevel === '4th Year') {
    if (data.studentRole === 'Participant') {
      if (!data.studentId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID is required", path: ["studentId"] });
      if (!data.name) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Name is required", path: ["name"] });
      if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Section is required", path: ["section"] });
    }
    if (data.studentRole === 'Presenter' || data.studentRole === 'Poster') {
      if (!data.studentId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID is required", path: ["studentId"] });
      if (!data.representativeName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["representativeName"] });
      if (!data.groupNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["groupNumber"] });
      if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["section"] });
      if (!data.capstoneTitle) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["capstoneTitle"] });
    }
  }
});

export type EmployeeFormData = z.infer<typeof employeeSchema>;
export type GuestFormData = z.infer<typeof guestSchema>;
export type StudentFormData = z.infer<typeof studentSchema>;

export type RegistrationFormData = EmployeeFormData | GuestFormData | StudentFormData | any;

export const registrationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(7, 'Invalid phone number'),
  organization: z.string().min(2, 'Organization is required'),
  category: z.string().optional(),
});
