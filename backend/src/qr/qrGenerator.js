import QRCode from 'qrcode'
import { resolveCategoryRoute } from './qrRedirectResolver.js'

export async function generateQrForCategory({ category, baseUrl }) {
  const route = resolveCategoryRoute(category)
  const redirectUrl = `${baseUrl}${route}`
  const qrImageDataUrl = await QRCode.toDataURL(redirectUrl)

  return { category, route, redirectUrl, qrImageDataUrl }
}
