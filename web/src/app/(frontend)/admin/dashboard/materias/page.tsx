'use client'
import type { MateriaWithTopico } from "@/types";
import { LibraryBig, Plus } from "lucide-react";

import useSWR from 'swr'
import AdminHeader from "../components/header/AdminHeader";
import MateriaCard from "./MateriaCard";

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) throw new Error("Erro ao buscar matérias")
    return res.json()
  })

function DashboardPage() {
  const { data: materias, error, isLoading } = useSWR<MateriaWithTopico[]>('/api/materia', fetcher)

  const Paragraph = () => (
    <>
      São as bases/grandes áreas de conhecimento. A edição aqui é mais estética<br/>
      e serve para depois adicionar tópicos cuja origem é essa matéria
    </>
  )

  return ( 
    <>
      <AdminHeader
        Icon={LibraryBig}
        Paragraph={Paragraph}
        title="Matérias"
      >
        <button type="button" className="admin-header-button colorTransition">
          <Plus /> Adicionar Matérias
        </button>
      </AdminHeader>

      <main className="grid gap-4 justify-center grid-cols-[repeat(auto-fit,_minmax(0,_260px))]">
        {isLoading && <p>Carregando matérias...</p>}
        {error && <p>Erro ao carregar matérias.</p>}
        {materias?.map(materia => (
          <MateriaCard key={materia.id} materia={materia} />
        ))}
      </main>
    </>
   );
}

export default DashboardPage;