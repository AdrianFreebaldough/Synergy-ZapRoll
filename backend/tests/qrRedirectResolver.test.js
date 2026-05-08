import assert from 'node:assert/strict'
import test from 'node:test'
import { resolveCategoryRoute } from '../src/qr/qrRedirectResolver.js'

test('returns route for known category', () => {
  assert.equal(resolveCategoryRoute('speaker'), '/register/speaker')
})

test('falls back to regular participant route for unknown categories', () => {
  assert.equal(resolveCategoryRoute('unknown'), '/register/regular-participant')
})
