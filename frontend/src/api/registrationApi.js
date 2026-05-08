import { apiClient } from './apiClient'

export const registrationApi = {
  submit: (payload) => apiClient.post('/registrations', payload),
}
