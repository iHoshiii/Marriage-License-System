"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
    FileText, Search, Calendar, User, Clock,
    CheckCircle2, XCircle, Eye, X, MoreHorizontal,
    Loader2
} from "lucide-react";
import { updateApplicationStatus } from "./actions";

const STATUS_CONFIG: Record<string, { color: string; icon: any; bg: string; border: string; dot: string }> = {
    pending: { color: "text-amber-700", icon: Clock, bg: "bg-amber-50", border: "border-amber-200", dot: "bg-amber-400" },
    approved: { color: "text-emerald-700", icon: CheckCircle2, bg: "bg-emerald-50", border: "border-emerald-200", dot: "bg-emerald-400" },
    completed: { color: "text-blue-700", icon: CheckCircle2, bg: "bg-blue-50", border: "border-blue-200", dot: "bg-blue-400" },
    rejected: { color: "text-red-700", icon: XCircle, bg: "bg-red-50", border: "border-red-200", dot: "bg-red-400" },
};

const STATUS_ACTIONS = [
    { value: "pending", label: "Set as Pending", dot: "bg-amber-400", hover: "hover:bg-amber-50" },
    { value: "approved", label: "Set as Approved", dot: "bg-emerald-400", hover: "hover:bg-emerald-50" },
    { value: "completed", label: "Set as Completed", dot: "bg-blue-400", hover: "hover:bg-blue-50" },
    { value: "rejected", label: "Set as Rejected", dot: "bg-red-400", hover: "hover:bg-red-50" },
];

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
            <p className="text-sm font-semibold text-zinc-900">{value ?? <span className="italic text-zinc-300">N/A</span>}</p>
        </div>
    );
}

// ── Per-row action buttons: Eye + Horizontal-dots status dropdown ────────────
function ActionDropdown({
    app,
    onView,
    onStatusChange,
    isUpdating,
}: {
    app: any;
    onView: () => void;
    onStatusChange: (id: string, status: string) => void;
    isUpdating: boolean;
}) {
    const [open, setOpen] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const btnRef = useRef<HTMLButtonElement>(null);

    const openDropdown = useCallback(() => {
        if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                left: rect.right - 208, // 208 = w-52 in px
            });
        }
        setOpen(true);
    }, []);

    useEffect(() => {
        if (!open) return;
        function handle(e: MouseEvent) {
            setOpen(false);
        }
        // Small delay so the open click doesn't immediately close
        const t = setTimeout(() => document.addEventListener("mousedown", handle), 10);
        return () => { clearTimeout(t); document.removeEventListener("mousedown", handle); };
    }, [open]);

    return (
        <div className="flex items-center gap-2 justify-center">
            {/* Eye — View Details */}
            <button
                title="View Details"
                onClick={onView}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
            >
                <Eye className="h-4 w-4" />
            </button>

            {/* Horizontal dots — Status dropdown (fixed positioned to escape overflow) */}
            <button
                ref={btnRef}
                title="Change Status"
                onClick={openDropdown}
                className="h-9 w-9 rounded-xl bg-zinc-100 hover:bg-zinc-900 hover:text-white text-zinc-500 flex items-center justify-center transition-all duration-200 shadow-sm active:scale-90"
            >
                {isUpdating
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <MoreHorizontal className="h-4 w-4" />
                }
            </button>

            {open && (
                <div
                    style={{ top: dropdownPos.top, left: dropdownPos.left }}
                    className="fixed z-[200] w-52 bg-white rounded-2xl border border-zinc-100 shadow-2xl shadow-zinc-300/40 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseDown={e => e.stopPropagation()}
                >
                    <div className="px-4 pt-3 pb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Set Status</p>
                    </div>
                    {STATUS_ACTIONS.map(({ value, label, dot, hover }) => (
                        <button
                            key={value}
                            disabled={app.status === value}
                            onClick={() => { onStatusChange(app.id, value); setOpen(false); }}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${hover}`}
                        >
                            <div className={`h-2 w-2 rounded-full shrink-0 ${dot}`} />
                            {label}
                            {app.status === value && (
                                <span className="ml-auto text-[9px] font-black uppercase tracking-widest text-zinc-400">Current</span>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function GlobalOversightClient({ apps: initialApps }: { apps: any[] }) {
    const [apps, setApps] = useState<any[]>(initialApps);
    const [selectedApp, setSelectedApp] = useState<any | null>(null);
    const [search, setSearch] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    async function handleStatusChange(appId: string, newStatus: string) {
        setUpdatingId(appId);
        try {
            const result = await updateApplicationStatus(appId, newStatus);
            if (result.success) {
                setApps(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
                if (selectedApp?.id === appId) setSelectedApp((prev: any) => ({ ...prev, status: newStatus }));
            } else {
                console.error("Failed to update status:", result.error);
                alert(`Failed to update status: ${result.error}`);
            }
        } catch (error) {
            console.error("Error updating status:", error);
            alert("An error occurred while updating the status");
        }
        setUpdatingId(null);
    }

    const filtered = apps.filter(app => {
        const q = search.toLowerCase();
        return (
            app.application_code?.toLowerCase().includes(q) ||
            app.groom_name?.toLowerCase().includes(q) ||
            app.bride_name?.toLowerCase().includes(q) ||
            app.submitted_by?.toLowerCase().includes(q)
        );
    });

    return (
        <>
            {/* ── Header ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-zinc-900 tracking-tighter uppercase leading-none">Global Oversight</h1>
                    <p className="text-zinc-500 font-medium mt-2">Monitoring all marriage license applications across the municipality.</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by Code or Name..."
                        className="h-12 w-[300px] bg-white border border-zinc-100 rounded-2xl pl-12 pr-4 text-sm font-bold placeholder:text-zinc-400 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all shadow-xl shadow-zinc-200/20"
                    />
                </div>
            </div>

            {/* ── Table ── */}
            <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-2xl shadow-zinc-200/50 overflow-hidden">
                <div className="p-8 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/30">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Master Directory</h2>
                    </div>
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{filtered.length} records</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse table-auto min-w-[900px]">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50/10">
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Info</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Citizen Pairing</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Current Status</th>
                                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Submitted By</th>
                                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-zinc-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                            <Search className="h-10 w-10 text-zinc-200" />
                                        </div>
                                        <p className="text-zinc-500 font-black uppercase tracking-widest text-[10px]">No records found</p>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((app) => {
                                    const config = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;
                                    const StatusIcon = config.icon;

                                    return (
                                        <tr key={app.id} className="group hover:bg-zinc-50/40 transition-all duration-200">
                                            {/* Application Info */}
                                            <td className="px-8 py-6">
                                                <p className="text-lg font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</p>
                                                <div className="flex items-center gap-1.5 text-zinc-400 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">
                                                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Citizen Pairing */}
                                            <td className="px-6 py-6">
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-blue-400 tracking-widest w-7">GRM</span>
                                                        <span className="text-sm font-bold text-zinc-800">{app.groom_name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[9px] font-black text-pink-400 tracking-widest w-7">BRD</span>
                                                        <span className="text-sm font-bold text-zinc-800">{app.bride_name}</span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Status Badge */}
                                            <td className="px-6 py-6">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${config.bg} ${config.border}`}>
                                                    <div className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${config.color}`}>{app.status}</span>
                                                </div>
                                            </td>

                                            {/* Submitted By */}
                                            <td className="px-6 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-900 group-hover:text-white transition-all">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                    <p className="text-xs font-black text-zinc-900 truncate max-w-[130px] uppercase tracking-tight">{app.submitted_by}</p>
                                                </div>
                                            </td>

                                            {/* Action Dropdown */}
                                            <td className="px-8 py-6">
                                                <ActionDropdown
                                                    app={app}
                                                    onView={() => setSelectedApp(app)}
                                                    onStatusChange={handleStatusChange}
                                                    isUpdating={updatingId === app.id}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Detail Modal ── */}
            {selectedApp && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                    onClick={() => setSelectedApp(null)}
                >
                    <div
                        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-[2rem] shadow-2xl flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b px-8 py-5 flex justify-between items-center z-10">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Application Review</h2>
                                <p className="text-sm text-zinc-400 font-medium mt-0.5">
                                    #{selectedApp.application_code} &bull; {new Date(selectedApp.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                    {selectedApp.contact_number && ` · ${selectedApp.contact_number}`}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="h-10 w-10 rounded-full bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-all"
                            >
                                <X className="h-5 w-5 text-zinc-600" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-8 space-y-8 bg-zinc-50/50">
                            {/* Status + Submitter */}
                            <div className="flex items-center gap-3 flex-wrap">
                                {(() => {
                                    const cfg = STATUS_CONFIG[selectedApp.status?.toLowerCase()] || STATUS_CONFIG.pending;
                                    return (
                                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-black text-xs uppercase tracking-widest ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                                            <div className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                            {selectedApp.status || 'pending'}
                                        </div>
                                    );
                                })()}
                                <span className="text-xs text-zinc-400 font-bold">Submitted by: {selectedApp.submitted_by}</span>
                            </div>

                            {/* Groom & Bride Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {['groom', 'bride'].map((type) => {
                                    const person = type === 'groom' ? selectedApp.groom : selectedApp.bride;
                                    const isGroom = type === 'groom';

                                    if (!person) return (
                                        <div key={type} className="bg-white rounded-3xl border border-zinc-100 p-6 flex items-center justify-center h-40">
                                            <p className="text-zinc-400 text-sm italic">No {type} data found</p>
                                        </div>
                                    );

                                    const fullName = [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") + (person.suffix ? `, ${person.suffix}` : "");
                                    const address = person.addresses
                                        ? [person.addresses.barangay, person.addresses.municipality, person.addresses.province].filter(Boolean).join(", ")
                                        : null;

                                    return (
                                        <div key={type} className="space-y-3">
                                            <div className={`p-4 rounded-2xl border ${isGroom ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                                <h3 className="text-base font-black uppercase tracking-widest flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${isGroom ? 'bg-blue-500' : 'bg-rose-500'}`} />
                                                    {type}'s Information
                                                </h3>
                                            </div>

                                            <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                                                <section className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Personal Details</h4>
                                                    <DetailItem label="Full Name" value={fullName} />
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem label="Birthday" value={person.birth_date ? new Date(person.birth_date).toLocaleDateString() : null} />
                                                        <DetailItem label="Age" value={person.age} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <DetailItem label="Citizenship" value={person.citizenship} />
                                                        <DetailItem label="Religion" value={person.religion} />
                                                    </div>
                                                </section>

                                                {address && (
                                                    <section className="space-y-2">
                                                        <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Current Residence</h4>
                                                        <DetailItem label="Address" value={address} />
                                                    </section>
                                                )}

                                                <section className="space-y-3">
                                                    <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-widest border-b pb-1">Parental Information</h4>
                                                    <DetailItem label="Father's Name" value={person.father_name} />
                                                    <DetailItem label="Mother's Name" value={person.mother_name} />
                                                </section>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="border-t pt-4 text-center">
                                <p className="text-xs text-zinc-400 italic">This application record is encrypted and legally binding under RA 10173.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
