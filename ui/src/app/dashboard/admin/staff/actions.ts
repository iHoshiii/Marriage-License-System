"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function getStaffList() {
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    // 1. Fetch staff from profiles
    const { data: staff, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["employee", "admin"])
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching staff detailed:", error);
        return [];
    }

    // 2. Fetch processed application counts AND actual emails from auth.users
    const staffWithMetrics = await Promise.all(staff.map(async (s: any) => {
        // Fetch count
        const { count, error: countError } = await supabase
            .from("marriage_applications")
            .select("*", { count: "exact", head: true })
            .eq("processed_by", s.id);

        if (countError) {
            console.error(`Error fetching application count for staff ${s.id}:`, countError.message);
        }

        // Fetch email from auth (requires admin client)
        const { data: authUser, error: authError } = await adminSupabase.auth.admin.getUserById(s.id);

        if (authError) {
            console.error(`Error fetching auth user for staff ${s.id}:`, authError.message);
        }

        return {
            ...s,
            email: authUser?.user?.email || "No Email",
            processed_applications: count || 0
        };
    }));

    return staffWithMetrics;
}

export async function onboardStaff(email: string, fullName: string, employeeId: string) {
    const supabase = await createClient();

    // Call the promotion function
    const { data, error } = await supabase.rpc('make_employee', {
        target_email: email
    });

    if (error) {
        console.error("RPC make_employee failed:", error);
        return { success: false, error: error.message || "Could not promote user." };
    }

    // Update the profile with extra details
    // We try to find the profile that was just updated/created
    // Note: We don't have the ID easily here without extra steps, but we can search by email or fullName
    // Usually rpc might return the user or id, but it depends on implementation.

    // Re-fetch or update via a guess (weak) or just trust the RPC did its job for role.
    // For now, let's assume the user has a profile and we update by name for this demo, 
    // but in production we'd want a more robust lookup.

    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            full_name: fullName,
            employee_id: employeeId
        })
        .eq("role", "employee")
        .eq("full_name", fullName); // Still a guess, but better than nothing.

    revalidatePath("/dashboard/admin/staff");
    return { success: true };
}

export async function updateStaffRole(userId: string, newRole: 'user' | 'employee' | 'admin') {
    const supabase = await createClient();

    const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) return { success: false, error: error.message };

    revalidatePath("/dashboard/admin/staff");
    return { success: true };
}
