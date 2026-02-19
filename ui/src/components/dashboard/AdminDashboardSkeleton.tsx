import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboardSkeleton() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-4 w-80" />
                </div>
                <div className="flex items-center gap-3">
                    <Skeleton className="h-11 w-32" />
                    <Skeleton className="h-11 w-28" />
                </div>
            </div>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="rounded-[2rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-8 w-16 mb-1" />
                            <Skeleton className="h-3 w-20" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Analytics Section Skeleton */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="rounded-[2.5rem] border-zinc-100 shadow-xl shadow-zinc-200/40 overflow-hidden">
                    <div className="p-8 pb-4">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <Skeleton className="h-8 w-20" />
                        </div>

                        <div className="space-y-8 max-w-4xl">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex items-baseline gap-2">
                                            <Skeleton className="h-8 w-12" />
                                            <Skeleton className="h-3 w-8" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-3 w-full rounded-full" />
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 pt-8 border-t border-zinc-50 flex flex-col sm:flex-row gap-6">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <div className="space-y-1">
                                    <Skeleton className="h-3 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}