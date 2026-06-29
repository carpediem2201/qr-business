// app/login/page.tsx
// Página donde los usuarios inician sesión o se registran con email y contraseña.

'use client' // Esto indica que es un componente de cliente (usa estado, eventos, navegador)

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Login() {
  // useState guarda valores que cambian mientras el usuario interactúa
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // useRouter nos permite redirigir al usuario a otra página
  const router = useRouter()

  // Esta función se ejecuta cuando el usuario hace clic en "Entrar"
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que la página se recargue
    setLoading(true)
    setMessage('')

    // Llamamos a Supabase para iniciar sesión
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Si hay error, lo mostramos
      setMessage(error.message)
    } else {
      // Si todo va bien, redirigimos al dashboard
      router.push('/dashboard')
    }
    setLoading(false)
  }

  // Esta función registra un usuario nuevo
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    // Llamamos a Supabase para crear la cuenta
    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('¡Registro exitoso! Ya puedes iniciar sesión.')
    }
    setLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Iniciar sesión o registrarse</h1>
        
        <form className="space-y-4">
          {/* Campo de email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {/* Campo de contraseña */}
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />

          {/* Mensaje de error o éxito */}
          {message && (
            <p className="text-sm text-red-500">{message}</p>
          )}

          {/* Botones */}
          <div className="flex gap-3">
            <button
              onClick={handleLogin}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? 'Cargando...' : 'Entrar'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Registrarse
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}