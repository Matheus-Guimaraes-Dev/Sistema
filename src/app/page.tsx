import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Menu } from '@/components/componentes/menu';
import Image from 'next/image';
import logo from "@/fotos/logo.jpeg"

export default async function Home() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (

    <div className='sm:flex min-h-screen'>

      <Menu />

      <div className="relative w-64 h-40">
        <Image
          src={logo}
          alt="Descrição da imagem"
          fill
          className="object-cover rounded-lg"
        />
      </div>

    </div>

  );
}
