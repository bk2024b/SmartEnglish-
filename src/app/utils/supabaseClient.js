'use client'

import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
    process.env.NECT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export {supabase}