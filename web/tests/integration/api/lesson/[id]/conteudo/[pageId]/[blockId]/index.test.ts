import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
// Route handlers
import { GET, PATCH, DELETE } from '@/backend/api/lesson/[id]/conteudo/[pageId]/[blockId]/route'
import { setCurrentRole } from '../../../../../../mocks/auth'
import { createRequest } from '../../../../../../mocks/requests'
import { postLessonMock } from '../../../../../../mocks/lesson'
import { contentPageMock, contentBlockMock, updateContentBlockMock } from '../../../../../../mocks/conteudo'
import prisma from '@/backend/services/db'

vi.mock('@/backend/services/db', () => ({
  default: {
    contentPage: {
      findFirst: vi.fn(),
    },
    contentBlock: {
      findFirst: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /api/lesson/[id]/conteudo/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content block by id', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    const blockId = contentBlockMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(contentBlockMock);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(contentBlockMock);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.contentPage.findFirst).toHaveBeenCalledWith({
      where: { 
        id: pageId,
        lessonId 
      }
    });
    expect(prisma.contentBlock.findFirst).toHaveBeenCalledWith({
      where: { 
        id: blockId,
        pageId 
      }
    });
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    const pageId = contentPageMock.id;
    const blockId = contentBlockMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return 404 if page not found', async () => {
    const lessonId = postLessonMock.id;
    const pageId = "550e8400-e29b-41d4-a716-446655440999";
    const blockId = contentBlockMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response.status).toBe(404);
  });

  it('should return 404 if block not found', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    const blockId = "550e8400-e29b-41d4-a716-446655440999";
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, 'lesson');
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/lesson/[id]/conteudo/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const blockId = contentBlockMock.id;
  const createPatchRequest = () => createRequest(updateContentBlockMock, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    expect(response?.status).toBe(403);
  });

  it('should update content block if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(contentBlockMock);
    (prisma.contentBlock.update as Mock).mockResolvedValue({
      ...contentBlockMock,
      ...updateContentBlockMock,
    });

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({
      ...contentBlockMock,
      ...updateContentBlockMock,
    });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.contentPage.findFirst).toHaveBeenCalledWith({
      where: { 
        id: pageId,
        lessonId 
      }
    });
    expect(prisma.contentBlock.findFirst).toHaveBeenCalledWith({
      where: { 
        id: blockId,
        pageId 
      }
    });
    expect(prisma.contentBlock.update).toHaveBeenCalledWith({
      where: { id: blockId },
      data: {
        markdown: updateContentBlockMock.markdown,
        order: updateContentBlockMock.order,
      }
    });
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if page not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(null);

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if block not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(null);

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if type is invalid', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(contentBlockMock);

    const request = createRequest({ type: "INVALID_TYPE" }, 'lesson');
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(400);
  });

  it('should handle partial updates', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(contentBlockMock);
    (prisma.contentBlock.update as Mock).mockResolvedValue({
      ...contentBlockMock,
      markdown: "Updated content only",
    });

    const request = createRequest({ markdown: "Updated content only" }, 'lesson');
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(200);
    expect(prisma.contentBlock.update).toHaveBeenCalledWith({
      where: { id: blockId },
      data: {
        markdown: "Updated content only",
      }
    });
  });
});

describe('DELETE /api/lesson/[id]/conteudo/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const blockId = contentBlockMock.id;
  const createDeleteRequest = () => createRequest({}, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    expect(response?.status).toBe(403);
  });

  it('should delete content block if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(contentBlockMock);
    (prisma.contentBlock.delete as Mock).mockResolvedValue(contentBlockMock);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Bloco de conteúdo excluído com sucesso' });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(prisma.contentPage.findFirst).toHaveBeenCalledWith({
      where: { 
        id: pageId,
        lessonId 
      }
    });
    expect(prisma.contentBlock.findFirst).toHaveBeenCalledWith({
      where: { 
        id: blockId,
        pageId 
      }
    });
    expect(prisma.contentBlock.delete).toHaveBeenCalledWith({
      where: { id: blockId }
    });
  });

  it('should fail if lesson not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(null);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if page not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(null);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if block not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (prisma.contentPage.findFirst as Mock).mockResolvedValue(contentPageMock);
    (prisma.contentBlock.findFirst as Mock).mockResolvedValue(null);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });
}); 