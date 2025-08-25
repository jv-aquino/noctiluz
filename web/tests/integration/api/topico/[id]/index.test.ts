import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as topicoService from '@/backend/services/topico'
import { GET, DELETE } from '@/app/(backend)/api/topicos/[id]/route'
import { returnParams } from '../../../mocks/requests';
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';
import { getTopicosMock, postTopicoMock } from '../../../mocks/topico';

vi.mock('@/backend/services/topico', () => ({
  getTopicoById: vi.fn(),
  deleteTopico: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realId = postTopicoMock.id;
const fakeId = 'a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa';
const topicoMock = postTopicoMock;

describe('GET /api/topicos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return topico if it exists', async () => {
    (topicoService.getTopicoById as Mock).mockResolvedValue(topicoMock);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(topicoMock);
    expect(topicoService.getTopicoById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (topicoService.getTopicoById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(topicoService.getTopicoById).toHaveBeenCalled();
  });
});

describe('DELETE /api/topicos/[id]', () => {
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

  it('should delete topico if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicoService.getTopicoById as Mock).mockResolvedValue(topicoMock);
    (topicoService.deleteTopico as Mock).mockResolvedValue(topicoMock);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(topicoMock);
    expect(topicoService.getTopicoById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicoService.getTopicoById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(topicoService.getTopicoById).toHaveBeenCalled();
  });
}); 