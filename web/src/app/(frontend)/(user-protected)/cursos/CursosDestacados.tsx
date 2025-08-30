import Link from "next/link";
import CarouselExample from "../../(landing-pages)/CarouselExample";

function CursosDestacados() {
  return ( 
    <div className="px-8 xl:px-12 mt-2 flex items-center justify-center gap-10 xl:gap-16">
      <CarouselExample />

      <div className="mt-4 max-w-[40%] bg-white p-4 rounded-lg shadow">
        <h2 className="text-2xl mt-2 text-pink-900 font-semibold">OBA</h2>
        <p className="text-slate-600">curso em destaque</p>

        <p className="text-sm text-slate-900 mt-4">A Olimpíada Brasileira de Astronomia e Astronáutica é um evento nacional realizado nas escolas brasileiras previamente cadastradas desde 1998 pela Sociedade Astronômica Brasileira.</p>
        <Link href="/oba" className="button-md block w-fit mt-4 bg-pink-500 hover:text-pink-50 colorTransition">
          Aprender
        </Link>
      </div>
    </div>
   );
}

export default CursosDestacados;