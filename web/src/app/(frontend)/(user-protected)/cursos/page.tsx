import LandingPagesNav from "@/components/nav/InitialNav";
import { headers } from "next/headers";
import { auth } from "@/auth";
import CursosDestacados from "./CursosDestacados";

async function Cursos() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />

      <CursosDestacados />

      <div className="px-8 xl:px-20 mt-18">
        <h2 className="text-2xl mt-2 text-pink-900 font-semibold">Olímpiadas</h2>
        
      </div>
    </div>
  );
}

export default Cursos;