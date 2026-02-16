import { createClient } from "@/utils/supabase/server-utils"; // Adjust import if needed

export async function getUserRole() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    // Check public.profiles first
    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

    return profile?.role ?? "user";
}

export async function getUserProfile() {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

    return profile;
}

export async function checkRole(requiredRole: string) {
    const role = await getUserRole();
    return role === requiredRole;
}
