import Link from "next/link";
import NavbarLogo from "../NavbarLogo";
import { UserRound } from "lucide-react";

function LandingPagesNav({ isLogged }: { isLogged: boolean }) {
  return ( 
    <div className="absolute w-full">
      <nav className="w-full h-full py-6 px-8
      flex items-center justify-between sticky top-0 z-20
      border-b border-border bg-pink-950/80 backdrop-blur supports-[backdrop-filter]:bg-pink-950/60">
        <div className="text-pink-500">
          <NavbarLogo isH2 />
        </div>
        <ul className="flex items-center gap-8 text-xl">
          <li>
            <Link href="/cursos" className="font-medium">Cursos</Link>
          </li>
          <li>
            <Link href="/questoes" className="font-medium">Questões</Link>
          </li>
          <li>
            <Link href="/escolas" className="font-medium">Escolas</Link>
          </li>
          {isLogged ? (
            <li className="ml-4">
              <Link href='/aprender' className="button-md border-pink-200 text-pink-50 bg-pink-500 flex items-center gap-2">
                <UserRound /> Aprender
              </Link>
            </li>
          )
          : (
            <>
              <li className="ml-8">
                <Link href='/login' className="button-md ">Entrar</Link>
              </li>
              <li>
                <Link href='/cadastro' className="button-md border-pink-200 text-pink-50 bg-pink-500">Cadastro</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </div>
   );
}

export default LandingPagesNav;