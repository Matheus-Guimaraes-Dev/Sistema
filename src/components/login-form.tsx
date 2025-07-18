'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useUser } from "@/contexts/UserContext";

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { setGrupo, setId } = useUser();

  const handleLogin = async (e: React.FormEvent) => {

    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data: dadosUsuario } = await supabase
        .from("usuarios")
        .select("grupo, id_consultor")
        .eq("id", data.user?.id)
        .single();

      if (!dadosUsuario) {
        console.log("")
      } else {
        setGrupo(dadosUsuario.grupo);
        setId(dadosUsuario.id_consultor || null);
      }

      if (error) throw error
      router.push('/')
    } catch (error: unknown) {
      setError(error instanceof Error ? "Credenciais de login inválidas" : 'An error occurred')
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>

      <Card>

        <CardHeader>
          <CardTitle className="text-3xl text-center mb-4"> ENTRAR </CardTitle>
          <CardDescription>Digite seu e-mail abaixo para acessar sua conta </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Senha</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Esqueceu sua senha?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? 'ACESSANDO...' : 'ACESSAR'}
              </Button>
            </div>

          </form>
        </CardContent>
        
      </Card>
      
    </div>
  )
}
