import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'
import { Menu } from '@/components/componentes/menu';
import Image from 'next/image';
import logo from "@/fotos/logo.png"

export default async function Home() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) { 
    redirect('/auth/login')
  }

  return (

    <div className='sm:flex min-h-screen'>

      <Menu />

      <div className="flex justify-center items-center w-full h-[calc(100vh-64px)]">
        <div className="flex-1 max-w-[600px]">
          <div className="relative w-full h-80">
            <Image
              src={logo}
              alt="Logo"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>

        </div>
      </div>
    </div>

  );
}
