import { createAdminClient } from "./src/utils/supabase/server-utils";

async function test() {
    console.log("Starting DB test...");
    try {
        const supabase = createAdminClient();
        console.log("Admin client created.");

        // 1. Check total count
        const { count, error: countError } = await supabase
            .from("marriage_applications")
            .select("*", { count: "exact", head: true });

        if (countError) {
            console.error("Count Error:", countError);
        } else {
            console.log("Total applications in DB:", count);
        }

        // 2. Fetch applications with profiles (EXACT QUERY from actions.ts)
        const { data: apps, error } = await supabase
            .from("marriage_applications")
            .select(`
                *,
                submitter:profiles!created_by(full_name),
                processor:profiles!processed_by(full_name),
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
                )
            `)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Fetch Error with Joins:", error);
        } else {
            console.log("Fetched apps count:", apps?.length);
            if (apps && apps.length > 0) {
                console.log("Sample app structure:", JSON.stringify(apps[0], null, 2));
            }
        }

        // 3. Check profiles table
        const { count: profileCount, error: profileError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true });

        console.log("Total profiles in DB:", profileCount);
        if (profileError) console.error("Profile Error:", profileError);

    } catch (e) {
        console.error("Unexpected Error:", e);
    }
}

test();
