"use client";

import { useState } from "react";
import {
    Shield,
    User as UserIcon,
    Mail,
    IdCard,
    FileCheck,
    AlertCircle,
    Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { updateStaffRole } from "./actions";

interface StaffMember {
    id: string;
    full_name: string;
    email: string;
    role: string;
    employee_id: string;
    processed_applications: number;
    updated_at: string;
}

export function StaffTable({ initialStaff }: { initialStaff: any[] }) {
    const [staff, setStaff] = useState(initialStaff);

    const handleRoleUpdate = async (userId: string, newRole: any) => {
        const result = await updateStaffRole(userId, newRole);
        if (result.success) {
            setStaff(prev => prev.map(s => s.id === userId ? { ...s, role: newRole } : s));
        }
    };

    if (staff.length === 0) {
        return (
            <div className="p-20 text-center">
                <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                    <Users className="h-10 w-10 text-zinc-300" />
                </div>
                <h3 className="text-xl font-black text-zinc-900 uppercase">No Staff Found</h3>
                <p className="text-zinc-500 font-medium max-w-xs mx-auto mt-2">Start by onboarding your first employee to manage applications.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-zinc-100 bg-zinc-50/30">
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Employee</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">ID / Role</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Performance</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                        <th className="p-6 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                    {staff.map((member) => (
                        <tr key={member.id} className="group hover:bg-zinc-50/50 transition-colors">
                            <td className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-black text-lg">
                                        {member.full_name?.substring(0, 1) || 'S'}
                                    </div>
                                    <div>
                                        <p className="font-black text-zinc-900 uppercase tracking-tight">{member.full_name || 'Unnamed Staff'}</p>
                                        <div className="flex items-center gap-1.5 text-zinc-400">
                                            <Mail className="h-3 w-3" />
                                            <span className="text-xs font-medium">{member.email}</span>
                                        </div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <IdCard className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-sm font-bold text-zinc-700">{member.employee_id || 'NOT-ASSIGNED'}</span>
                                    </div>
                                    <Badge className={member.role === 'admin' ? "bg-purple-100 text-purple-700 border-none px-2 py-0 text-[10px] font-black uppercase" : "bg-blue-100 text-blue-700 border-none px-2 py-0 text-[10px] font-black uppercase"}>
                                        {member.role}
                                    </Badge>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                        <FileCheck className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-zinc-900 tabular-nums leading-none">{member.processed_applications}</p>
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Apps Processed</p>
                                    </div>
                                </div>
                            </td>
                            <td className="p-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                                    <span className="text-xs font-black text-zinc-900 uppercase tracking-tight">Online</span>
                                </div>
                            </td>
                            <td className="p-6 text-right">
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => handleRoleUpdate(member.id, member.role === 'admin' ? 'employee' : 'admin')}
                                        title={member.role === 'admin' ? 'Demote to Employee' : 'Promote to Admin'}
                                        className="h-9 w-9 rounded-xl hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-900 transition-all"
                                    >
                                        <Shield className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleRoleUpdate(member.id, 'user')}
                                        title="Revoke Access"
                                        className="h-9 w-9 rounded-xl hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-600 transition-all"
                                    >
                                        <AlertCircle className="h-4 w-4" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


