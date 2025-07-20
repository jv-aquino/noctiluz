import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET, PATCH, DELETE } from '@/backend/api/lesson/[id]/route'
import { setCurrentRole } from '../../../mocks/auth'
import { createRequest } from '../../../mocks/requests'
import { postLessonMock, patchLessonMock } from '../../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
  updateLesson: vi.fn(),
  deleteLesson: vi.fn(),
}))

describe('GET /api/lesson/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return lesson by id', async () => {
    const lessonId = postLessonMock.id;
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(postLessonMock);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/lesson/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const createPatchRequest = () => createRequest(patchLessonMock, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPatchRequest();
    const response = await PATCH(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPatchRequest();
    const response = await PATCH(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(403);
  });

  it('should update lesson if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (lessonService.updateLesson as Mock).mockResolvedValue({ ...postLessonMock, ...patchLessonMock });

    const request = createPatchRequest();
    const response = await PATCH(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ ...postLessonMock, ...patchLessonMock });
    expect(lessonService.updateLesson).toHaveBeenCalledWith(lessonId, patchLessonMock);
  });
});

describe('DELETE /api/lesson/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const createDeleteRequest = () => createRequest({}, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createDeleteRequest();
    const response = await DELETE(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createDeleteRequest();
    const response = await DELETE(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(403);
  });

  it('should delete lesson if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (lessonService.deleteLesson as Mock).mockResolvedValue(postLessonMock);

    const request = createDeleteRequest();
    const response = await DELETE(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual(postLessonMock);
    expect(lessonService.deleteLesson).toHaveBeenCalledWith(lessonId);
  });
}); 