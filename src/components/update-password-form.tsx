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
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {

  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {

    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      router.push('/auth/login')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Erro ao alterar')
    } finally {
      setIsLoading(false)
    }

  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>

      <Card>

        <CardHeader>
          <CardTitle className="text-2xl text-center mb-4">Redefinir sua senha</CardTitle>
          <CardDescription>Por favor, digite sua nova senha abaixo.</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">Nova Senha</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                {isLoading ? 'Salvando...' : 'Salvar nova senha'}
              </Button>
            </div>
          </form>
        </CardContent>
        
      </Card>

    </div>
  )
}
