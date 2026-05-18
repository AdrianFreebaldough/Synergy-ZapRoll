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
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Must be a valid email (e.g., name@domain.com)').refine(val => {
    const v = val.toLowerCase();
    if (v.includes('@gmail') && !v.endsWith('@gmail.com')) return false;
    if (v.includes('@yahoo') && !v.endsWith('@yahoo.com') && !v.endsWith('@yahoo.com.ph')) return false;
    if (v.endsWith('.co') || v.endsWith('c.om') || v.endsWith('.con')) return false;
    return true;
  }, 'Please enter a complete and correctly spelled email (e.g., @gmail.com)'),
  studentId: z.string().regex(studentIdRegex, 'Format must be 00-0000').optional().or(z.literal('')),
  name: z.string().min(2, 'Name is required').optional().or(z.literal('')),
  firstName: z.string().min(2, 'First Name is required').optional().or(z.literal('')),
  lastName: z.string().min(2, 'Last Name is required').optional().or(z.literal('')),
  middleName: z.string().optional().or(z.literal('')),
  section: z.string().min(1, 'Section is required').optional().or(z.literal('')),
  studentRole: z.enum(['Colloquium Participant', 'Colloquium Presenter', 'Poster Presenter']).optional(),
  representativeName: z.string().min(2, 'Representative name is required').optional().or(z.literal('')),
  groupNumber: z.string().regex(/^\d+$/, 'Numbers only').optional().or(z.literal('')),
  capstoneTitle: z.string().min(2, 'Capstone title is required').optional().or(z.literal('')),
  isEdit: z.boolean().optional(),
}).superRefine((data, ctx) => {
  // If editing details or adding a second role, skip strict refinement checks to prevent blocking hidden fields
  if (data.isEdit) return;

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
    if (!data.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["firstName"] });
    if (!data.lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["lastName"] });
    if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Section is required", path: ["section"] });
  }

  if (data.yearLevel === '4th Year') {
    if (data.studentRole === 'Colloquium Participant') {
      if (!data.studentId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID is required", path: ["studentId"] });
      if (!data.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["firstName"] });
      if (!data.lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["lastName"] });
      if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Section is required", path: ["section"] });
    }
    if (data.studentRole === 'Poster Presenter') {
      if (!data.studentId) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "ID is required", path: ["studentId"] });
      if (!data.firstName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["firstName"] });
      if (!data.lastName) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["lastName"] });
      if (!data.groupNumber) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["groupNumber"] });
      if (!data.section) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["section"] });
      if (!data.capstoneTitle) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Required", path: ["capstoneTitle"] });
    }
    if (data.studentRole === 'Colloquium Presenter') {
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
  email: z.string().regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Must be a valid email (e.g., name@domain.com)').refine(val => {
    const v = val.toLowerCase();
    if (v.includes('@gmail') && !v.endsWith('@gmail.com')) return false;
    if (v.includes('@yahoo') && !v.endsWith('@yahoo.com') && !v.endsWith('@yahoo.com.ph')) return false;
    if (v.endsWith('.co') || v.endsWith('c.om') || v.endsWith('.con')) return false;
    return true;
  }, 'Please enter a complete and correctly spelled email (e.g., @gmail.com)'),
  phone: z.string().min(7, 'Invalid phone number'),
  organization: z.string().min(2, 'Organization is required'),
  category: z.string().optional(),
});
