import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { PATCH } from '@/app/(backend)/api/lesson/[id]/conteudo/[pageId]/order/route'
import { setCurrentRole } from '../../../../../../mocks/auth'
import { createRequest } from '../../../../../../mocks/requests'
import * as lessonService from '@/app/(backend)/services/lesson'

vi.mock('@/app/(backend)/services/lesson', () => ({
  reorderContentBlocks: vi.fn(),
}))

describe('PATCH /api/lesson/[id]/conteudo/[pageId]/order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const pageId = "a47ac10b-58cc-4372-a567-0e02b2c3d47a";
  const blockIds = [
    "d47ac10b-58cc-4372-a567-0e02b2c3d47d",
    "e47ac10b-58cc-4372-a567-0e02b2c3d47e",
    "f47ac10b-58cc-4372-a567-0e02b2c3d47f"
  ];
  const createPatchRequest = () => createRequest({ blockIds }, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId, pageId } });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId, pageId } });
    expect(response?.status).toBe(403);
  });

  it('should reorder blocks if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.reorderContentBlocks as Mock).mockResolvedValue(undefined);

    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId, pageId } });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Ordem dos blocos atualizada' });
    expect(lessonService.reorderContentBlocks).toHaveBeenCalledWith(pageId, blockIds);
  });

  it('should fail if blockIds are not provided', async () => {
    setCurrentRole('ADMIN');
    const request = createRequest({ }, 'lesson');
    const response = await PATCH(request, { params: { id: lessonId, pageId } });
    expect(response?.status).toBe(400);
  });
}); 