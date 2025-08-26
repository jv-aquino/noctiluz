import Noctiluz from '@/components/svgs/noctiluz.svg'
import Link from 'next/link';

function UserDashboardSidebar() {
  return ( 
    <div className="bg-pink-800 text-pink-50 h-full w-60 flex flex-col px-6 py-8">
      <div className="flex gap-4 items-center">
        <Noctiluz className="w-12" />
        <h1 className='font-bold text-xl'>noctiluz</h1>
      </div>

      <nav className='mt-10'>
        <ul className='flex flex-col gap-4'>
          <li><Link href="/aprender">aprender</Link></li>
          <li><Link href="/exercicios">exercícios</Link></li>
          <li><Link href="/missoes">missões</Link></li>
          <li><Link href="/estatisticas">estatísticas</Link></li>
          <li><Link href="/perfil">perfil</Link></li>
          <li><Link href="/logout">logout</Link></li>
        </ul>
      </nav>
    </div>
   );
}

export default UserDashboardSidebar;