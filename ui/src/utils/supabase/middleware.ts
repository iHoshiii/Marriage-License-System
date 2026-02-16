import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
    // console.log("Middleware running for:", request.nextUrl.pathname);

    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
        // console.error("Middleware Auth Error:", userError.message);
    }

    // --- Role-Based Routing & Protection ---

    // 1. Redirect unauthenticated users trying to access protected routes
    //    (Any route starting with /dashboard or /admin)
    if (!user && (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/admin"))) {
        // console.log("Middleware: Redirecting unauthenticated user to login");
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Redirect authenticated users away from auth pages
    if (user && (request.nextUrl.pathname.startsWith("/login") || request.nextUrl.pathname === "/")) {
        // console.log("Middleware: Redirecting authenticated user to dashboard");
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 3. Role verification (only if user exists)
    if (user) {
        // If accessing admin routes, check for admin role
        if (request.nextUrl.pathname.startsWith("/admin")) {
            // console.log("Middleware: Checking admin role for user", user.id);
            // We fetch role from profiles table
            const { data: profile, error: roleError } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (roleError) {
                // console.error("Middleware Role Check Error:", roleError.message);
            }

            const role = profile?.role ?? "user";

            if (role !== "admin") {
                // Redirect non-admins to dashboard
                // console.log("Middleware: User is not admin, redirecting to dashboard");
                return NextResponse.redirect(new URL("/dashboard", request.url));
            }
        }
    }

    return response;
}
