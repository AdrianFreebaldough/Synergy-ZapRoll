export const SECURE_TOKENS = {
  // Registration Tokens
  REGISTRATION: {
    STUDENT: 'a7c9f21be81d44aa',
    STUDENT_WALK_IN: 'w1a2l3k4i5n6s7t',
    EMPLOYEE: 'b2e1f41ce81d55bb',
    EMPLOYEE_WALK_IN: 'e9r8t7y6u5i4o3p',
    GUEST: 'c3d4e51be92e66cc',
    GUEST_WALK_IN: 'g1h2j3k4l5m6n7b'
  },
  // Attendance Tokens
  ATTENDANCE: {
    STUDENT_AM: 'f81ca2d771d91a',
    STUDENT_PM: 'g92db3e882e02b',
    EMPLOYEE: 'd3f4b5e61c7d2a',
    GUEST: 'e5f6g7h81i9j3b'
  },
  // Survey Tokens
  SURVEY: {
    GENERAL: 'c71d8ea29a1fbc42'
  }
};

/**
 * Finds the action associated with a given token
 * @param token The randomized secure token string
 */
export const findTokenAction = (token: string) => {
  for (const [category, tokens] of Object.entries(SECURE_TOKENS)) {
    for (const [subCategory, value] of Object.entries(tokens)) {
      if (value === token) {
        return { category, subCategory };
      }
    }
  }
  return null;
};
