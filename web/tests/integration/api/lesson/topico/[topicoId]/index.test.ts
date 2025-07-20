import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET } from '@/backend/api/lesson/topico/[topicoId]/route'
import { createRequest } from '../../../../mocks/requests'
import { postLessonMock } from '../../../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  getLessonsByTopicoId: vi.fn(),
}))

describe('GET /api/lesson/topico/[topicoId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lessons for a specific topico', async () => {
    const topicoId = "550e8400-e29b-41d4-a716-446655440001";
    const lessonsMock = [postLessonMock];
    (lessonService.getLessonsByTopicoId as Mock).mockResolvedValue(lessonsMock);
    
    const request = createRequest({}, 'lesson/topico');
    const response = await GET(request, { params: Promise.resolve({ topicoId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(lessonsMock);
    expect(lessonService.getLessonsByTopicoId).toHaveBeenCalledWith(topicoId);
  });

  it('should return empty array if no lessons found for topico', async () => {
    const topicoId = "550e8400-e29b-41d4-a716-446655440999";
    (lessonService.getLessonsByTopicoId as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, 'lesson/topico');
    const response = await GET(request, { params: Promise.resolve({ topicoId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
    expect(lessonService.getLessonsByTopicoId).toHaveBeenCalledWith(topicoId);
  });
}); 