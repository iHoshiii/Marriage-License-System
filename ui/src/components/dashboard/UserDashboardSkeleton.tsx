import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function UserDashboardSkeleton() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            {/* Welcome Section Skeleton */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-9 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-11 w-40" />
            </div>

            {/* Grid Layout Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Applications List Skeleton */}
                <div className="lg:col-span-2 space-y-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="overflow-hidden border-l-4 border-l-primary">
                            <CardHeader className="bg-zinc-50/50 pb-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <Skeleton className="h-4 w-20" />
                                            <Skeleton className="h-3 w-16" />
                                        </div>
                                        <Skeleton className="h-6 w-48" />
                                    </div>
                                    <Skeleton className="h-6 w-24 rounded-full" />
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-3">
                                        <Skeleton className="h-3 w-20" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-28" />
                                        </div>
                                    </div>
                                    <div className="bg-zinc-50 p-4 rounded-lg border border-zinc-100 space-y-3">
                                        <Skeleton className="h-3 w-16" />
                                        <Skeleton className="h-12 w-full" />
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-zinc-50/30 border-t border-zinc-100 flex justify-end gap-3 py-4">
                                <Skeleton className="h-8 w-24" />
                                <Skeleton className="h-8 w-32" />
                            </CardFooter>
                        </Card>
                    ))}
                </div>

                {/* Right Column: Information & Help Skeleton */}
                <div className="space-y-6">
                    {/* Office Visit Instructions Card Skeleton */}
                    <Card className="bg-blue-50 border-blue-100 shadow-sm rounded-3xl overflow-hidden">
                        <CardHeader className="pb-2">
                            <Skeleton className="h-6 w-40" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <div className="space-y-3">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="flex gap-4 items-start bg-white/60 p-4 rounded-2xl border border-blue-100 shadow-sm">
                                        <Skeleton className="h-7 w-7 rounded-full" />
                                        <div className="space-y-1 flex-1">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-40" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Help Card Skeleton */}
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-20" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <div className="flex items-center gap-2 pt-2">
                                <Skeleton className="h-4 w-4" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}