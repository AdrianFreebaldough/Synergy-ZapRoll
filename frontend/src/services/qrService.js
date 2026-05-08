import { CATEGORIES } from '../utils/roles'

export function getRegistrationRouteByCategory(category) {
  const safeCategory = Object.values(CATEGORIES).includes(category)
    ? category
    : CATEGORIES.REGULAR_PARTICIPANT

  return `/register/${safeCategory}`
}
