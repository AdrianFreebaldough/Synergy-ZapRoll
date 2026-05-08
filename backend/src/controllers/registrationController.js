import { registrationService } from '../services/registrationService.js'

export async function createRegistration(req, res) {
  const result = await registrationService.create(req.body)
  res.status(201).json(result)
}
