import { vi } from 'vitest';
import { Role } from '@/generated/prisma';

let currentRole: Role | null = null
let currentUser: any = null
let currentSession: any = null

export const getCurrentRole = () => currentRole;

export const setCurrentRole = (role: Role | null) => {
  currentRole = role
  
  if (role) {
    currentUser = {
      id: 'test-user-id',
      email: 'test@example.com',
      name: 'Test User'
    }
    currentSession = {
      id: 'test-session-id',
      userId: 'test-user-id',
      expiresAt: new Date(Date.now() + 864000),
      token: 'test-token'
    }
  } else {
    currentUser = null
    currentSession = null
  }
}

export const mockAuth = {
  api: {
    getSession: vi.fn().mockImplementation(() => {
      if (!currentSession) {
        return Promise.resolve({ data: null, error: null })
      }
      
      return Promise.resolve({
          user: currentUser,
          session: currentSession,
          role: currentRole
      })
    })
  }
}

export const mockGetUserRole = vi.fn().mockImplementation(() => {
  return Promise.resolve(currentRole)
})