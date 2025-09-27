import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
interface LessonFilterBarProps {
  search: string;
  onSearch: (search: string) => void;
  selectedType: string;
  onTypeChange: (type: string) => void;
  selectedDifficulty: string;
  onDifficultyChange: (difficulty: string) => void;
}

const lessonTypes = [
  { value: '', label: 'Todos os tipos' },
  { value: 'GENERAL', label: 'Geral' },
  { value: 'EXERCISE', label: 'Exercícios' },
  { value: 'REVIEW', label: 'Revisão' },
  { value: 'SIMULATION', label: 'Simulação' }
];

const difficultyRanges = [
  { value: '', label: 'Todas as dificuldades' },
  { value: '0-1', label: 'Fácil (0-1)' },
  { value: '1-2.5', label: 'Médio (1-2.5)' },
  { value: '2.5-4', label: 'Difícil (2.5-4)' },
  { value: '4-5', label: 'Muito Difícil (4-5)' }
];

export function LessonFilterBar({
  search,
  onSearch,
  selectedType,
  onTypeChange,
  selectedDifficulty,
  onDifficultyChange
}: LessonFilterBarProps) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-4 h-4 text-gray-500" />
        <h3 className="text-sm font-medium">Filtros</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar lições..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <div>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            {lessonTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedDifficulty}
            onChange={(e) => onDifficultyChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
          >
            {difficultyRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              onSearch('');
              onTypeChange('');
              onDifficultyChange('');
            }}
            className="flex-1"
          >
            Limpar
          </Button>
        </div>
      </div>
    </div>
  );
} 