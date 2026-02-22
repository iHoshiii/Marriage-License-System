import { getAllApplications, updateApplicationStatus } from "../actions";
import { notFound } from "next/navigation";
import {
    ArrowLeft, User, Calendar, MapPin, Heart, Phone,
    FileText, CheckCircle2, Clock, XCircle, Hash
} from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
    pending: { color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
    approved: { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" },
    completed: { color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
    rejected: { color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
};

function Field({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{label}</p>
            <p className="text-sm font-bold text-zinc-900">{value || <span className="text-zinc-300 font-medium italic">Not provided</span>}</p>
        </div>
    );
}

function PersonCard({ person, role, color }: { person: any; role: string; color: "blue" | "pink" }) {
    const accent = color === "blue" ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-pink-50 border-pink-100 text-pink-600";
    const tag = color === "blue" ? "bg-blue-100 text-blue-700" : "bg-pink-100 text-pink-700";

    if (!person) {
        return (
            <div className="bg-zinc-50 rounded-3xl p-8 border border-zinc-100 flex items-center justify-center h-40">
                <p className="text-zinc-400 font-bold text-sm italic">No {role} data found</p>
            </div>
        );
    }

    const fullName = [person.first_name, person.middle_name, person.last_name].filter(Boolean).join(" ") + (person.suffix ? `, ${person.suffix}` : "");
    const address = person.addresses ? [person.addresses.barangay, person.addresses.municipality, person.addresses.province].filter(Boolean).join(", ") : null;

    return (
        <div className={`rounded-3xl border p-6 space-y-5 ${accent.replace("text-", "border-").replace("bg-", "").replace("blue-600", "").replace("pink-600", "")} bg-white border-zinc-100`}>
            {/* Person Header */}
            <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black ${tag}`}>
                    {color === "blue" ? "GRM" : "BRD"}
                </div>
                <div>
                    <p className="font-black text-zinc-900 tracking-tight">{fullName}</p>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{role}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <Field label="Birthday" value={person.birth_date ? new Date(person.birth_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null} />
                <Field label="Age" value={person.age} />
                <Field label="Citizenship" value={person.citizenship} />
                <Field label="Religion" value={person.religion} />
            </div>

            {address && (
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Address</p>
                    <div className="flex items-start gap-2">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 mt-0.5 shrink-0" />
                        <p className="text-sm font-bold text-zinc-900">{address}</p>
                    </div>
                </div>
            )}

            <div className="border-t border-zinc-100 pt-4 grid grid-cols-1 gap-3">
                <Field label="Father's Name" value={person.father_name} />
                <Field label="Mother's Name" value={person.mother_name} />
            </div>
        </div>
    );
}

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
    const { apps } = await getAllApplications();
    const app = apps.find(a => a.id === params.id);

    if (!app) notFound();

    const statusCfg = STATUS_CONFIG[app.status?.toLowerCase()] || STATUS_CONFIG.pending;

    async function handleStatusUpdate(formData: FormData) {
        "use server";
        const newStatus = formData.get("status") as string;
        await updateApplicationStatus(app!.id, newStatus);
        revalidatePath(`/dashboard/admin/applications/${app!.id}`);
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
            {/* Back + Header */}
            <div>
                <Link href="/dashboard/admin/applications" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors font-bold text-sm mb-6 group">
                    <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Master Directory
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="h-12 w-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center shadow-lg">
                                <FileText className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Application Code</p>
                                <h1 className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{app.application_code}</h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-zinc-400">
                                <Calendar className="h-3.5 w-3.5" />
                                <span className="text-[11px] font-bold">
                                    Submitted {new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            {app.contact_number && (
                                <div className="flex items-center gap-1.5 text-zinc-400">
                                    <Phone className="h-3.5 w-3.5" />
                                    <span className="text-[11px] font-bold">{app.contact_number}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Status Badge */}
                    <div className={`px-5 py-3 rounded-2xl border font-black text-sm uppercase tracking-widest ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                        {app.status || 'pending'}
                    </div>
                </div>
            </div>

            {/* Couple Info */}
            <div>
                <div className="flex items-center gap-3 mb-4">
                    <Heart className="h-4 w-4 text-pink-400" />
                    <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500">Applicant Information</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <PersonCard person={app.groom} role="Groom" color="blue" />
                    <PersonCard person={app.bride} role="Bride" color="pink" />
                </div>
            </div>

            {/* Submission Info */}
            <div className="bg-white rounded-3xl border border-zinc-100 p-6 shadow-sm">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Submission Details</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                    <Field label="Submitted By" value={app.submitted_by} />
                    {app.document_number && <Field label="Document Number" value={`#${app.document_number}`} />}
                    <Field label="Last Updated" value={app.updated_at ? new Date(app.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null} />
                </div>
            </div>

            {/* Status Update Panel */}
            <div className="bg-zinc-900 rounded-3xl p-6 text-white">
                <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Update Application Status</h2>
                <p className="text-sm text-zinc-500 mb-5">Changing the status will notify the applicant and update the master directory.</p>
                <form action={handleStatusUpdate} className="flex flex-wrap gap-3">
                    {[
                        { value: "pending", label: "Pending", icon: Clock, className: "bg-amber-500 hover:bg-amber-400" },
                        { value: "approved", label: "Approved", icon: CheckCircle2, className: "bg-emerald-500 hover:bg-emerald-400" },
                        { value: "completed", label: "Completed", icon: FileText, className: "bg-blue-500 hover:bg-blue-400" },
                        { value: "rejected", label: "Rejected", icon: XCircle, className: "bg-red-500 hover:bg-red-400" },
                    ].map(({ value, label, icon: Icon, className }) => (
                        <button
                            key={value}
                            type="submit"
                            name="status"
                            value={value}
                            disabled={app.status === value}
                            className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 ${className}`}
                        >
                            <Icon className="h-4 w-4" />
                            {label}
                        </button>
                    ))}
                </form>
            </div>
        </div>
    );
}
