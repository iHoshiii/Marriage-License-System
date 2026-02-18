"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserPlus, Mail, IdCard, User, Loader2 } from "lucide-react";
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

import { AlertCircle } from "lucide-react";
