/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as subjectService from '@/backend/services/subject'
import { DELETE, GET } from '@/backend/api/subjects/[id]/route'
import { returnParams } from '../../../mocks/requests';
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';

vi.mock('@/backend/services/subject', () => ({
  getSubjectById: vi.fn(),
  deleteSubject: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realParams = { id: '960bc679-2a96-4795-bed7-62c0a05996e0' };
const fakeParams = { id: '960bc679-2a96-4795-bed7-aaaaaaaaaaaa' };

describe('GET /api/subjects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return subject if it exists', async () => {
    (subjectService.getSubjectById as Mock).mockResolvedValue(realParams);
    const response = await GET(mockRequest, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(subjectService.getSubjectById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (subjectService.getSubjectById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(subjectService.getSubjectById).toHaveBeenCalled();
  });
});

describe('DELETE /api/subjects/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await DELETE(mockRequest, returnParams(realParams) as any);
    expect(response?.status).toBe(401);
  });
  
  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await DELETE(mockRequest, returnParams(realParams) as any);
    expect(response?.status).toBe(403);
  });
  
  it('should delete subject if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (subjectService.getSubjectById as Mock).mockResolvedValue(realParams);
    (subjectService.deleteSubject as Mock).mockResolvedValue(realParams);
    const response = await DELETE(mockRequest, returnParams(realParams) as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(subjectService.getSubjectById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (subjectService.getSubjectById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(subjectService.getSubjectById).toHaveBeenCalled();
  });
});