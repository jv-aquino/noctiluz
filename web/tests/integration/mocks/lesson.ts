export const postLessonMock = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  identifier: "LESSON-001",
  name: "Introduction to Algebra",
  description: "Basic concepts of linear algebra",
  type: "GENERAL" as const,
  difficulty: 1.0,
  estimatedDuration: 45,
  knowledgeComponents: ["algebra_basics", "equations"],
  prerequisites: []
};

export const patchLessonMock = {
  name: "Advanced Algebra",
  description: "Advanced concepts of algebra",
  identifier: "LESSON-001",
  difficulty: 2.5,
  estimatedDuration: 60
};

export const addLessonToTopicMock = {
  lessonId: "550e8400-e29b-41d4-a716-446655440000",
  topicId: "550e8400-e29b-41d4-a716-446655440001",
  order: 1
};

export const reorderLessonsMock = {
  topicId: "550e8400-e29b-41d4-a716-446655440001",
  lessonIds: [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440002", 
    "550e8400-e29b-41d4-a716-446655440003"
  ]
}; 