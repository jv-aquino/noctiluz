import Noctiluz from '@/components/svgs/noctiluz.svg'

function AdminLogin() {
  return ( 
    <>
      <main className="lg:h-screen flex">
        <div className="w-[55%] h-full flex flex-col gap-8 items-center justify-center">

        </div>

        <div className="bg-pink-950 h-full w-[45%] flex flex-col items-center py-32">
          <div className="text-pink-500 flex gap-4">
            <Noctiluz className="w-[160px]" />
            <h1 className='font-bold text-[64px]'>Painel de Administrador de Conteúdo (apenas funcionários Noctiluz)</h1>
          </div>
        </div>
      </main>
    </>
   );
}

export default AdminLogin;