/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as cursoService from '@/backend/services/curso'
import { GET } from '@/backend/api/curso/materia/[materiaId]/route'
import { returnParams } from '../../../../mocks/requests';

vi.mock('@/backend/services/curso', () => ({
  getCursosByMateriaId: vi.fn(),
}))

const realParams = { materiaId: '960bc679-2a96-4795-bed7-62c0a05996e0' };
const fakeParams = { materiaId: '960bc679-2a96-4795-bed7-aaaaaaaaaaaa' };
const cursosMock = [
  { id: '960bc679-2a96-4795-bed7-62c0a05996e0', name: 'Curso 1', descricao: 'Descricao', slug: 'curso-1', tags: [], materiasRelacionadas: [] },
  { id: '960bc679-2a96-4795-bed7-62c0a05996e1', name: 'Curso 2', descricao: 'Descricao', slug: 'curso-2', tags: [], materiasRelacionadas: [] },
];

describe('GET /api/curso/materia/[materiaId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cursos if found', async () => {
    (cursoService.getCursosByMateriaId as Mock).mockResolvedValue(cursosMock);
    const response = await GET({} as any, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(cursosMock);
    expect(cursoService.getCursosByMateriaId).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (cursoService.getCursosByMateriaId as Mock).mockResolvedValue([]);
    const response = await GET({} as any, returnParams(fakeParams) as any);
    expect(response.status).toBe(404);
    expect(cursoService.getCursosByMateriaId).toHaveBeenCalled();
  });
});
