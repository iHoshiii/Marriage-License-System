import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function EmployeeDashboardSkeleton() {
    return (
        <div className="max-w-7xl mx-auto space-y-8">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-10 w-28" />
                    <Skeleton className="h-10 w-24" />
                </div>
            </div>

            {/* Process Application Card Skeleton */}
            <Card className="p-6 bg-blue-50/50 border-blue-100">
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-5" />
                        <Skeleton className="h-5 w-32" />
                    </div>
                    <div className="flex gap-4">
                        <Skeleton className="h-10 flex-1" />
                        <Skeleton className="h-10 w-20" />
                    </div>
                </div>
            </Card>

            {/* Metrics Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-8 w-8 mb-1" />
                        <Skeleton className="h-3 w-20" />
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity Card Skeleton */}
            <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="border border-zinc-100 rounded-lg p-8 text-center bg-zinc-50">
                    <Skeleton className="h-4 w-48 mx-auto" />
                </div>
            </div>
        </div>
    );
}