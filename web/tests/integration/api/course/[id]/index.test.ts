import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as courseService from '@/app/(backend)/services/course'
import { GET, DELETE } from '@/app/(backend)/api/courses/[id]/route'
import { NextRequest } from 'next/server';
import { setCurrentRole } from '../../../mocks/auth';
import { postCourseMock } from '../../../mocks/course';

vi.mock('@/backend/services/course', () => ({
  getCourseById: vi.fn(),
  deleteCourse: vi.fn()
}))

const mockRequest = {} as NextRequest;
const realId = postCourseMock.id;
const fakeId = '960bc679-2a96-4795-bed7-aaaaaaaaaaaa';
const courseMock = postCourseMock;

describe('GET /api/cursos/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return course if it exists', async () => {
    (courseService.getCourseById as Mock).mockResolvedValue(courseMock);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(courseMock);
    expect(courseService.getCourseById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found', async () => {
    (courseService.getCourseById as Mock).mockResolvedValue(null);
    const response = await GET(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(courseService.getCourseById).toHaveBeenCalled();
  });
});

describe('DELETE /api/cursos/[id]', () => {
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

  it('should delete curso if it exists and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (courseService.getCourseById as Mock).mockResolvedValue(courseMock);
    (courseService.deleteCourse as Mock).mockResolvedValue(courseMock);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: realId }) });
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(courseMock);
    expect(courseService.getCourseById).toHaveBeenCalled();
  });

  it('should throw 404 if nothing is found and user is ADMIN/SUPER_ADMIN', async () => {
    setCurrentRole('ADMIN');
    (courseService.getCourseById as Mock).mockResolvedValue(null);
    const response = await DELETE(mockRequest, { params: Promise.resolve({ id: fakeId }) });
    expect(response.status).toBe(404);
    expect(courseService.getCourseById).toHaveBeenCalled();
  });
}); 