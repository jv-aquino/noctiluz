/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as cursoService from '@/backend/services/course'
import { GET } from '@/backend/api/courses/subjects/[subjectId]/route'
import { returnParams } from '../../../../mocks/requests';

vi.mock('@/backend/services/course', () => ({
  getCoursesBySubjectId: vi.fn(),
}))

const realParams = { subjectId: '960bc679-2a96-4795-bed7-62c0a05996e0' };
const fakeParams = { subjectId: '960bc679-2a96-4795-bed7-aaaaaaaaaaaa' };
const cursosMock = [
  { id: '960bc679-2a96-4795-bed7-62c0a05996e0', name: 'Curso 1', descricao: 'Descricao', slug: 'curso-1', tags: [], materiasRelacionadas: [] },
  { id: '960bc679-2a96-4795-bed7-62c0a05996e1', name: 'Curso 2', descricao: 'Descricao', slug: 'curso-2', tags: [], materiasRelacionadas: [] },
];

describe('GET /api/courses/subjects/[subjectId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return cursos if found', async () => {
    (cursoService.getCoursesBySubjectId as Mock).mockResolvedValue(cursosMock);
    const response = await GET({} as any, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data).toEqual(cursosMock);
    expect(cursoService.getCoursesBySubjectId).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (cursoService.getCoursesBySubjectId as Mock).mockResolvedValue([]);
    const response = await GET({} as any, returnParams(fakeParams) as any);
    expect(response.status).toBe(404);
    expect(cursoService.getCoursesBySubjectId).toHaveBeenCalled();
  });
});
