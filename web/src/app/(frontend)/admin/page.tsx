'use client'
import CredentialsLoginForm from '@/components/form/CredentialsLoginForm';
import Noctiluz from '@/components/svgs/noctiluz.svg'
import { useState, useEffect } from 'react';

function AdminLogin() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    setLoading(false);
  }, []);

  return ( 
    <>
      <main className="lg:h-screen flex">
        <div className="w-[55%] h-full flex flex-col gap-8 items-center justify-center">
          <h2 className='text-[40px] font-bold'>Entre na sua conta</h2>
          <div className="w-[360px]">
            <CredentialsLoginForm
              callbackUrl="/admin/dashboard"
              loading={loading} setLoading={setLoading}  
              email={email} setEmail={setEmail} 
              password={password} setPassword={setPassword} 
            />
          </div>
        </div>

        <div className="bg-pink-950 h-full w-[45%] flex flex-col items-center justify-center">
          <div className="text-pink-300 flex flex-col gap-4 w-fit">
            <Noctiluz className="w-[160px] mx-auto" />
            <h1 className='font-bold text-xl text-center'>Painel de Administrador de Conteúdo<br/> (apenas funcionários Noctiluz)</h1>
          </div>
        </div>
      </main>
    </>
   );
}

export default AdminLogin;