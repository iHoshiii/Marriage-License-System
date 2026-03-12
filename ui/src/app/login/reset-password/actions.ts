"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server-utils";

export async function resetPassword(formData: FormData) {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!password || !confirmPassword) {
        return redirect("/login/reset-password?error=Please fill in all fields");
    }

    if (password !== confirmPassword) {
        return redirect("/login/reset-password?error=Passwords do not match");
    }

    if (password.length < 6) {
        return redirect("/login/reset-password?error=Password must be at least 6 characters");
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

    return redirect("/login?message=Password updated successfully. You can now sign in with your new password.");
}
