import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as subjectService from '@/backend/services/subject'
import { GET, POST } from '@/app/(backend)/api/subjects/route'
import { getSubjectsMock, postSubjectMock } from '../../mocks/subject'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'

vi.mock('@/backend/services/subject', () => ({
  getAllSubjects: vi.fn(),
  createSubject: vi.fn(),
}))

describe('GET /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return subjects from the service', async () => {
    (subjectService.getAllSubjects as Mock).mockResolvedValue(getSubjectsMock);
    const response = await GET();
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getSubjectsMock);
    expect(subjectService.getAllSubjects).toHaveBeenCalled();
  });
});

describe('POST /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null); // Reset auth context
  });

  const createSubjectRequest = () => createRequest(postSubjectMock, "subject")

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createSubjectRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createSubjectRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (subjectService.createSubject as Mock).mockResolvedValue(postSubjectMock);

    const response = await POST(createSubjectRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postSubjectMock);
    expect(subjectService.createSubject).toHaveBeenCalledWith(postSubjectMock);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (subjectService.createSubject as Mock).mockResolvedValue(postSubjectMock);

    const response = await POST(createSubjectRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postSubjectMock);
    expect(subjectService.createSubject).toHaveBeenCalledWith(postSubjectMock);
  });
});