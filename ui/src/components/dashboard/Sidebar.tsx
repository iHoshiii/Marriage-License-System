"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getNavigationLinks } from "./NavigationConfig";

interface SidebarProps {
    userRole?: string;
}

export function Sidebar({ userRole = "user" }: SidebarProps) {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="hidden w-64 border-r border-zinc-200 bg-white p-6 flex-col md:flex h-screen sticky top-0">
            <div className="flex items-center gap-2 mb-10 px-2">
                <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center">
                    <ShieldCheck className="text-white h-5 w-5" />
                </div>
                <span className="font-bold text-xl tracking-tight">Solano MLS</span>
            </div>

            <nav className="flex-1 space-y-1">
                {getNavigationLinks(userRole).map((link) => (
                    <Link key={link.href} href={link.href}>
                        <Button
                            variant={isActive(link.href) ? "secondary" : "ghost"}
                            className={cn("w-full justify-start gap-3 h-11 px-3", isActive(link.href) ? "bg-zinc-100 font-medium" : "text-zinc-500 hover:text-black")}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.label}
                        </Button>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-zinc-200">
                <form action={logout}>
                    <Button variant="ghost" type="submit" className="w-full justify-start gap-3 h-11 px-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </form>
            </div>
        </aside>
    );
}
