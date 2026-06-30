// app/dashboard/crear/page.tsx
// Creador visual de tarjetas con previsualización en tiempo real.
// Soporta modo crear y modo editar.

'use client'

import { useState, useRef, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { QRCodeSVG } from 'qrcode.react'
import { supabase } from '@/lib/supabase'

// ─── Límites para las imágenes ───
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2 MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const ALLOWED_EXTENSIONS = '.jpg, .jpeg, .png, .webp'

// Componente interno con toda la lógica
function CrearTarjetaContenido() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('edit')
  const [editMode, setEditMode] = useState(false)

  // Estados para los datos de la tarjeta
  const [cardName, setCardName] = useState('')
  const [cardText, setCardText] = useState('')
  const [textColor, setTextColor] = useState('#000000')
  const [qrUrl, setQrUrl] = useState('')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  
  // Estados para las imágenes subidas
  const [bgImage, setBgImage] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  
  // Posición del QR
  const [qrPosition, setQrPosition] = useState('center')
  // Posición del logo
  const [logoPosition, setLogoPosition] = useState('dentro-qr')

  // Refs para los inputs de archivo
  const bgInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // ─── Cargar datos si estamos en modo edición ───
  useEffect(() => {
    if (editId) {
      loadCard(editId)
    }
  }, [editId])

  const loadCard = async (id: string) => {
    const { data, error } = await supabase
      .from('cards')
      .select('*')
      .eq('id', id)
      .single()

    if (!error && data) {
      setCardName(data.name || '')
      setCardText(data.card_text || '')
      setTextColor(data.text_color || '#000000')
      setQrUrl(data.destination_url || '')
      setBackgroundColor('#ffffff')
      setBgImage(data.background_url || null)
      setLogo(data.logo_url || null)
      setQrPosition(data.qr_position || 'center')
      setLogoPosition(data.logo_position || 'dentro-qr')
      setEditMode(true)
    }
  }

  // ─── Valida un archivo de imagen ───
  const validateImageFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return `Formato no permitido. Usa: ${ALLOWED_EXTENSIONS}`
    }
    if (file.size > MAX_FILE_SIZE) {
      return `La imagen no puede superar los 2 MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(1)} MB`
    }
    return null
  }

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }

  const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateImageFile(file)
    if (error) {
      alert(error)
      if (bgInputRef.current) bgInputRef.current.value = ''
      return
    }
    const url = await fileToDataUrl(file)
    setBgImage(url)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const error = validateImageFile(file)
    if (error) {
      alert(error)
      if (logoInputRef.current) logoInputRef.current.value = ''
      return
    }
    const url = await fileToDataUrl(file)
    setLogo(url)
  }

  const getLogoPositionClasses = () => {
    switch (logoPosition) {
      case 'top-left': return 'top-2 left-2'
      case 'top-right': return 'top-2 right-2'
      case 'bottom-left': return 'bottom-2 left-2'
      case 'bottom-right': return 'bottom-2 right-2'
      default: return ''
    }
  }

  const getQrCornerClasses = () => {
    switch (qrPosition) {
      case 'top-left': return 'top-2 left-2'
      case 'top-right': return 'top-2 right-2'
      case 'bottom-left': return 'bottom-2 left-2'
      case 'bottom-right': return 'bottom-2 right-2'
      default: return ''
    }
  }
  
  const handleSave = async () => {
    setErrorMsg('')

    if (!cardName.trim()) {
      setErrorMsg('Pon un nombre a la tarjeta')
      return
    }
    if (!qrUrl.trim()) {
      setErrorMsg('Añade una URL para el QR')
      return
    }

    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setErrorMsg('Debes iniciar sesión para guardar')
      setSaving(false)
      return
    }

    const cardData = {
      user_id: user.id,
      name: cardName.trim(),
      card_text: cardText.trim(),
      text_color: textColor,
      background_url: bgImage,
      logo_url: logo,
      qr_position: qrPosition,
      logo_position: logoPosition,
      destination_url: qrUrl.trim(),
      destination_type: 'link',
    }

    let error = null

    if (editMode && editId) {
      const { error: updateError } = await supabase
        .from('cards')
        .update(cardData)
        .eq('id', editId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('cards')
        .insert(cardData)
      error = insertError
    }

    setSaving(false)

    if (error) {
      setErrorMsg('Error al guardar: ' + error.message)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        
        <h1 className="text-2xl font-bold mb-4 md:mb-6">
          {editMode ? 'Editar tarjeta' : 'Crear nueva tarjeta'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* ─── COLUMNA IZQUIERDA: Controles ─── */}
          <div className="space-y-3">
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input type="text" placeholder="Ej: Tarjeta Cafetería" value={cardName} onChange={(e) => setCardName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Color texto</label>
                <div className="flex gap-2 items-center">
                  <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} className="w-9 h-9 border rounded cursor-pointer" />
                  <span className="text-xs text-gray-500">{textColor}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Texto en la tarjeta</label>
              <input type="text" placeholder="Ej: Escanea y descubre..." value={cardText} onChange={(e) => setCardText(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Imagen de fondo</label>
                <input type="file" accept={ALLOWED_EXTENSIONS} onChange={handleBgUpload} ref={bgInputRef} className="hidden" id="bgInput" />
                <button type="button" onClick={() => document.getElementById('bgInput')?.click()} className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 text-sm">
                  <span className="text-base">🖼️</span> Fondo
                </button>
                {bgImage && (
                  <button onClick={() => { setBgImage(null); if (bgInputRef.current) bgInputRef.current.value = '' }} className="text-xs text-red-500 mt-1">Quitar</button>
                )}
              </div>
              {!bgImage && (
                <div>
                  <label className="block text-sm font-medium mb-1">Color fondo</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-9 h-9 border rounded cursor-pointer" />
                    <span className="text-xs text-gray-500">{backgroundColor}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Logo</label>
                <input type="file" accept={ALLOWED_EXTENSIONS} onChange={handleLogoUpload} ref={logoInputRef} className="hidden" id="logoInput" />
                <button type="button" onClick={() => document.getElementById('logoInput')?.click()} className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 text-gray-600 hover:text-gray-800 flex items-center justify-center gap-1 text-sm">
                  <span className="text-base">📁</span> Logo
                </button>
                {logo && (
                  <button onClick={() => { setLogo(null); if (logoInputRef.current) logoInputRef.current.value = '' }} className="text-xs text-red-500 mt-1">Quitar</button>
                )}
              </div>
              {logo && (
                <div>
                  <label className="block text-sm font-medium mb-1">Posición logo</label>
                  <select value={logoPosition} onChange={(e) => setLogoPosition(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                    <option value="dentro-qr">Dentro del QR</option>
                    <option value="top-left">↖ Arriba izq.</option>
                    <option value="top-right">↗ Arriba der.</option>
                    <option value="bottom-left">↙ Abajo izq.</option>
                    <option value="bottom-right">↘ Abajo der.</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Posición QR</label>
                <select value={qrPosition} onChange={(e) => setQrPosition(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                  <option value="center">Centro</option>
                  <option value="top-left">↖ Arriba izq.</option>
                  <option value="top-right">↗ Arriba der.</option>
                  <option value="bottom-left">↙ Abajo izq.</option>
                  <option value="bottom-right">↘ Abajo der.</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">URL destino</label>
                <input type="url" placeholder="https://..." value={qrUrl} onChange={(e) => setQrUrl(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm" />
              </div>
            </div>

            <p className="text-xs text-gray-400">Formatos: {ALLOWED_EXTENSIONS} · Máx. 2 MB por imagen</p>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-3 py-2">{errorMsg}</div>
            )}

            <button onClick={handleSave} disabled={saving} className="w-full px-4 py-2.5 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium">
              {saving ? 'Guardando...' : editMode ? 'Actualizar tarjeta' : 'Guardar tarjeta'}
            </button>

          </div>

          {/* ─── COLUMNA DERECHA: Previsualización ─── */}
          <div className="flex flex-col items-center justify-start">
            <p className="text-sm text-gray-500 mb-3">Previsualización</p>
            
            <div
              className="w-[300px] h-[194px] md:w-[340px] md:h-[220px] rounded-xl shadow-lg border relative overflow-hidden"
              style={{
                backgroundColor: bgImage ? 'transparent' : backgroundColor,
                backgroundImage: bgImage ? `url(${bgImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: textColor,
              }}
            >
              {bgImage && <div className="absolute inset-0 bg-black/20 z-0"></div>}

              {logo && logoPosition !== 'dentro-qr' && (
                <img src={logo} alt="Logo" className={`absolute z-20 max-h-8 max-w-[60px] md:max-h-10 md:max-w-[80px] object-contain ${getLogoPositionClasses()}`} />
              )}

              {qrPosition === 'center' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 px-4">
                  {cardText ? <p className="text-center font-medium text-sm">{cardText}</p> : <p className="text-center text-gray-400 text-sm">Tu texto aquí</p>}
                  {qrUrl ? (
                    <div className="bg-white p-1 rounded relative inline-block">
                      <QRCodeSVG value={qrUrl} size={50} />
                      {logo && logoPosition === 'dentro-qr' && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white rounded-full p-0.5 shadow-sm">
                            <img src={logo} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white p-1 rounded inline-block">
                      <div className="w-[50px] h-[50px] bg-gray-200 rounded flex items-center justify-center"><span className="text-xs text-gray-400">QR</span></div>
                    </div>
                  )}
                </div>
              )}

              {qrPosition !== 'center' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center z-10 px-10">
                    {cardText ? <p className="text-center font-medium text-sm">{cardText}</p> : <p className="text-center text-gray-400 text-sm">Tu texto aquí</p>}
                  </div>
                  <div className={`absolute z-10 ${getQrCornerClasses()}`}>
                    {qrUrl ? (
                      <div className="bg-white p-1 rounded relative inline-block">
                        <QRCodeSVG value={qrUrl} size={50} />
                        {logo && logoPosition === 'dentro-qr' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-white rounded-full p-0.5 shadow-sm">
                              <img src={logo} alt="Logo" className="w-5 h-5 rounded-full object-cover" />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white p-1 rounded inline-block">
                        <div className="w-[50px] h-[50px] bg-gray-200 rounded flex items-center justify-center"><span className="text-xs text-gray-400">QR</span></div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {cardName && <p className="mt-2 text-sm font-medium text-gray-700">{cardName}</p>}
          </div>

        </div>
      </div>
    </main>
  )
}

// Componente exportado que envuelve con Suspense (necesario por useSearchParams)
export default function CrearTarjeta() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Cargando...</p>
      </main>
    }>
      <CrearTarjetaContenido />
    </Suspense>
  )
}