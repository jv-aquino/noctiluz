import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as topicService from '@/backend/services/topic'
import { GET, DELETE } from '@/app/(backend)/api/topics/[id]/route'
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';
import { postTopicMock } from '../../../mocks/topic';

vi.mock('@/backend/services/topic', () => ({
  getTopicById: vi.fn(),
  deleteTopic: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realId = postTopicMock.id;
const fakeId = 'a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa';
const topicMock = postTopicMock;

describe('GET /api/topicos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return topic if it exists', async () => {
    (topicService.getTopicById as Mock).mockResolvedValue(topicMock);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(topicMock);
    expect(topicService.getTopicById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (topicService.getTopicById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(topicService.getTopicById).toHaveBeenCalled();
  });
});

describe('DELETE /api/topicos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response?.status).toBe(403);
  });

  it('should delete topic if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicService.getTopicById as Mock).mockResolvedValue(topicMock);
    (topicService.deleteTopic as Mock).mockResolvedValue(topicMock);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(topicMock);
    expect(topicService.getTopicById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (topicService.getTopicById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(topicService.getTopicById).toHaveBeenCalled();
  });
}); 