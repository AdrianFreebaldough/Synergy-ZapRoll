import { CATEGORY_TO_ROUTE } from '../utils/constants.js'

export function resolveCategoryRoute(category) {
  return CATEGORY_TO_ROUTE[category] || CATEGORY_TO_ROUTE['regular-participant']
}
