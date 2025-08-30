import { BrainCog, Dumbbell, Star } from "lucide-react";
import UserDashboardSidebar from "../UserDashboardSidebar";
import Link from "next/link";

function Aprender() {
  return (
    <div className="flex h-screen bg-pink-50">
      <UserDashboardSidebar />

      <div className="flex w-full">
        <div className="w-[70%] py-14 flex flex-col items-center h-full">
          <div className="flex flex-col items-center justify-self-start">
            <h1 className="text-2xl font-semibold">1. Fundamentos de Astronomia Observacional</h1>
          </div>
          <div className="flex mt-60 justify-self-center items-center justify-center gap-2">
            <Link
              href={'/aprender/oba/96b073f1-c8c5-41fd-a756-145d7c7c2006'}
              className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <Star className="w-12 h-12" />
            </Link>
            <div className="h-1 w-10 border-t-4 border-dotted border-slate-500"></div>
            <div className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <Star className="w-12 h-12" />
            </div>
            <div className="h-1 w-10 border-t-4 border-dotted border-slate-500"></div>
            <div className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <Star className="w-12 h-12" />
            </div>
            <div className="h-1 w-10 border-t-4 border-dotted border-slate-500"></div>
            <div className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <Star className="w-12 h-12" />
            </div>
            <div className="h-1 w-10 border-t-4 border-dotted border-slate-500"></div>
            <div className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <Dumbbell className="w-12 h-12" />
            </div>
            <div className="h-1 w-10 border-t-4 border-dotted border-slate-500"></div>
            <div className="rounded-full bg-pink-900 text-pink-50 w-18 h-18 flex items-center justify-center">
              <BrainCog className="w-12 h-12" />
            </div>
          </div>
        </div>
        <div className="border-l border-pink-300 w-[30%] h-full py-8 px-6 
        flex flex-col justify-center items-center gap-8">
          <div>
            <h3 className="text-lg font-semibold text-pink-900 mb-2">Progresso</h3>
            <p className="text-pink-300">--%</p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-pink-900 mb-2">Competências</h3>
            <p className="text-pink-300">Em breve...</p>
          </div>

          <button className="button-md">Revisão</button>
        </div>
      </div>
    </div>
  );
}

export default Aprender;