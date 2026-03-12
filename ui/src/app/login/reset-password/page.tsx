import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server-utils";
import { resetPassword } from "@/app/login/reset-password/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NotificationHandler } from "@/components/ui/notification-handler";
import { Lock, ShieldCheck, ArrowRight } from "lucide-react";
import { Suspense } from "react";

export default async function ResetPasswordPage() {
    const supabase = await createClient();
    const userResponse = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    const user = userResponse.data.user;

    if (!user) {
        return redirect("/login?error=Invalid or expired reset link. Please request a new one.");
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
            {/* Background patterns */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
            </div>

            <main className="w-full max-w-md relative z-10">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all hover:scale-105">
                        <ShieldCheck className="text-white w-7 h-7" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">
                        New Password
                    </h1>
                    <p className="mt-1 text-zinc-500 font-medium text-sm">
                        Please enter your new password below
                    </p>
                </div>

                <Card className="p-8 border-zinc-200/60 shadow-xl shadow-zinc-200/50 rounded-3xl bg-white/70 backdrop-blur-xl">
                    <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 rounded-xl mb-6" />}>
                        <NotificationHandler />
                    </Suspense>

                    <form action={resetPassword} className="space-y-6">
                        <div className="space-y-2">
                            <label
                                htmlFor="password"
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                            >
                                New Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="h-4 w-4" />}
                                className="h-12 bg-white/50 border-zinc-200 focus:border-black rounded-xl transition-all font-medium"
                                required
                                minLength={6}
                            />
                        </div>

                        <div className="space-y-2">
                            <label
                                htmlFor="confirm_password"
                                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                            >
                                Confirm New Password
                            </label>
                            <Input
                                id="confirm_password"
                                name="confirm_password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="h-4 w-4" />}
                                className="h-12 bg-white/50 border-zinc-200 focus:border-black rounded-xl transition-all font-medium"
                                required
                                minLength={6}
                            />
                        </div>

                        <Button type="submit" className="w-full h-12 rounded-xl mt-2 font-black uppercase tracking-widest text-xs shadow-lg shadow-zinc-200 transition-all hover:bg-zinc-800">
                            Update Password <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>
                </Card>
            </main>
        </div>
    );
}
