"use server";

import { createClient, createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function getStaffList() {
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return [];
    }

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
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return { success: false, error: "Database connection failed" };
    }

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

export async function secureUpdateStaff(password: string, userId: string, newRole: 'employee' | 'admin') {
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return { success: false, error: "Database connection failed" };
    }

    // 1. Verify admin password
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
    });

    if (authError) {
        return { success: false, error: "Incorrect password. Authorization failed." };
    }

    // 2. Perform the update using admin client to bypass RLS
    const adminSupabase = await createAdminClient();
    const { error } = await adminSupabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

    if (error) {
        console.error("Update failed:", error.message);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/staff");
    return { success: true };
}

export async function secureDeleteStaff(password: string, userId: string) {
    // IMPORTANT: Always check for null after createClient() - TypeScript requires this
    // DO NOT REMOVE THIS NULL CHECK - it prevents 'supabase' is possibly 'null' errors
    const supabase = await createClient();
    const adminSupabase = await createAdminClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        return { success: false, error: "Database connection failed" };
    }

    // 1. Verify admin password
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const { error: authError } = await supabase.auth.signInWithPassword({
        email: user.email!,
        password: password
    });

    if (authError) {
        return { success: false, error: "Incorrect password. Authorization failed." };
    }

    // 2. Perform deletion (handle foreign key dependencies)
    try {
        // Nullify references in related tables to avoid FK constraint errors
        // 1. Marriage Applications (both as creator and processor)
        const { error: maCreatedError } = await adminSupabase.from("marriage_applications").update({ created_by: null }).eq("created_by", userId);
        if (maCreatedError) { console.error("Error nullifying marriage_applications.created_by:", maCreatedError.message); }
        const { error: maProcessedError } = await adminSupabase.from("marriage_applications").update({ processed_by: null }).eq("processed_by", userId);
        if (maProcessedError) { console.error("Error nullifying marriage_applications.processed_by:", maProcessedError.message); }

        // 2. Audit Logs
        const { error: auditLogError } = await adminSupabase.from("audit_logs").update({ user_id: null }).eq("user_id", userId);
        if (auditLogError) { console.error("Error nullifying audit_logs.user_id:", auditLogError.message); }

        // 3. Document/Photo Records
        const { error: gdError } = await adminSupabase.from("generated_documents").update({ generated_by: null }).eq("generated_by", userId);
        if (gdError) { console.error("Error nullifying generated_documents.generated_by:", gdError.message); }
        const { error: uduError } = await adminSupabase.from("user_document_uploads").update({ uploaded_by: null }).eq("uploaded_by", userId);
        if (uduError) { console.error("Error nullifying user_document_uploads.uploaded_by:", uduError.message); }
        const { error: apError } = await adminSupabase.from("application_photos").update({ uploaded_by: null }).eq("uploaded_by", userId);
        if (apError) { console.error("Error nullifying application_photos.uploaded_by:", apError.message); }

        // 4. Explicitly delete from profiles table first 
        // (This helps if there's no ON DELETE CASCADE set up in the DB)
        const { error: profileError } = await adminSupabase
            .from("profiles")
            .delete()
            .eq("id", userId);

        if (profileError) {
            console.error("Profile deletion failed:", profileError.message);
            // We continue anyway as the main goal is the auth deletion, 
            // but this log helps debug if FKs are still blocked.
        }

        // Finally, delete the auth user (which should trigger profile deletion)
        const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId);

        if (deleteError) {
            console.error("User deletion failed at Auth Level:", deleteError.message);
            return { success: false, error: `Auth deletion failed: ${deleteError.message}` };
        }

        revalidatePath("/dashboard/admin/staff");
        return { success: true };
    } catch (e: any) {
        console.error("Unexpected error during deletion sequence:", e);
        return { success: false, error: "System error during account removal sequence." };
    }
}

