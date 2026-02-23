import { redirect } from "next/navigation";
import { getUserRole } from "@/utils/roles";
import { getEmployeeMetrics } from "./metrics";
import EmployeeDashboardClient from "./EmployeeDashboardClient";

export const dynamic = "force-dynamic";

export default async function EmployeeDashboard() {
    const role = await getUserRole();

    if (role !== "employee") {
        redirect("/dashboard");
    }

    const metrics = await getEmployeeMetrics();

    return <EmployeeDashboardClient metrics={metrics} />;
}
