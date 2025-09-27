import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET } from '@/app/(backend)/api/lessons/topics/[topicId]/route'
import { createRequest } from '../../../../mocks/requests'
import { postLessonMock } from '../../../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  getLessonsByTopicId: vi.fn(),
}))

describe('GET /api/lessons/topicos/[topicoId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lessons for a specific topico', async () => {
    const topicId = "550e8400-e29b-41d4-a716-446655440001";
    const lessonsMock = [postLessonMock];
    (lessonService.getLessonsByTopicId as Mock).mockResolvedValue(lessonsMock);

    const request = createRequest({}, 'lessons/topics');
    const response = await GET(request, { params: Promise.resolve({ topicId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(lessonsMock);
    expect(lessonService.getLessonsByTopicId).toHaveBeenCalledWith(topicId);
  });

  it('should return empty array if no lessons found for topic', async () => {
    const topicId = "550e8400-e29b-41d4-a716-446655440999";
    (lessonService.getLessonsByTopicId as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, 'lessons/topics');
    const response = await GET(request, { params: Promise.resolve({ topicId }) });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
    expect(lessonService.getLessonsByTopicId).toHaveBeenCalledWith(topicId);
  });
}); 