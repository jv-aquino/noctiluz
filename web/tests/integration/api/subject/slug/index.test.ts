/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as subjectService from '@/backend/services/subject'
import { GET } from '@/backend/api/subjects/slug/[slug]/route'
import { returnParams } from '../../../mocks/requests';

vi.mock('@/backend/services/subject', () => ({
  getSubjectBySlug: vi.fn(),
}))

describe('GET /api/subjects/slug/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRequest = {} as Request;
  const realParams = { slug: 'verdadeiro' };
  const fakeParams = { slug: 'falso' };

  it('should return subject if it exists', async () => {
    (subjectService.getSubjectBySlug as Mock).mockResolvedValue(realParams);
    const response = await GET(mockRequest, returnParams(realParams) as any);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(realParams);
    expect(subjectService.getSubjectBySlug).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (subjectService.getSubjectBySlug as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, returnParams(fakeParams) as any);
    
    expect(response.status).toBe(404);
    expect(subjectService.getSubjectBySlug).toHaveBeenCalled();
  });
});