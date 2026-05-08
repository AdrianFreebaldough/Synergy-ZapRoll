export const authService = {
  login: async (credentials) => ({ token: 'placeholder-token', user: credentials?.email || null }),
}
