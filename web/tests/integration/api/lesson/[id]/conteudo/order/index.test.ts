import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { PATCH } from '@/app/(backend)/api/lesson/[id]/conteudo/order/route'
import { setCurrentRole } from '../../../../../mocks/auth'
import { createRequest } from '../../../../../mocks/requests'
import * as lessonService from '@/app/(backend)/services/lesson'

vi.mock('@/app/(backend)/services/lesson', () => ({
  reorderContentPages: vi.fn(),
}))

describe('PATCH /api/lesson/[id]/conteudo/order', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const lessonId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";
  const pageIds = [
    "a47ac10b-58cc-4372-a567-0e02b2c3d47a",
    "b47ac10b-58cc-4372-a567-0e02b2c3d47b",
    "c47ac10b-58cc-4372-a567-0e02b2c3d47c"
  ];
  const createPatchRequest = () => createRequest({ pageIds }, 'lesson');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId } });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId } });
    expect(response?.status).toBe(403);
  });

  it('should reorder pages if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (lessonService.reorderContentPages as Mock).mockResolvedValue(undefined);

    const request = createPatchRequest();
    const response = await PATCH(request, { params: { id: lessonId } });
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Ordem das páginas atualizada' });
    expect(lessonService.reorderContentPages).toHaveBeenCalledWith(lessonId, pageIds);
  });

  it('should fail if pageIds are not provided', async () => {
    setCurrentRole('ADMIN');
    const request = createRequest({ }, 'lesson');
    const response = await PATCH(request, { params: { id: lessonId } });
    expect(response?.status).toBe(400);
  });
}); 