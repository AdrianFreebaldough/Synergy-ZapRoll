import { generateQrForCategory } from '../qr/qrGenerator.js'

export const qrService = {
  generate: (payload) => generateQrForCategory(payload),
}
