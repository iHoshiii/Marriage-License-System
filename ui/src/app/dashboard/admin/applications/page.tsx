import { getAllApplications } from "./actions";
import GlobalOversightClient from "./GlobalOversightClient";

export const dynamic = "force-dynamic";

interface PageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function GlobalApplicationsPage({
    searchParams
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    // Next.js 15+ REQUIRES searchParams to be awaited
    const sParams = await searchParams;

    // Log for server-side debugging
    console.log("GlobalApplicationsPage loading with params:", sParams);

    const page = typeof sParams.page === 'string' ? Math.max(1, parseInt(sParams.page) || 1) : 1;
    const limit = typeof sParams.limit === 'string' ? Math.max(1, parseInt(sParams.limit) || 50) : 50;

    try {
        const result = await getAllApplications(page, limit);
        console.log(`Fetched ${result.apps?.length || 0} applications on server.`);

        return (
            <div className="space-y-8 animate-in fade-in duration-700">
                <GlobalOversightClient
                    apps={result.apps || []}
                    totalCount={result.totalCount || 0}
                    totalPages={result.totalPages || 0}
                    currentPage={result.currentPage || 1}
                    limit={result.limit || 50}
                />
            </div>
        );
    } catch (error) {
        console.error("Failed to load applications page:", error);
        return (
            <div className="p-8 text-center bg-red-50 text-red-800 rounded-3xl border border-red-100 italic font-bold">
                Error loading applications. Please refresh or try again later.
            </div>
        );
    }
}
