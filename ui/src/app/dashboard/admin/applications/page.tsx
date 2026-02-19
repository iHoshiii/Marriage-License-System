import { getAllApplications } from "./actions";
import GlobalOversightClient from "./GlobalOversightClient";

export const dynamic = "force-dynamic";

export default async function GlobalApplicationsPage() {
    const apps = await getAllApplications();
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <GlobalOversightClient apps={apps} />
        </div>
    );
}
