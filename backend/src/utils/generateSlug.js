export function generateSlug(value = '') {
  return value.toString().toLowerCase().trim().replace(/\s+/g, '-')
}
