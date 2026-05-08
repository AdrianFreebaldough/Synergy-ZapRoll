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
  studentId: z.string().regex(studentIdRegex, 'Format must be 00-0000').optional(),
  name: z.string().min(2, 'Name is required').optional(),
  section: z.string().min(1, 'Section is required').optional(),
  studentRole: z.enum(['Participant', 'Presenter', 'Poster']).optional(),
  representativeName: z.string().min(2, 'Representative name is required').optional(),
  groupNumber: z.string().min(1, 'Group number is required').optional(),
  capstoneTitle: z.string().min(2, 'Capstone title is required').optional(),
}).refine((data) => {
  if (data.yearLevel === '3rd Year') {
    return !!data.studentId && !!data.name && !!data.section;
  }
  if (data.yearLevel === '4th Year') {
    if (data.studentRole === 'Participant') {
      return !!data.studentId && !!data.name && !!data.section;
    }
    if (data.studentRole === 'Presenter' || data.studentRole === 'Poster') {
      return !!data.representativeName && !!data.groupNumber && !!data.section && !!data.capstoneTitle;
    }
  }
  return true;
}, {
  message: "Required fields are missing for the selected role",
  path: ["studentRole"],
});

export type RegistrationFormData = any;
