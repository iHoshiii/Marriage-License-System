"use server";

import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";

export async function resetPassword(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!password || !confirmPassword) {
        return redirect("/login/reset-password?error=Please fill in all fields");
    }

    if (password !== confirmPassword) {
        return redirect("/login/reset-password?error=Passwords do not match");
    }

    const supabase = await createClient();

    if (!supabase) {
        return redirect("/login/reset-password?error=Server configuration error");
    }

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        return redirect(`/login/reset-password?error=${encodeURIComponent(error.message)}`);
    }

    await supabase.auth.signOut();

    return redirect("/login?message=Password has been successfully reset. You can now sign in with your new password.");
}
