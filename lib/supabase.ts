// lib/supabase.ts
// Este archivo crea la conexión con Supabase.
// Lo importaremos en cualquier página que necesite base de datos o autenticación.

import { createClient } from '@supabase/supabase-js'

// Leemos las claves del archivo .env.local
// El signo ! le dice a TypeScript: "tranquilo, esto tiene valor seguro"
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Creamos el cliente y lo exportamos para usarlo en toda la aplicación
export const supabase = createClient(supabaseUrl, supabaseAnonKey)