"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server-utils";

export async function forgotPassword(formData: FormData) {
    const email = formData.get("email") as string;

    if (!email) {
        return redirect("/login/forgot-password?error=Please enter your email");
    }

    const supabase = await createClient();
    const headerList = await headers();
    const origin = headerList.get("origin");

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
