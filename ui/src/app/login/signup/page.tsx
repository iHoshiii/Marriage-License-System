"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NotificationHandler } from "@/components/ui/notification-handler";
import { ShieldCheck } from "lucide-react";
import { Suspense, useEffect, use } from "react";
import SignupForm from "./SignupForm";

export default function SignupPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const params = use(searchParams);
  const applicationCode = params.code;

  // If we have an application code, store it for later use after signup
  useEffect(() => {
    if (applicationCode) {
      localStorage.setItem('pending_application_code', applicationCode);
    }
  }, [applicationCode]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-8">
      {/* Background patterns */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-zinc-200/50 rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-12">
          <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-8 shadow-xl transition-all hover:scale-105">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-zinc-900 uppercase">
            Create Account
          </h1>
          <p className="mt-2 text-zinc-500 font-medium text-sm">
            Solano Marriage License System
          </p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2.5rem] p-6 bg-white/80 backdrop-blur-xl border border-white">
          <div className="p-8">
            <Suspense fallback={<div className="h-10 w-full animate-pulse bg-zinc-100 rounded-2xl mb-6" />}>
              <NotificationHandler />
            </Suspense>

            <SignupForm />
          </div>
        </Card>

        <p className="mt-12 text-center text-[10px] font-black uppercase tracking-widest text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-black hover:underline underline-offset-4 ml-1"
          >
            Sign in
          </Link>
        </p>
      </main>
    </div>
  );
}