import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET, POST } from '@/app/(backend)/api/lessons/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { postLessonMock } from '../../mocks/lesson'

vi.mock('@/backend/services/lesson', () => ({
  getAllLessons: vi.fn(),
  createLesson: vi.fn(),
}))

describe('GET /api/lessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return lessons from the service', async () => {
    const lessonsMock = [postLessonMock];
    (lessonService.getAllLessons as Mock).mockResolvedValue(lessonsMock);
    const response = await GET();
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(lessonsMock);
    expect(lessonService.getAllLessons).toHaveBeenCalled();
  });
});

describe('POST /api/lessons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createLessonRequest = () => createRequest(postLessonMock, "lesson")

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createLessonRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createLessonRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.createLesson as Mock).mockResolvedValue(postLessonMock);

    const response = await POST(createLessonRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postLessonMock);
    expect(lessonService.createLesson).toHaveBeenCalled();
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (lessonService.createLesson as Mock).mockResolvedValue(postLessonMock);

    const response = await POST(createLessonRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postLessonMock);
    expect(lessonService.createLesson).toHaveBeenCalled();
  });
}); 