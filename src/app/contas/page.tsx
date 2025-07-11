import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Menu } from '@/components/componentes/menu';
import LancamentosContas from './lancamentos';

export default async function Home() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (

    <div className='sm:flex min-h-screen'>

      <Menu />

      <LancamentosContas />

    </div>

  );
}
