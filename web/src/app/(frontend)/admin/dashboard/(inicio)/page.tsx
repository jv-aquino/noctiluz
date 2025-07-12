import { ChartPie } from "lucide-react";
import AdminHeader from "../components/header/AdminHeader";

function DashboardPage() {
  const Paragraph = () => (
    <>
      Estatísticas, gráficos e afins relacionados a plataforma Noctiluz
    </>
  )
  return ( 
    <>
      <AdminHeader
        Icon={ChartPie}
        Paragraph={Paragraph}
        title="Visão Geral"
      />
    </>
   );
}

export default DashboardPage;