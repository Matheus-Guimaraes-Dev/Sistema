import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Menu } from './componentes/menu';

export default async function Home() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (

    <div className='flex'>

      <Menu />

      <h1> Teste </h1>

    </div>

  );
}
