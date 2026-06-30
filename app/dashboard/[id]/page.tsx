// app/dashboard/[id]/page.tsx
// Página de detalle de una tarjeta. Muestra la previsualización y opciones.

'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'
import Link from 'next/link'

interface Card {
  id: string
  name: string
  card_text: string
  text_color: string
  background_url: string | null
  logo_url: string | null
  qr_position: string
  logo_position: string
  destination_url: string
  created_at: string
}

export default function DetalleTarjeta() {
  const params = useParams()
  const router = useRouter()
  const cardId = params.id as string

  const [card, setCard] = useState<Card | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    fetchCard()
  }, [])

  const fetchCard = async () => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (error || !data) {
      router.push('/dashboard')
    } else {
      setCard(data)
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm('¿Seguro que quieres eliminar esta tarjeta?')) return

    setDeleting(true)
    const { error } = await supabase
      .from('cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      router.push('/dashboard')
    }
    setDeleting(false)
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    )
  }

  if (!card) return null

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700 mb-1 block">
              ← Volver al dashboard
            </Link>
            <h1 className="text-2xl font-bold">{card.name}</h1>
          </div>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 text-sm"
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Previsualización */}
          <div className="flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">Previsualización</p>
            <div
              className="w-[300px] h-[194px] md:w-[340px] md:h-[220px] rounded-xl shadow-lg border relative overflow-hidden"
              style={{
                backgroundColor: card.background_url ? 'transparent' : '#ffffff',
                backgroundImage: card.background_url ? `url(${card.background_url})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: card.text_color,
              }}
            >
              {card.background_url && (
                <div className="absolute inset-0 bg-black/20 z-0"></div>
              )}

              {/* Logo en esquina (fuera del QR) */}
              {card.logo_url && card.logo_position && card.logo_position !== 'dentro-qr' && (
                <img
                  src={card.logo_url}
                  alt="Logo"
                  className={`absolute z-20 max-h-8 max-w-[60px] object-contain ${
                    card.logo_position === 'top-left' ? 'top-2 left-2' :
                    card.logo_position === 'top-right' ? 'top-2 right-2' :
                    card.logo_position === 'bottom-left' ? 'bottom-2 left-2' :
                    'bottom-2 right-2'
                  }`}
                />
              )}

              {/* ─── QR CENTRADO ─── */}
              {(card.qr_position || 'center') === 'center' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 px-4">
                  {card.card_text && (
                    <p className="text-center font-medium text-sm">{card.card_text}</p>
                  )}
                  
                  {card.destination_url && (
                    <div className="bg-white p-1 rounded relative inline-block">
                      <QRCodeSVG value={card.destination_url} size={50} />
                      {card.logo_url && card.logo_position === 'dentro-qr' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-0.5 shadow-sm">
                            <img src={card.logo_url} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ─── QR EN ESQUINA ─── */}
              {(card.qr_position || 'center') !== 'center' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center z-10 px-10">
                    {card.card_text && (
                      <p className="text-center font-medium text-sm">{card.card_text}</p>
                    )}
                  </div>

                  <div className={`absolute z-10 ${
                    card.qr_position === 'top-left' ? 'top-2 left-2' :
                    card.qr_position === 'top-right' ? 'top-2 right-2' :
                    card.qr_position === 'bottom-left' ? 'bottom-2 left-2' :
                    'bottom-2 right-2'
                  }`}>
                    {card.destination_url && (
                      <div className="bg-white p-1 rounded relative inline-block">
                        <QRCodeSVG value={card.destination_url} size={50} />
                        {card.logo_url && card.logo_position === 'dentro-qr' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white rounded-full p-0.5 shadow-sm">
                              <img src={card.logo_url} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <h2 className="font-semibold text-lg">Detalles</h2>
              
              <div>
                <label className="text-xs text-gray-500">URL del QR</label>
                <p className="text-sm break-all">{card.destination_url}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Texto</label>
                <p className="text-sm">{card.card_text || 'Sin texto'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Color del texto</label>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-5 h-5 rounded border"
                    style={{ backgroundColor: card.text_color }}
                  ></div>
                  <span className="text-sm">{card.text_color}</span>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-500">Posición QR</label>
                <p className="text-sm capitalize">{card.qr_position || 'center'}</p>
              </div>

              <div>
                <label className="text-xs text-gray-500">Posición logo</label>
                <p className="text-sm capitalize">{card.logo_position || 'dentro-qr'}</p>
              </div>
              
              <div>
                <label className="text-xs text-gray-500">Creada</label>
                <p className="text-sm">
                  {new Date(card.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <button
                onClick={() => router.push(`/dashboard/crear?edit=${card.id}`)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(card.destination_url)
                  alert('URL copiada al portapapeles')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Copiar URL
              </button>
            </div>
          </div>

        </div>
      </div>
    </main>
  )
}