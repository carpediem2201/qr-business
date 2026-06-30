// app/dashboard/page.tsx
// Panel del usuario. Ve sus tarjetas creadas y puede crear nuevas.

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Definimos la forma de una tarjeta (TypeScript)
interface Card {
  id: string
  name: string
  destination_url: string
  created_at: string
}

export default function Dashboard() {
  // Estado: lista de tarjetas del usuario
  const [cards, setCards] = useState<Card[]>([])
  // Estado: si está cargando
  const [loading, setLoading] = useState(true)
  // Estado: datos del usuario
  const [user, setUser] = useState<any>(null)
  // Para redirigir
  const router = useRouter()

  // useEffect se ejecuta al cargar la página
  useEffect(() => {
    checkUser()
  }, [])

  // Verifica si hay un usuario con sesión iniciada
  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Si no hay usuario, a la página de login
      router.push('/login')
    } else {
      setUser(user)
      fetchCards()
    }
  }

  // Obtiene las tarjetas del usuario desde Supabase
  const fetchCards = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error && data) {
      setCards(data)
    }
    setLoading(false)
  }

  // Cerrar sesión
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  // Mientras carga, mostramos un mensaje
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera: email del usuario y botón de salir */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Mis tarjetas</h1>
          <div className="flex gap-3 items-center">
            <span className="text-sm text-gray-500">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Si no tiene tarjetas, mostrar mensaje y botón para crear */}
        {cards.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">Aún no has creado ninguna tarjeta</p>
            <Link
              href="/dashboard/crear"
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
            >
              Crear mi primera tarjeta
            </Link>
          </div>
        ) : (
          /* Si tiene tarjetas, mostrarlas en lista */
          <div className="grid gap-3">
            {cards.map((card) => (
              <div
                key={card.id}
                onClick={() => router.push(`/dashboard/${card.id}`)}
                className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div>
                  <h2 className="font-semibold">{card.name}</h2>
                  <p className="text-sm text-gray-500 truncate max-w-[300px]">{card.destination_url}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">
                    {new Date(card.created_at).toLocaleDateString('es-ES')}
                  </span>
                  <span className="text-gray-400">→</span>
                </div>
              </div>
            ))}
            
            {/* Botón para crear nueva tarjeta */}
            <Link
              href="/dashboard/crear"
              className="block text-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-500 text-gray-500 hover:text-gray-700 transition-colors"
            >
              + Nueva tarjeta
            </Link>
          </div>
        )}
        
      </div>
    </main>
  )
}