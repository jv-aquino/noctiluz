import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as cursoService from '@/backend/services/curso'
// Route handlers (to be implemented in the future)
import { GET, POST } from '@/app/(backend)/api/cursos/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { getCursosMock, postCursoMock } from '../../mocks/curso'

vi.mock('@/backend/services/curso', () => ({
  getAllCursos: vi.fn(),
  createCurso: vi.fn(),
}))

describe('GET /api/cursos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return cursos from the service', async () => {
    (cursoService.getAllCursos as Mock).mockResolvedValue(getCursosMock);
    const response = await GET();
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getCursosMock);
    expect(cursoService.getAllCursos).toHaveBeenCalled();
  });
});

describe('POST /api/cursos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null); // Reset auth context
  });

  const createCursoRequest = () => createRequest(postCursoMock, "curso")
  const createPayload = {
    name: postCursoMock.name,
    descricao: postCursoMock.descricao,
    slug: postCursoMock.slug,
    tags: postCursoMock.tags,
  };

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createCursoRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createCursoRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (cursoService.createCurso as Mock).mockResolvedValue(postCursoMock);

    const response = await POST(createCursoRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postCursoMock);
    expect(cursoService.createCurso).toHaveBeenCalledWith(createPayload);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (cursoService.createCurso as Mock).mockResolvedValue(postCursoMock);

    const response = await POST(createCursoRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postCursoMock);
    expect(cursoService.createCurso).toHaveBeenCalledWith(createPayload);
  });
}); 