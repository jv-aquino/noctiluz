import type { Curso, CursoMateriaRelacionada, Materia, Role, Topico } from '@/generated/prisma';

export type AllowedRoutes = { 
  GET?: Role[]
  POST?: Role[]
  PATCH?: Role[]
  DELETE?: Role[]
}

export type MateriaWithTopico = Materia & { topicos: Topico[] };

export type CursoWithMateria = Curso & { materiasRelacionadas?: CursoMateriaRelacionada[] };