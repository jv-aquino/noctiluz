import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { POST, PATCH } from '@/backend/api/lesson/topico/route'
import { setCurrentRole } from '../../../mocks/auth'
import { createRequest } from '../../../mocks/requests'
import { addLessonToTopicoMock, reorderLessonsMock } from '../../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  addLessonToTopico: vi.fn(),
  reorderLessonsInTopico: vi.fn(),
}))

describe('POST /api/lesson/topico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createAddRequest = () => createRequest(addLessonToTopicoMock, 'lesson/topico');

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

  it('should add lesson to topico if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    const relationMock = {
      id: 'relation-123',
      lessonId: addLessonToTopicoMock.lessonId,
      topicoId: addLessonToTopicoMock.topicoId,
      order: addLessonToTopicoMock.order,
    };
    (lessonService.addLessonToTopico as Mock).mockResolvedValue(relationMock);

    const request = createAddRequest();
    const response = await POST(request);
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(relationMock);
    expect(lessonService.addLessonToTopico).toHaveBeenCalledWith(
      addLessonToTopicoMock.lessonId,
      addLessonToTopicoMock.topicoId,
      addLessonToTopicoMock.order
    );
  });
});

describe('PATCH /api/lesson/topico', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createReorderRequest = () => createRequest(reorderLessonsMock, 'lesson/topico');

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
    (lessonService.reorderLessonsInTopico as Mock).mockResolvedValue([]);

    const request = createReorderRequest();
    const response = await PATCH(request);
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Ordem das lições atualizada' });
    expect(lessonService.reorderLessonsInTopico).toHaveBeenCalledWith(
      reorderLessonsMock.topicoId,
      reorderLessonsMock.lessonIds
    );
  });
}); 