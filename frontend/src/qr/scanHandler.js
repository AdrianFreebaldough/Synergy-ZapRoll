import { getRegistrationRouteByCategory } from '../services/qrService'

export function resolveQrRedirect(category) {
  return getRegistrationRouteByCategory(category)
}
