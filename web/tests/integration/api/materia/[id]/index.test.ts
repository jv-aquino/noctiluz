/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as materiaService from '@/backend/services/materia'
import { DELETE, GET } from '@/backend/api/materia/[id]/route'
import { returnParams } from '../../../mocks/requests';
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';

vi.mock('@/backend/services/materia', () => ({
  getMateriaById: vi.fn(),
  deleteMateria: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realParams = { id: '960bc679-2a96-4795-bed7-62c0a05996e0' };
const fakeParams = { id: '960bc679-2a96-4795-bed7-aaaaaaaaaaaa' };

describe('GET /api/materia/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return materia if it exists', async () => {
    (materiaService.getMateriaById as Mock).mockResolvedValue(realParams);
    const response = await GET(mockRequest, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (materiaService.getMateriaById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });
});

describe('DELETE /api/materia/[id]', () => {
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
  
  it('should delete materia if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (materiaService.getMateriaById as Mock).mockResolvedValue(realParams);
    (materiaService.deleteMateria as Mock).mockResolvedValue(realParams);
    const response = await DELETE(mockRequest, returnParams(realParams) as any);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (materiaService.getMateriaById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(materiaService.getMateriaById).toHaveBeenCalled();
  });
});