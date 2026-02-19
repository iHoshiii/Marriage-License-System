"use client";

import { useState, useTransition } from "react";
import { AdminDashboardSkeleton } from "./AdminDashboardSkeleton";
import { EmployeeDashboardSkeleton } from "./EmployeeDashboardSkeleton";
import { UserDashboardSkeleton } from "./UserDashboardSkeleton";

interface DashboardSkeletonLoaderProps {
    userRole: string;
    children: React.ReactNode;
}

export function DashboardSkeletonLoader({ userRole, children }: DashboardSkeletonLoaderProps) {
    const [isPending, startTransition] = useTransition();

    // Render skeleton based on user role
    const renderSkeleton = () => {
        switch (userRole) {
            case "admin":
                return <AdminDashboardSkeleton />;
            case "employee":
                return <EmployeeDashboardSkeleton />;
            case "user":
            default:
                return <UserDashboardSkeleton />;
        }
    };

    return (
        <>
            {isPending && (
                <div className="animate-in fade-in duration-300">
                    {renderSkeleton()}
                </div>
            )}
            {!isPending && children}
        </>
    );
}
