import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as topicoService from '@/backend/services/topic'
import { GET, POST } from '@/backend/api/topics/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { getTopicsMock, postTopicMock } from '../../mocks/topic'

vi.mock('@/backend/services/topic', () => ({
  getAllTopics: vi.fn(),
  createTopic: vi.fn(),
}))

describe('GET /api/topicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return topics from the service', async () => {
    (topicoService.getAllTopics as Mock).mockResolvedValue(getTopicsMock);
    const response = await GET();
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getTopicsMock);
    expect(topicoService.getAllTopics).toHaveBeenCalled();
  });
});

describe('POST /api/topicos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  const createTopicRequest = () => createRequest(postTopicMock, "topic")
  const createPayload = {
    name: postTopicMock.name,
    description: postTopicMock.description,
    slug: postTopicMock.slug,
    archived: postTopicMock.archived,
    subjectId: postTopicMock.subjectId,
  };

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createTopicRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createTopicRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicoService.createTopic as Mock).mockResolvedValue(postTopicMock);
    const response = await POST(createTopicRequest());
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(postTopicMock);
    expect(topicoService.createTopic).toHaveBeenCalledWith(createPayload);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (topicoService.createTopic as Mock).mockResolvedValue(postTopicMock);
    const response = await POST(createTopicRequest());
    expect(response?.status).toBe(201);
    const data = await response?.json();
    expect(data).toEqual(postTopicMock);
    expect(topicoService.createTopic).toHaveBeenCalledWith(createPayload);
  });
}); 