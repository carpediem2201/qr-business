// app/page.tsx
// Página de inicio de qr-business. Lo primero que ve cualquier visitante.

import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      
      <h1 className="text-4xl font-bold mb-4">qr-business</h1>
      
      <p className="text-lg text-gray-600 mb-8 max-w-md">
        Tarjetas físicas con QR inteligente para tu negocio.
        Diseña, imprime y conecta con tus clientes.
      </p>
      
      <div className="flex gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          Empezar ahora
        </Link>
        
        <Link
          href="/login"
          className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Iniciar sesión
        </Link>
      </div>
      
    </main>
  )
}