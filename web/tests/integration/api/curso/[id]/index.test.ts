import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as cursoService from '@/backend/services/curso'
import { GET, DELETE } from '@/backend/api/curso/[id]/route'
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';
import { postCursoMock } from '../../../mocks/curso';

vi.mock('@/backend/services/curso', () => ({
  getCursoById: vi.fn(),
  deleteCurso: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realId = postCursoMock.id;
const fakeId = '960bc679-2a96-4795-bed7-aaaaaaaaaaaa';
const cursoMock = postCursoMock;

describe('GET /api/curso/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return curso if it exists', async () => {
    (cursoService.getCursoById as Mock).mockResolvedValue(cursoMock);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(cursoMock);
    expect(cursoService.getCursoById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (cursoService.getCursoById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(cursoService.getCursoById).toHaveBeenCalled();
  });
});

describe('DELETE /api/curso/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response?.status).toBe(403);
  });

  it('should delete curso if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (cursoService.getCursoById as Mock).mockResolvedValue(cursoMock);
    (cursoService.deleteCurso as Mock).mockResolvedValue(cursoMock);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(cursoMock);
    expect(cursoService.getCursoById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (cursoService.getCursoById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(cursoService.getCursoById).toHaveBeenCalled();
  });
}); 