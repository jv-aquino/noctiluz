import { LibraryBig, Plus } from "lucide-react";
import AdminHeader from "../components/header/AdminHeader";

function DashboardPage() {
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
    </>
   );
}

export default DashboardPage;