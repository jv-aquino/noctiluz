import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as topicoService from '@/backend/services/topico'
import { GET, POST } from '@/backend/api/topico/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { getTopicosMock, postTopicoMock } from '../../mocks/topico'

vi.mock('@/backend/services/topico', () => ({
  getAllTopicos: vi.fn(),
  createTopico: vi.fn(),
}))

describe('GET /api/topico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return topicos from the service', async () => {
    (topicoService.getAllTopicos as Mock).mockResolvedValue(getTopicosMock);
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getTopicosMock);
    expect(topicoService.getAllTopicos).toHaveBeenCalled();
  });
});

describe('POST /api/topico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createTopicoRequest = () => createRequest(postTopicoMock, "topico")
  const createPayload = {
    name: postTopicoMock.name,
    descricao: postTopicoMock.descricao,
    slug: postTopicoMock.slug,
    archived: postTopicoMock.archived,
    materiaId: postTopicoMock.materiaId,
  };

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createTopicoRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createTopicoRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicoService.createTopico as Mock).mockResolvedValue(postTopicoMock);
    const response = await POST(createTopicoRequest());
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(postTopicoMock);
    expect(topicoService.createTopico).toHaveBeenCalledWith(createPayload);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (topicoService.createTopico as Mock).mockResolvedValue(postTopicoMock);
    const response = await POST(createTopicoRequest());
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(postTopicoMock);
    expect(topicoService.createTopico).toHaveBeenCalledWith(createPayload);
  });
}); 