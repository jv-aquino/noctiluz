import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import { PATCH } from '@/backend/api/conteudo/order/route'
import { setCurrentRole } from '../../../mocks/auth'
import { createRequest } from '../../../mocks/requests'
import * as conteudoService from '@/backend/services/conteudo'

vi.mock('@/backend/services/conteudo', () => ({
  reorderContentPages: vi.fn(),
}))

describe('PATCH /api/conteudo/order', () => {
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
  const createPatchRequest = () => createRequest({ lessonId, pageIds }, 'conteudo/order');

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const request = createPatchRequest();
    const response = await PATCH(request);
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const request = createPatchRequest();
    const response = await PATCH(request);
    expect(response?.status).toBe(403);
  });

  it('should reorder pages if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (conteudoService.reorderContentPages as Mock).mockResolvedValue(undefined);

    const request = createPatchRequest();
    const response = await PATCH(request);
    
    expect(response?.status).toBe(200);
    const data = await response?.json();
    expect(data).toEqual({ message: 'Ordem das páginas atualizada' });
    expect(conteudoService.reorderContentPages).toHaveBeenCalledWith(lessonId, pageIds);
  });

  it('should fail if pageIds are not provided', async () => {
    setCurrentRole('ADMIN');
    const request = createRequest({ lessonId }, 'conteudo/order');
    const response = await PATCH(request);
    expect(response?.status).toBe(400);
  });
}); 