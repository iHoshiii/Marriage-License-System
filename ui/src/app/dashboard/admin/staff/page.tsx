import { getStaffList } from "./actions";
import { StaffTable } from "./StaffTable";
import { OnboardStaffDialog } from "./OnboardStaffDialog";
import { ShieldCheck, Users, Activity, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function StaffManagementPage() {
    const staff = await getStaffList();

    const stats = [
        {
            label: "Total Staff",
            value: staff.length,
            icon: Users,
            color: "text-blue-600",
            bg: "bg-blue-50"
        },
        {
            label: "Active Now",
            value: staff.filter(s => s.role === 'admin' || s.role === 'employee').length, // Placeholder for real presence
            icon: Activity,
            color: "text-green-600",
            bg: "bg-green-50"
        },
        {
            label: "Admins",
            value: staff.filter(s => s.role === 'admin').length,
            icon: ShieldCheck,
            color: "text-purple-600",
            bg: "bg-purple-50"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase">Staff Management</h1>
                    <p className="text-zinc-500 font-medium">Manage employees, roles, and monitor office activity.</p>
                </div>
                <OnboardStaffDialog>
                    <Button className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-black/10 flex gap-2">
                        <Plus className="h-4 w-4" />
                        Onboard New Staff
                    </Button>
                </OnboardStaffDialog>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <div key={stat.label} className="bg-white p-6 rounded-[2rem] border-none shadow-xl shadow-zinc-200/50 flex items-center gap-6">
                        <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                            <stat.icon className={`h-7 w-7 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stat.label}</p>
                            <p className="text-3xl font-black text-zinc-900">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Staff Table Section */}
            <div className="bg-white rounded-[2.5rem] border-none shadow-2xl shadow-zinc-200/60 overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between">
                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Employee Directory</h2>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-green-700 uppercase tracking-wider">Live Monitoring</span>
                        </div>
                    </div>
                </div>
                <StaffTable initialStaff={staff} />
            </div>
        </div>
    );
}
