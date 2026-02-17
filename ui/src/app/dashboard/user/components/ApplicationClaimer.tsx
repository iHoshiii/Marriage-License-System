"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export function ApplicationClaimer() {
    useEffect(() => {
        const claimApplication = async () => {
            const code = localStorage.getItem('application_code');
            if (!code) return;

            const supabase = createClient();

            // Check if user is authenticated
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Automated claim: Update marriage_applications to link with authenticated user
            // Only claim if created_by is null (anonymous application)
            const { error } = await supabase
                .from('marriage_applications')
                .update({ created_by: user.id })
                .eq('application_code', code)
                .filter('created_by', 'is', null);

            if (!error) {
                // Clear localStorage after successful claim
                localStorage.removeItem('application_code');
                console.log('Application claimed successfully for user:', user.id);

                // Trigger dashboard re-fetch by reloading the page
                window.location.reload();
            } else {
                console.error('Failed to claim application:', error);
            }
        };

        claimApplication();
    }, []);

    // This component doesn't render anything
    return null;
}
