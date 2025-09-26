import type { Course, CourseSubjectRelation, Subject, UserRole, Topic } from '@/generated/prisma';

export type AllowedRoutes = { 
  GET?: UserRole[]
  POST?: UserRole[]
  PATCH?: UserRole[]
  DELETE?: UserRole[]
}

export type SubjectWithTopic = Subject & { topics: Topic[] };

export type CourseWithSubject = Course & { relatedSubjects?: CourseSubjectRelation[] };