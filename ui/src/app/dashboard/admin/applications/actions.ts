"use server";

import { createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

export async function getAllApplications() {
    const supabase = createAdminClient();

    const { data: apps, error } = await supabase
        .from("marriage_applications")
        .select(`
            *,
            applicants (
                id,
                first_name,
                middle_name,
                last_name,
                suffix,
                type,
                birth_date,
                age,
                citizenship,
                religion,
                father_name,
                mother_name,
                addresses (
                    barangay,
                    municipality,
                    province
                )
            ),
            profiles!created_by (
                full_name
            )
        `)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("CRITICAL: Error fetching all applications:", error.message, error.details, error.hint);
        return [];
    }

    return (apps || []).map(app => {
        const applicants = Array.isArray(app.applicants) ? app.applicants : [];
        const groom = applicants.find((a: any) => a.type === 'groom');
        const bride = applicants.find((a: any) => a.type === 'bride');

        const profileData = (app as any).profiles;
        const profile = Array.isArray(profileData) ? profileData[0] : profileData;

        return {
            ...app,
            groom_name: groom ? `${groom.first_name} ${groom.last_name}` : 'Unknown',
            bride_name: bride ? `${bride.first_name} ${bride.last_name}` : 'Unknown',
            submitted_by: profile?.full_name || 'Anonymous',
            groom: groom || null,
            bride: bride || null,
        };
    });
}

export async function updateApplicationStatus(applicationId: string, newStatus: string) {
    console.log("updateApplicationStatus called with:", { applicationId, newStatus });

    const supabase = createAdminClient();
    console.log("Admin client created");

    const { data, error } = await supabase
        .from("marriage_applications")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", applicationId)
        .select();

    console.log("Update result:", { data, error });

    if (error) {
        console.error("Error updating status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/admin/applications");
    revalidatePath("/dashboard/admin");
    return { success: true };
}
