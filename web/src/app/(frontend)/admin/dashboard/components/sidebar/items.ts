import { 
  ChartColumnIncreasing, 
  LibraryBig,
  GraduationCap, 
  Laptop,
  List,
  BookCopy,
  Building2,
  Users,
  ShieldUser
} from "lucide-react";

const baseUrl = '/admin/dashboard';

export const items = [
  {
    title: "Início",
    url: baseUrl,
    icon: ChartColumnIncreasing,
  },
  {
    marginTop: true,
    title: "Matérias",
    url: `${baseUrl}/materias`,
    icon: LibraryBig,
  },
  {
    title: "Cursos",
    url: `${baseUrl}/cursos`,
    icon: GraduationCap,
  },
  {
    marginTop: true,
    title: "Tópicos",
    url: `${baseUrl}/topicos`,
    icon: List,
  },
  {
    title: "Lições",
    url: `${baseUrl}/licoes`,
    icon: BookCopy,
  },
  {
    title: "Simulações",
    url: `${baseUrl}/simulacoes`,
    icon: Laptop,
  },
  {
    marginTop: true,
    title: "Escolas",
    url: `${baseUrl}/escolas`,
    icon: Building2,
  },
  {
    title: "Usuários",
    url: `${baseUrl}/users`,
    icon: Users,
  },
  {
    title: "Admins",
    url: `${baseUrl}/admins`,
    icon: ShieldUser,
  },
]