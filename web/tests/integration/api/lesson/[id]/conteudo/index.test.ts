import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET, POST } from '@/backend/api/lesson/[id]/conteudo/route'
import { setCurrentRole } from '../../../../mocks/auth'
import { createRequest } from '../../../../mocks/requests'
import { postLessonMock } from '../../../../mocks/lesson'
import { contentPageMock, createContentPageMock } from '../../../../mocks/conteudo'
import prisma from '@/backend/services/db'

vi.mock('@/backend/services/db', () => ({
  default: {
    conteudoPage: {
      findMany: vi.fn(),
      aggregate: vi.fn(),
      create: vi.fn(),
    },
  },
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /api/lesson/[id]/conteudo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content pages for lesson', async () => {
    const lessonId = postLessonMock.id;
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.conteudoPage.findMany as Mock).mockResolvedValue([contentPageMock]);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([contentPageMock]);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.conteudoPage.findMany).toHaveBeenCalledWith({
      where: { lessonId },
      include: {
        contentBlocks: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { order: 'asc' }
    });
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response.status).toBe(404);
  });

  it('should return empty array if no content pages exist', async () => {
    const lessonId = postLessonMock.id;
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.conteudoPage.findMany as Mock).mockResolvedValue([]);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual([]);
  });
});

describe('POST /api/lesson/[id]/conteudo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const createPostRequest = () => createRequest(createContentPageMock, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPostRequest();
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPostRequest();
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    expect(response?.status).toBe(403);
  });

  it('should create content page if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.conteudoPage.aggregate as Mock).mockResolvedValue({ _max: { order: 0 } });
    (prisma.conteudoPage.create as Mock).mockResolvedValue({
      ...contentPageMock,
      ...createContentPageMock,
      contentBlocks: []
    });

    const request = createPostRequest();
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual({
      ...contentPageMock,
      ...createContentPageMock,
      contentBlocks: []
    });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.conteudoPage.create).toHaveBeenCalledWith({
      data: {
        name: createContentPageMock.name,
        order: 1, // maxOrder + 1
        lessonId: lessonId,
      },
      include: {
        contentBlocks: true
      }
    });
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createPostRequest();
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if name is missing', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);

    const request = createRequest({ order: 1 }, 'lesson');
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(400);
  });

  it('should use provided order if specified', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.conteudoPage.create as Mock).mockResolvedValue({
      ...contentPageMock,
      ...createContentPageMock,
      order: 5,
      contentBlocks: []
    });

    const request = createRequest({ name: "Test Page", order: 5 }, 'lesson');
    const response = await POST(request, { params: Promise.resolve({ id: lessonId }) });
    
    expect(response?.status).toBe(201);
    expect(prisma.conteudoPage.create).toHaveBeenCalledWith({
      data: {
        name: "Test Page",
        order: 5,
        lessonId: lessonId,
      },
      include: {
        contentBlocks: true
      }
    });
  });
}); 