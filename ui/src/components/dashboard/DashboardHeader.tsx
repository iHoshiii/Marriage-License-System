import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
    title: string;
    subtitle: string;
    actions?: React.ReactNode;
    className?: string;
}

export function DashboardHeader({ title, subtitle, actions, className = "" }: DashboardHeaderProps) {
    return (
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${className}`}>
            <div>
                <h1 className="text-2xl md:text-3xl font-black text-zinc-900 uppercase tracking-tight">{title}</h1>
                <p className="text-sm text-zinc-500 font-medium tracking-tight">{subtitle}</p>
            </div>
            {actions && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
}