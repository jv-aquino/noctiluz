import LandingPagesNav from "@/components/nav/InitialNav";
import { headers } from "next/headers";
import { auth } from "@/auth";

async function Cursos() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  
  const isLogged = !!session?.user;

  return (
    <div className="min-h-screen">
      <LandingPagesNav isLogged={isLogged} />

      <h1 className="text-5xl mt-2 text-pink-900 font-semibold text-center">Cursos</h1>
    </div>
  );
}

export default Cursos;