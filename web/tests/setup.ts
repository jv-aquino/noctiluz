import { vi } from 'vitest'
import { mockAuth } from './mocks/auth'

vi.mock('better-auth/next-js', () => ({
  nextCookies: () => ({})
}))

vi.mock('@/auth', () => ({
  auth: mockAuth
}))