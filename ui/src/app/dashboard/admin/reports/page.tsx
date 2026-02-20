import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/roles";
import AdminReportsClient from "./AdminReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
    const role = await getUserRole();

    if (role !== "admin") {
        redirect("/dashboard");
    }

    return <AdminReportsClient />;
}
