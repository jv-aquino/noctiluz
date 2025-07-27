import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET, POST } from '@/backend/api/lesson/[id]/conteudo/[pageId]/route'
import { setCurrentRole } from '../../../../../mocks/auth'
import { createRequest } from '../../../../../mocks/requests'
import { postLessonMock } from '../../../../../mocks/lesson'
import { contentPageMock, contentBlockMock, createContentBlockMock } from '../../../../../mocks/conteudo'
import prisma from '@/backend/services/db'

vi.mock('@/backend/services/db', () => ({
  default: {
    contentPage: {
      findFirst: vi.fn(),
    },
    contentBlock: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /api/lesson/[id]/conteudo/[pageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content blocks for page', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findMany as Mock).mockResolvedValue([contentBlockMock]);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([contentBlockMock]);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.contentPage.findFirst).toHaveBeenCalledWith({
      where: { 
        id: pageId,
        lessonId 
      }
    });
    expect(prisma.contentBlock.findMany).toHaveBeenCalledWith({
      where: { pageId },
      orderBy: { order: 'asc' }
    });
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return 404 if page not found', async () => {
    const lessonId = postLessonMock.id;
    const pageId = "550e8400-e29b-41d4-a716-446655440999";
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return empty array if no content blocks exist', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findMany as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});

describe('POST /api/lesson/[id]/conteudo/[pageId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const createPostRequest = () => createRequest(createContentBlockMock, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    expect(response?.status).toBe(403);
  });

  it('should create content block if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.aggregate as Mock).mockResolvedValue({ _max: { order: 0 } });
    (prisma.contentBlock.create as Mock).mockResolvedValue({
      ...contentBlockMock,
      ...createContentBlockMock,
    });

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual({
      ...contentBlockMock,
      ...createContentBlockMock,
    });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.contentPage.findFirst).toHaveBeenCalledWith({
      where: { 
        id: pageId,
        lessonId 
      }
    });
    expect(prisma.contentBlock.create).toHaveBeenCalledWith({
      data: {
        type: createContentBlockMock.type,
        order: 0, // Using the order from createContentBlockMock
        markdown: createContentBlockMock.markdown,
        videoUrl: null,
        metadata: null,
        componentType: null,
        componentPath: null,
        componentProps: null,
        exerciseData: null,
        pageId,
      }
    });
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if page not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if type is missing', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);

    const request = createRequest({ markdown: "Some content" }, 'lesson');
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(400);
  });

  it('should fail if type is invalid', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);

    const request = createRequest({ type: "INVALID_TYPE" }, 'lesson');
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(400);
  });

  it('should handle video content block', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.aggregate as Mock).mockResolvedValue({ _max: { order: 0 } });
    (prisma.contentBlock.create as Mock).mockResolvedValue({
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

    const request = createRequest(videoBlockData, 'lesson');
    const response = await POST(request, { 
      params: Promise.resolve({ id: lessonId, pageId }) 
    });
    
    expect(response?.status).toBe(201);
    expect(prisma.contentBlock.create).toHaveBeenCalledWith({
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
      }
    });
  });
}); 