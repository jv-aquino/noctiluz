"use client";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils";
import AdminHeader from "../components/header/AdminHeader";
import { List, Pencil } from "lucide-react";
import { useState, useMemo } from "react";
import { Course } from "@/generated/prisma";
import SearchBar from "@/components/table/SearchBar";

function TopicosPage() {
  const router = useRouter();
  const { data: courses, error, isLoading } = useSWR<Course[]>(
    "/api/courses",
    (url: string) => fetcher(url, "Erro ao buscar cursos")
  );
  const [search, setSearch] = useState("");

  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    return courses.filter(course =>
      course.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [courses, search]);

  const handleRowClick = (courseId: string) => {
    router.push(`/admin/dashboard/topics/${courseId}`);
  };

  const Paragraph = () => (
    <>Selecione um curso para visualizar e organizar seus tópicos e lições.</>
  );

  return (
    <>
      <AdminHeader Icon={List} Paragraph={Paragraph} title="Tópicos" />
      {isLoading && <p>Carregando cursos...</p>}
      {error && <p>Erro ao carregar cursos.</p>}
      {courses && (
        <div className="max-w-lg mt-4">
          <h2 className="font-medium mb-2">Selecione o Curso</h2>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Pesquisar Curso"
          />
          <div className="mt-6 border rounded">
            <div className="font-medium px-4 py-2 border-b">Nome do Curso</div>
            {filteredCourses.length === 0 ? (
              <div className="px-4 py-4 text-gray-500">Nenhum curso encontrado.</div>
            ) : (
              <ul>
                {filteredCourses.map((course) => (
                  <li
                    key={course.id}
                    className="px-4 py-2 cursor-pointer flex items-center gap-2 border-b last:border-b-0 transition-colors hover:bg-pink-800/70 hover:underline"
                    onClick={() => handleRowClick(course.id)}
                  >
                    {course.name}

                    <Pencil className="w-5 h-5" />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default TopicosPage; 