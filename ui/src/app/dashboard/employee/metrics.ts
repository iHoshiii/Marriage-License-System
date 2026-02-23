"use server";

import { createAdminClient } from "@/utils/supabase/server-utils";
import { revalidatePath } from "next/cache";

interface ProfileData {
    full_name: string;
}

export interface EmployeeMetrics {
    applicationStats: {
        total: number;
        pending: number;
        processing: number;
        completed: number;
        rejected: number;
    };
    recentActivity: {
        id: string;
        action: string;
        details: Record<string, unknown>;
        created_at: string;
        user_name?: string;
    }[];
}

export async function getEmployeeMetrics(): Promise<EmployeeMetrics> {
    const supabase = await createAdminClient();

    // Fetch Application Breakdown
    const { data: apps, error: appError } = await supabase
        .from("marriage_applications")
        .select("status");

    const appStats = {
        total: apps?.length || 0,
        pending: apps?.filter(a => a.status === 'pending').length || 0,
        processing: apps?.filter(a => a.status === 'processing').length || 0,
        completed: apps?.filter(a => a.status === 'completed' || a.status === 'issued' || a.status === 'approved').length || 0,
        rejected: apps?.filter(a => a.status === 'rejected').length || 0,
    };

    // Recent Audit Logs (only those related to applications employee can see)
    const { data: logs, error: logError } = await supabase
        .from("audit_logs")
        .select("*, profiles!audit_logs_user_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(5);

    return {
        applicationStats: appStats,
        recentActivity: (logs || []).map(log => ({
            id: log.id,
            action: log.action,
            details: log.details,
            created_at: log.created_at,
            user_name: (log.profiles as ProfileData)?.full_name || 'System'
        }))
    };
}