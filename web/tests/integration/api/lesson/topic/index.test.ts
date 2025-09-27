import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { POST, PATCH } from '@/backend/api/lessons/topics/route'
import { setCurrentRole } from '../../../mocks/auth'
import { createRequest } from '../../../mocks/requests'
import { addLessonToTopicMock, reorderLessonsMock } from '../../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  addLessonToTopic: vi.fn(),
  reorderLessonsInTopic: vi.fn(),
}))

describe('POST /api/lessons/topics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createAddRequest = () => createRequest(addLessonToTopicMock, 'lessons/topics');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createAddRequest();
    const response = await POST(request);
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createAddRequest();
    const response = await POST(request);
    expect(response?.status).toBe(403);
  });

  it('should add lesson to topic if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    const relationMock = {
      id: 'relation-123',
      lessonId: addLessonToTopicMock.lessonId,
      topicId: addLessonToTopicMock.topicId,
      order: addLessonToTopicMock.order,
    };
    (lessonService.addLessonToTopic as Mock).mockResolvedValue(relationMock);

    const request = createAddRequest();
    const response = await POST(request);
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(relationMock);
    expect(lessonService.addLessonToTopic).toHaveBeenCalledWith(
      addLessonToTopicMock.lessonId,
      addLessonToTopicMock.topicId,
      addLessonToTopicMock.order
    );
  });
});

describe('PATCH /api/lessons/topics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createReorderRequest = () => createRequest(reorderLessonsMock, 'lessons/topics');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createReorderRequest();
    const response = await PATCH(request);
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createReorderRequest();
    const response = await PATCH(request);
    expect(response?.status).toBe(403);
  });

  it('should reorder lessons if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.reorderLessonsInTopic as Mock).mockResolvedValue([]);

    const request = createReorderRequest();
    const response = await PATCH(request);
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Ordem das lições atualizada' });
    expect(lessonService.reorderLessonsInTopic).toHaveBeenCalledWith(
      reorderLessonsMock.topicId,
      reorderLessonsMock.lessonIds
    );
  });
}); 