import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
// Service import will be mocked
import * as lessonService from '@/backend/services/lesson'
import * as contentService from '@/backend/services/content'
// Route handlers
import { GET, PATCH, DELETE } from '@/backend/api/contents/[pageId]/[blockId]/route'
import { setCurrentRole } from '../../../../mocks/auth'
import { createRequest, returnParams } from '../../../../mocks/requests'
import { postLessonMock } from '../../../../mocks/lesson'
import { contentPageMock, contentBlockMock, updateContentBlockMock } from '../../../../mocks/content'

vi.mock('@/backend/services/content', () => ({
  getContentPage: vi.fn(),
  getContentBlock: vi.fn(),
  updateContentBlock: vi.fn(),
  deleteContentBlock: vi.fn(),
}))

vi.mock('@/backend/services/lesson', () => ({
  getLessonById: vi.fn(),
}))

describe('GET /api/contents/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return content block by id', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    const blockId = contentBlockMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(contentBlockMock);

    const request = createRequest({}, `content/${pageId}/${blockId}?lessonId=${lessonId}`);
    const response = await GET(request, returnParams({ id: lessonId, pageId, blockId }));

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(contentBlockMock);
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(contentService.getContentPage).toHaveBeenCalledWith({ lessonId, pageId });
    expect(contentService.getContentBlock).toHaveBeenCalledWith({ blockId, pageId });
  });

  it('should return 404 if lesson not found', async () => {
    const lessonId = "550e8400-e29b-41d4-a716-446655440999";
    const pageId = contentPageMock.id;
    const blockId = contentBlockMock.id;
    
    (lessonService.getLessonById as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, `conteudo/${pageId}/${blockId}?lessonId=${lessonId}`);
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
    (contentService.getContentPage as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, `conteudo/${pageId}/${blockId}?lessonId=${lessonId}`);
    const response = await GET(request, returnParams({ id: lessonId, pageId, blockId }));
    
    expect(response.status).toBe(404);
  });

  it('should return 404 if block not found', async () => {
    const lessonId = postLessonMock.id;
    const pageId = contentPageMock.id;
    const blockId = "550e8400-e29b-41d4-a716-446655440999";
    
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(null);
    
    const request = createRequest({}, `conteudo/${pageId}/${blockId}?lessonId=${lessonId}`);
    const response = await GET(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response.status).toBe(404);
  });
});

describe('PATCH /api/contents/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const blockId = contentBlockMock.id;
  const createPatchRequest = () => createRequest({ ...updateContentBlockMock, lessonId }, `conteudo/${pageId}/${blockId}`);

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
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(contentBlockMock);
    (contentService.updateContentBlock as Mock).mockResolvedValue({
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
    expect(contentService.getContentBlock).toHaveBeenCalledWith({ blockId, pageId });
    expect(contentService.updateContentBlock).toHaveBeenCalledWith({
      blockId,
      data: {
        markdown: updateContentBlockMock.markdown,
        order: updateContentBlockMock.order,
      }
    });
  });

  it('should fail if page not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(null);

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if block not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(null);

    const request = createPatchRequest();
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if type is invalid', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(contentBlockMock);

    const request = createRequest({ type: "INVALID_TYPE", lessonId }, `conteudo/${pageId}/${blockId}`);
    const response = await PATCH(request, returnParams({ id: lessonId, pageId, blockId }));
    
    expect(response?.status).toBe(400);
  });

  it('should handle partial updates', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(contentBlockMock);
    (contentService.updateContentBlock as Mock).mockResolvedValue({
      ...contentBlockMock,
      markdown: "Updated content only",
    });

    const request = createRequest({ markdown: "Updated content only", lessonId }, `conteudo/${pageId}/${blockId}`);
    const response = await PATCH(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(200);
    expect(contentService.updateContentBlock).toHaveBeenCalledWith({
      blockId,
      data: {
        markdown: "Updated content only",
      }
    });
  });
});

describe('DELETE /api/contents/[pageId]/[blockId]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = postLessonMock.id;
  const pageId = contentPageMock.id;
  const blockId = contentBlockMock.id;
  const createDeleteRequest = () => createRequest({ lessonId }, `conteudo/${pageId}/${blockId}`);

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
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(contentBlockMock);
    (contentService.deleteContentBlock as Mock).mockResolvedValue(contentBlockMock);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Bloco de conteúdo excluído com sucesso' });
    expect(lessonService.getLessonById).toHaveBeenCalledWith(lessonId);
    expect(contentService.getContentPage).toHaveBeenCalledWith({ lessonId, pageId });
    expect(contentService.getContentBlock).toHaveBeenCalledWith({ blockId, pageId });
    expect(contentService.deleteContentBlock).toHaveBeenCalledWith({
      blockId
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
    (contentService.getContentPage as Mock).mockResolvedValue(null);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });

  it('should fail if block not found', async () => {
    setCurrentRole('ADMIN');
    (lessonService.getLessonById as Mock).mockResolvedValue(postLessonMock);
    (contentService.getContentPage as Mock).mockResolvedValue(contentPageMock);
    (contentService.getContentBlock as Mock).mockResolvedValue(null);

    const request = createDeleteRequest();
    const response = await DELETE(request, { 
      params: Promise.resolve({ id: lessonId, pageId, blockId }) 
    });
    
    expect(response?.status).toBe(404);
  });
}); 