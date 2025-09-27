import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
import * as contentService from '@/app/(backend)/services/content'
// Route handlers
import { GET, POST } from '@/app/(backend)/api/contents/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { postLessonMock } from '../../mocks/lesson'
import { contentPageMock, createContentPageMock } from '../../mocks/content'

vi.mock('@/backend/services/content', () => ({
  getContentPages: vi.fn(),
  getContentBlocks: vi.fn(),
  createContentPage: vi.fn(),
  createContentBlock: vi.fn(),
  getMaxOrder: vi.fn()
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /conteudo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content pages for lesson', async () => {
    const lessonId = postLessonMock.id;
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPages as Mock).mockResolvedValue([contentPageMock]);

    const request = createRequest({}, `content?lessonId=${lessonId}`);
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([contentPageMock]);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createRequest({}, `content?lessonId=${lessonId}`);
    const response = await GET(request);
    
    expect(response.status).toBe(404);
  });

  it('should return empty array if no content pages exist', async () => {
    const lessonId = postLessonMock.id;
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPages as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, `content?lessonId=${lessonId}`);
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});

describe('POST /conteudo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const createPostRequest = () => createRequest(createContentPageMock, 'content');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPostRequest();
    const response = await POST(request);
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPostRequest();
    const response = await POST(request);
    expect(response?.status).toBe(403);
  });

  it('should create content page if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getMaxOrder as Mock).mockResolvedValue({ _max: { order: 0 } });
    (contentService.createContentPage as Mock).mockResolvedValue({
      ...contentPageMock,
      ...createContentPageMock,
      contentBlocks: []
    });

    const request = createPostRequest();
    const response = await POST(request);
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual({
      ...contentPageMock,
      ...createContentPageMock,
      contentBlocks: []
    });
    expect(lessonService.getLessonById).toHaveBeenCalled();
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request);
    
    expect(response?.status).toBe(404);
  });

  it('should fail if name is missing', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);

    const request = createRequest({ order: 1, lessonId }, 'content');
    const response = await POST(request);
    
    expect(response?.status).toBe(400);
  });

  it('should use provided order if specified', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.createContentPage as Mock).mockResolvedValue({
      ...contentPageMock,
      ...createContentPageMock,
      order: 5,
      contentBlocks: []
    });

    const request = createRequest({ name: "Test Page", order: 5, lessonId }, 'content');
    const response = await POST(request);
    
    expect(response?.status).toBe(201);
  });
}); 