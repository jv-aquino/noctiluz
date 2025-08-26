import Noctiluz from '@/components/svgs/noctiluz.svg'

function UserDashboardSidebar() {
  return ( 
    <div className="bg-pink-800 text-pink-50 h-full w-60 flex flex-col px-6 py-8">
      <div className="flex gap-4 items-center">
        <Noctiluz className="w-12" />
        <h1 className='font-bold text-xl'>noctiluz</h1>
      </div>

      <nav className='mt-10'>
        <ul className='flex flex-col gap-4'>
          <li><a href="/aprender">aprender</a></li>
          <li><a href="/exercicios">exercícios</a></li>
          <li><a href="/missoes">missões</a></li>
          <li><a href="/estatisticas">estatísticas</a></li>
          <li><a href="/perfil">perfil</a></li>
          <li><a href="/logout">logout</a></li>
        </ul>
      </nav>
    </div>
   );
}

export default UserDashboardSidebar;