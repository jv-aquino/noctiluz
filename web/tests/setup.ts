import { vi } from 'vitest'
import { mockAuth, mockGetUserRole } from './mocks/auth'

vi.mock('better-auth/next-js', () => ({
  nextCookies: () => ({})
}))

vi.mock('@/auth', () => ({
  auth: mockAuth
}))