import { authApi } from '../api/authApi'

export const authService = {
  login: async (credentials) => {
    const { data } = await authApi.login(credentials)
    return data
  },
}
