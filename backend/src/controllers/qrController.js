import { qrService } from '../services/qrService.js'

export async function generateCategoryQr(req, res) {
  const result = await qrService.generate({
    category: req.params.category,
    baseUrl: `${req.protocol}://${req.get('host')}`,
  })

  res.status(200).json(result)
}
