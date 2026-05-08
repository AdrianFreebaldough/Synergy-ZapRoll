import { registrationApi } from '../api/registrationApi'

export const registrationService = {
  submit: async (payload) => {
    const { data } = await registrationApi.submit(payload)
    return data
  },
}
