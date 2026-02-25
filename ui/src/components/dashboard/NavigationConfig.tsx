import {
    LayoutDashboard,
    User,
    Bell,
    Users,
    FileText,
    BarChart
} from "lucide-react";

export interface NavLink {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

export const getNavigationLinks = (userRole: string): NavLink[] => {
    const baseLinks: NavLink[] = [
        { href: `/dashboard/${userRole}`, label: "Dashboard", icon: LayoutDashboard },
        { href: "/dashboard/profile", label: "Profile", icon: User },
        { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    ];

    if (userRole === "admin") {
        return [
            ...baseLinks,
            { href: "/dashboard/admin/staff", label: "Staff Management", icon: Users },
            { href: "/dashboard/admin/applications", label: "Global Applications", icon: FileText },
            { href: "/dashboard/admin/reports", label: "Reports & Analytics", icon: BarChart },
        ];
    }

    if (userRole === "employee") {
        return [
            ...baseLinks,
            { href: "/dashboard/admin/applications", label: "Applications", icon: FileText },
        ];
    }

    return baseLinks;
};