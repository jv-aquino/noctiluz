import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
import * as conteudoService from '@/backend/services/conteudo'
// Route handlers
import { GET, POST } from '@/app/(backend)/api/conteudos/[pageId]/route'
import { setCurrentRole } from '../../../mocks/auth'
import { createRequest } from '../../../mocks/requests'
import { postLessonMock } from '../../../mocks/lesson'
import { contentPageMock, contentBlockMock, createContentBlockMock } from '../../../mocks/conteudo'

vi.mock('@/backend/services/conteudo', () => ({
  getContentPage: vi.fn(),
  getContentBlocks: vi.fn(),
  getMaxOrder: vi.fn(),
  createContentBlock: vi.fn(),
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /api/conteudos/[pageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content blocks for page', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (conteudoService.getContentBlocks as Mock).mockResolvedValue([contentBlockMock]);
    
    const request = createRequest({}, `conteudo/${pageId}?lessonId=${lessonId}`);
    const response = await GET(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([contentBlockMock]);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(conteudoService.getContentPage).toHaveBeenCalledWith({ lessonId, pageId });
    expect(conteudoService.getContentBlocks).toHaveBeenCalledWith({ pageId });
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, `conteudo/${pageId}?lessonId=${lessonId}`);
    const response = await GET(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return 404 if page not found', async () => {
    const lessonId = postLessonMock.id;
    const pageId = "550e8400-e29b-41d4-a716-446655440999";
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, `conteudo/${pageId}?lessonId=${lessonId}`);
    const response = await GET(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return empty array if no content blocks exist', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (conteudoService.getContentBlocks as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, `conteudo/${pageId}?lessonId=${lessonId}`);
    const response = await GET(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});

describe('POST /api/conteudos/[pageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const createPostRequest = () => createRequest({ ...createContentBlockMock, lessonId }, `conteudo/${pageId}`);

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    expect(response?.status).toBe(403);
  });

  it('should create content block if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (conteudoService.getMaxOrder as Mock).mockResolvedValue({ _max: { order: 0 } });
    (conteudoService.createContentBlock as Mock).mockResolvedValue({
      ...contentBlockMock,
      ...createContentBlockMock,
    });

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual({
      ...contentBlockMock,
      ...createContentBlockMock,
    });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(conteudoService.getContentPage).toHaveBeenCalledWith({ lessonId, pageId });
    expect(conteudoService.createContentBlock).toHaveBeenCalledWith({
      data: {
        type: createContentBlockMock.type,
        order: 0, // Using provided order from body
        markdown: createContentBlockMock.markdown,
        videoUrl: null,
        metadata: null,
        componentType: null,
        componentPath: null,
        componentProps: null,
        exerciseData: null,
        pageId,
        archived: false,
      }
    });
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if page not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if type is missing', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);

    const request = createRequest({ markdown: "Some content", lessonId }, `conteudo/${pageId}`);
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(400);
  });

  it('should fail if type is invalid', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);

    const request = createRequest({ type: "INVALID_TYPE", lessonId }, `conteudo/${pageId}`);
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(400);
  });

  it('should handle video content block', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (conteudoService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (conteudoService.getMaxOrder as Mock).mockResolvedValue({ _max: { order: 0 } });
    (conteudoService.createContentBlock as Mock).mockResolvedValue({
      ...contentBlockMock,
      type: "VIDEO",
      videoUrl: "https://example.com/video.mp4",
      markdown: null,
    });

    const videoBlockData = {
      type: "VIDEO" as const,
      videoUrl: "https://example.com/video.mp4",
      metadata: { duration: 300 }
    };

    const request = createRequest({ ...videoBlockData, lessonId }, `conteudo/${pageId}`);
    const response = await POST(request, { 
      params: Promise.resolve({ pageId }) 
    });
    
    expect(response?.status).toBe(201);
    expect(conteudoService.createContentBlock).toHaveBeenCalledWith({
      data: {
        type: "VIDEO",
        order: 1, // Calculated from maxOrder._max.order + 1
        markdown: null,
        videoUrl: "https://example.com/video.mp4",
        metadata: { duration: 300 },
        componentType: null,
        componentPath: null,
        componentProps: null,
        exerciseData: null,
        pageId,
        archived: false,
      }
    });
  });
}); 