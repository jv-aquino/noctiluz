import { describe, it, expect, vi, beforeEach, Mock } from 'vitest'
import * as courseService from '@/backend/services/course'
import { GET, POST } from '@/backend/api/courses/route'
import { setCurrentRole } from '../../mocks/auth'
import { createRequest } from '../../mocks/requests'
import { getCoursesMock, postCourseMock } from '../../mocks/course'

vi.mock('@/backend/services/course', () => ({
  getAllCourses: vi.fn(),
  createCourse: vi.fn(),
}))

describe('GET /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null);
  });

  it('should return courses from the service', async () => {
    (courseService.getAllCourses as Mock).mockResolvedValue(getCoursesMock);
    const response = await GET();
    
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(getCoursesMock);
    expect(courseService.getAllCourses).toHaveBeenCalled();
  });
});

describe('POST /api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCurrentRole(null); // Reset auth context
  });

  const createCourseRequest = () => createRequest(postCourseMock, "course")
  const createPayload = {
    name: postCourseMock.name,
    description: postCourseMock.description,
    slug: postCourseMock.slug,
    tags: postCourseMock.tags,
  };

  it('should fail if unauthenticated', async () => {
    setCurrentRole(null);
    const response = await POST(createCourseRequest());
    expect(response?.status).toBe(401);
  });

  it('should fail if user is not ADMIN or SUPER_ADMIN', async () => {
    setCurrentRole('USER');
    const response = await POST(createCourseRequest());
    expect(response?.status).toBe(403);
  });

  it('should succeed if user is ADMIN', async () => {
    setCurrentRole('ADMIN');
    (courseService.createCourse as Mock).mockResolvedValue(postCourseMock);

    const response = await POST(createCourseRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postCourseMock);
  });

  it('should succeed if user is SUPER_ADMIN', async () => {
    setCurrentRole('SUPER_ADMIN');
    (courseService.createCourse as Mock).mockResolvedValue(postCourseMock);

    const response = await POST(createCourseRequest());
    expect(response?.status).toBe(201);
    
    const data = await response?.json();
    expect(data).toEqual(postCourseMock);
  });
}); 