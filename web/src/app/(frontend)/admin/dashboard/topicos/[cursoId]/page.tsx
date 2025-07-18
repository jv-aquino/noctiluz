"use client";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { fetcher } from "@/utils";
import AdminHeader from "../../components/header/AdminHeader";
import { List } from "lucide-react";

function TopicosCursoPage() {
  const params = useParams();
  const cursoId = params?.cursoId as string;
  const { data: curso, error, isLoading } = useSWR(
    cursoId ? `/api/curso/${cursoId}` : null,
    (url: string) => fetcher(url, "Erro ao buscar curso")
  );

  const Paragraph = () => (
    <>Visualize e organize os tópicos deste curso. Em breve: reordenação e gerenciamento de lições.</>
  );

  return (
    <>
      <AdminHeader Icon={List} Paragraph={Paragraph} title={curso ? `Tópicos de ${curso.name}` : "Tópicos"} />
      {isLoading && <p>Carregando curso...</p>}
      {error && <p>Erro ao carregar curso.</p>}
      {curso && (
        <div className="max-w-2xl mx-auto mt-8">
          <h2 className="text-lg font-semibold mb-4">Tópicos em ordem:</h2>
          {curso.topicos && curso.topicos.length > 0 ? (
            <ol className="list-decimal pl-6 space-y-2">
              {curso.topicos.map((topico: any, idx: number) => (
                <li key={topico.id} className="p-2 border rounded bg-white">
                  <span className="font-medium">{topico.name}</span>
                  <span className="ml-2 text-gray-500">({topico.slug})</span>
                </li>
              ))}
            </ol>
          ) : (
            <p>Nenhum tópico cadastrado para este curso.</p>
          )}
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800">
              Funcionalidades de reordenação e gerenciamento de lições serão implementadas aqui.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

export default TopicosCursoPage; 