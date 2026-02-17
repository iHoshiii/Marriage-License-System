import Link from "next/link";
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { NotificationHandler } from "@/components/ui/notification-handler";
import { Mail, Lock, LogIn, ShieldCheck, ArrowRight } from "lucide-react";
import { Suspense } from "react";

export default async function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
      {/* Dynamic Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-200/40 rounded-full blur-[120px]" />
        <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-zinc-100/60 rounded-full blur-[80px]" />
      </div>

      <main className="w-full max-w-[440px] relative z-10 transition-all">
        <div className="flex flex-col items-center mb-12">
          <div className="w-16 h-16 bg-black rounded-[1.5rem] flex items-center justify-center mb-6 shadow-2xl shadow-black/10 transition-all hover:scale-105 active:scale-95">
            <ShieldCheck className="text-white w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-zinc-900 uppercase">
            Sign In
          </h1>
          <p className="mt-2 text-zinc-500 font-medium tracking-tight">
            Access the Solano Marriage License System
          </p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-4 bg-white/80 backdrop-blur-xl border border-white">
          <div className="p-6">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 rounded-2xl mb-6" />}>
              <NotificationHandler />
            </Suspense>

            <form action={login} className="space-y-6">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1"
                >
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <label
                    htmlFor="password"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400"
                  >
                    Password
                  </label>
                  <Link
                    href="/login/forgot-password"
                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-11 h-12 bg-zinc-50/50 border-zinc-100 focus:border-black rounded-2xl transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-14 rounded-2xl mt-4 font-black uppercase tracking-widest text-xs shadow-xl shadow-zinc-200 transition-all hover:scale-[1.02] active:scale-[0.98]">
                Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>

        <p className="mt-10 text-center text-[11px] font-bold uppercase tracking-widest text-zinc-400">
          New to the platform?{" "}
          <Link
            href="/login/signup"
            className="text-black border-b-2 border-black/10 hover:border-black transition-all ml-1"
          >
            Create an account
          </Link>
        </p>
      </main>
    </div>
  );
}

