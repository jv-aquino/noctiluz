export const contentPageMock = {
  id: "550e8400-e29b-41d4-a716-446655440100",
  name: "Introdução",
  order: 0,
  archived: false,
  lessonId: "550e8400-e29b-41d4-a716-446655440000",
  contentBlocks: []
};

export const contentBlockMock = {
  id: "550e8400-e29b-41d4-a716-446655440200",
  type: "MARKDOWN" as const,
  order: 0,
  markdown: "# Introdução à Álgebra\n\nBem-vindo ao curso de álgebra!",
  videoUrl: null,
  metadata: null,
  componentType: null,
  componentPath: null,
  componentProps: null,
  exerciseData: null,
  archived: false,
  pageId: "550e8400-e29b-41d4-a716-446655440100"
};

export const createContentPageMock = {
  name: "Nova Página",
  order: 1
};

export const createContentBlockMock = {
  type: "MARKDOWN" as const,
  markdown: "# Novo Conteúdo\n\nDigite seu conteúdo aqui...",
  order: 0
};

export const updateContentBlockMock = {
  markdown: "# Conteúdo Atualizado\n\nEste conteúdo foi atualizado.",
  order: 1
};

export const videoContentBlockMock = {
  id: "550e8400-e29b-41d4-a716-446655440201",
  type: "VIDEO" as const,
  order: 1,
  markdown: null,
  videoUrl: "https://example.com/video.mp4",
  metadata: { duration: 300, title: "Vídeo explicativo" },
  componentType: null,
  componentPath: null,
  componentProps: null,
  exerciseData: null,
  archived: false,
  pageId: "550e8400-e29b-41d4-a716-446655440100"
};

export const exerciseContentBlockMock = {
  id: "550e8400-e29b-41d4-a716-446655440202",
  type: "EXERCISE" as const,
  order: 2,
  markdown: null,
  videoUrl: null,
  metadata: null,
  componentType: null,
  componentPath: null,
  componentProps: null,
  exerciseData: {
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "Qual é o resultado de 2x + 3 = 7?",
        options: ["x = 2", "x = 3", "x = 4", "x = 5"],
        correctAnswer: "x = 2"
      }
    ]
  },
  archived: false,
  pageId: "550e8400-e29b-41d4-a716-446655440100"
}; 