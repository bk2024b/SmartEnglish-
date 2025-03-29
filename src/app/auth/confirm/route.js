import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const token_hash = searchParams.get("token_hash");
        const next = searchParams.get("next");
        const type = searchParams.get("type");
        const cookieStore = cookies();

        // ✅ Vérification des paramètres requis
        if (!token_hash || !type) {
            return NextResponse.json(
                { error: "Missing token or type" },
                { status: 400 }
            );
        }

        // ✅ Création du client Supabase
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                cookies: {
                    get(name) {
                        return cookieStore.get(name)?.value;
                    },
                    set(name, value, options) {
                        cookieStore.set({ name, value, ...options });
                    },
                    remove(name, options) {
                        cookieStore.set({ name, value: "", ...options });
                    },
                },
            }
        );

        // ✅ Vérification du token OTP
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        });

        if (error) {
            console.error("OTP Verification Error:", error);
            return NextResponse.json(
                { error: "Invalid or expired token" },
                { status: 401 }
            );
        }

        // ✅ Si "next" est vide ou absent, redirige vers "/dashboard"
        const redirectUrl = next && next.trim() !== "" ? next : "/dashboard";

        // ✅ Construction de l'URL absolue
        const absoluteRedirectUrl = new URL(redirectUrl, request.nextUrl.origin);

        // ✅ Redirection après succès
        return NextResponse.redirect(absoluteRedirectUrl);

    } catch (err) {
        console.error("Server Error in /auth/confirm:", err);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
