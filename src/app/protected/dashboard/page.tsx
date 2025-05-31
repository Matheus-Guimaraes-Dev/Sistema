import { redirect } from 'next/navigation'
import { createClient } from '@/lib/server'

export default async function Dashboard() {

  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return(
    <div>
      <h1> Bem vindo a página de Dashboard </h1>
    </div>
  )
}