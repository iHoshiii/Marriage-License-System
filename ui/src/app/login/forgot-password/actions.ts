"use server";

import { createClient } from "@/utils/supabase/server-utils";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;
    const origin = (await headers()).get("origin");

    if (!email) {
        return redirect("/login/forgot-password?error=Email is required");
    }

    const supabase = await createClient();

    if (!supabase) {
        return redirect("/login/forgot-password?error=Server configuration error");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${origin}/auth/callback?next=/login/reset-password`,
    });

    if (error) {
        return redirect(`/login/forgot-password?error=${encodeURIComponent(error.message)}`);
    }

    return redirect("/login/forgot-password?message=Password reset link has been sent to your email.");
}
