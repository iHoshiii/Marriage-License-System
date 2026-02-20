"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, IdCard, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { onboardStaff } from "./actions";

export function OnboardStaffDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);
        const email = formData.get("email") as string;
        const fullName = formData.get("fullName") as string;
        const employeeId = formData.get("employeeId") as string;

        const result = await onboardStaff(email, fullName, employeeId);

        if (result.success) {
            setIsOpen(false);
            // Optionally show success toast/message
        } else {
            setError(result.error || "Failed to onboard staff.");
        }
        setLoading(false);
    };

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {children}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
                        />

                        {/* Dialog Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-white">
                                            <UserPlus className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Onboard Staff</h2>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Employee Registration</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="h-10 w-10 rounded-xl hover:bg-zinc-50 flex items-center justify-center text-zinc-400 transition-colors"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                                <div
                                    className="mb-8 p-6 rounded-[2rem] relative overflow-hidden group shadow-md"
                                    style={{ backgroundColor: '#2563eb', color: 'white' }}
                                >
                                    <div className="relative z-10 flex items-start gap-4">
                                        <div className="h-10 w-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center border border-white/30">
                                            <AlertCircle className="h-5 w-5" style={{ color: 'white' }} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Prerequisite Action</p>
                                            <p className="text-sm font-black leading-tight" style={{ color: 'white' }}>
                                                Staff must first <Link href="/login/signup" className="underline underline-offset-4 decoration-white/40 hover:decoration-white transition-all">register an account</Link> before onboarding.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                                                <Input
                                                    name="fullName"
                                                    placeholder="John Doe"
                                                    required
                                                    className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Official Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                                                <Input
                                                    name="email"
                                                    type="email"
                                                    placeholder="staff@solano.gov.ph"
                                                    required
                                                    className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Employee ID</label>
                                            <div className="relative group">
                                                <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                                                <Input
                                                    name="employeeId"
                                                    placeholder="LGU-2024-001"
                                                    required
                                                    className="pl-12 h-14 rounded-2xl bg-zinc-50 border-none focus:ring-2 focus:ring-zinc-900 transition-all font-bold"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold uppercase tracking-tight flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4" />
                                            {error}
                                        </div>
                                    )}

                                    <div className="pt-4 flex gap-3">
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 h-14 rounded-[1.25rem] font-black uppercase tracking-widest text-xs"
                                        >
                                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Complete Onboarding"}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => setIsOpen(false)}
                                            className="h-14 px-8 rounded-[1.25rem] font-black uppercase tracking-widest text-xs text-zinc-400"
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

