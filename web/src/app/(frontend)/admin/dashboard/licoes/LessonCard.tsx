import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Clock, BarChart3, Tag, BookOpen, MoreVertical } from 'lucide-react';
import { Lesson } from '@/generated/prisma';
import Link from 'next/link';

interface LessonCardProps {
  lesson: Lesson;
  onEdit?: (lesson: Lesson) => void;
  onDelete?: (lessonId: string) => void;
}

const getTypeLabel = (type: 'GERAL' | 'EXERCICIOS' | 'REVISAO' | 'SIMULACAO') => {
  switch (type) {
    case 'GERAL':
      return 'Geral';
    case 'EXERCICIOS':
      return 'Exercícios';
    case 'REVISAO':
      return 'Revisão';
    case 'SIMULACAO':
      return 'Simulação';
    default:
      return type;
  }
};

const getTypeColor = (type: 'GERAL' | 'EXERCICIOS' | 'REVISAO' | 'SIMULACAO') => {
  switch (type) {
    case 'GERAL':
      return 'bg-blue-100 text-blue-800';
    case 'EXERCICIOS':
      return 'bg-green-100 text-green-800';
    case 'REVISAO':
      return 'bg-orange-100 text-orange-800';
    case 'SIMULACAO':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getDifficultyColor = (difficulty: number) => {
  if (difficulty <= 1) return 'text-green-600';
  if (difficulty <= 2.5) return 'text-yellow-600';
  if (difficulty <= 4) return 'text-orange-600';
  return 'text-red-600';
};

export function LessonCard({ lesson, onEdit, onDelete }: LessonCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDelete = async () => {
    if (onDelete && confirm(`Tem certeza que deseja excluir a lição "${lesson.name}"?`)) {
      await onDelete(lesson.id);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow
    flex flex-col justify-between">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold">{lesson.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(lesson.type)}`}>
              {getTypeLabel(lesson.type)}
            </span>
          </div>
          
          {lesson.descricao && (
            <p className="text-gray-600 text-sm mb-3">{lesson.descricao}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMenu(!showMenu)}
            className="h-8 w-8 p-0"
          >
            <span className="sr-only">Abrir menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
              <div className="py-1">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(lesson);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </button>
                )}
                <Link
                  href={`/admin/dashboard/licoes/${lesson.id}/conteudo`}
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Editar Conteúdo
                </Link>
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDelete();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <BarChart3 className="w-4 h-4" />
            <span className={getDifficultyColor(lesson.difficulty)}>
              Dificuldade: {lesson.difficulty}/5
            </span>
          </div>
        
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{lesson.estimatedDuration} min</span>
          </div>
        </div>
        {lesson.knowledgeComponents.length > 0 && (
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Componentes de Conhecimento</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {lesson.knowledgeComponents.map((component, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-pink-100 text-pink-800 rounded-full text-xs"
                >
                  {component}
                </span>
              ))}
            </div>
          </div>
        )}
        {lesson.prerequisites.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium">Pré-requisitos</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {lesson.prerequisites.map((prereq, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 