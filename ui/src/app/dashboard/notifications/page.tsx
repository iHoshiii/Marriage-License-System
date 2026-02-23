import { createClient } from "@/utils/supabase/server-utils";
import { redirect } from "next/navigation";
import { Bell, Clock, User, FileText, Camera, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getUserRole } from "@/utils/roles";

export const dynamic = "force-dynamic";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    created_at: string;
    read_at: string | null;
    user_id: string;
    created_by: string;
    created_by_profile?: {
        full_name: string;
        role: string;
    };
    related_application?: {
        application_code: string;
    };
}

export default async function NotificationsPage() {
    const supabase = await createClient();

    if (!supabase) {
        console.error("Failed to create Supabase client");
        redirect("/login");
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const role = await getUserRole();

    // First, try a simple query to check if table exists
    const { data: testData, error: testError } = await supabase
        .from('notifications')
        .select('id')
        .limit(1);

    if (testError) {
        console.error('Notifications table test failed:', testError);
        // If table doesn't exist, return empty
        if (testError.code === 'PGRST116' || testError.message?.includes('notifications')) {
            console.log('Notifications table does not exist yet. Please run the SQL migration.');
            return (
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
                        <Badge variant="secondary" className="text-sm">0 unread</Badge>
                    </div>
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center text-zinc-500">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">Notifications System</h3>
                                <p className="text-sm mb-4">The notifications table needs to be created first.</p>
                                <p className="text-xs text-zinc-400">Please run the provided SQL migration in your Supabase SQL Editor.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }
    }

    // Fetch notifications based on role with simplified query first
    let baseQuery = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

    // For admin, show notifications they received OR notifications they created
    if (role === 'admin') {
        baseQuery = supabase
            .from('notifications')
            .select('*')
            .or(`user_id.eq.${user.id},created_by.eq.${user.id}`)
            .order('created_at', { ascending: false })
            .limit(50);
    }

    const { data: notifications, error } = await baseQuery;

    // If we have notifications, try to enrich them with profile and application data
    let enrichedNotifications = notifications;
    if (notifications && notifications.length > 0) {
        try {
            // Get unique created_by IDs and application IDs
            const createdByIds = [...new Set(notifications.map(n => n.created_by).filter(Boolean))];
            const applicationIds = [...new Set(notifications.map(n => n.related_application_id).filter(Boolean))];

            // Fetch profiles
            const { data: profilesData } = createdByIds.length > 0 ? await supabase
                .from('profiles')
                .select('id, full_name, role')
                .in('id', createdByIds) : { data: [] };

            // Fetch applications
            const { data: applicationsData } = applicationIds.length > 0 ? await supabase
                .from('marriage_applications')
                .select('id, application_code')
                .in('id', applicationIds) : { data: [] };

            // Enrich notifications
            enrichedNotifications = notifications.map(notification => ({
                ...notification,
                created_by_profile: profilesData?.find((p: { id: string; full_name: string; role: string }) => p.id === notification.created_by) || null,
                related_application: applicationsData?.find((a: { id: string; application_code: string }) => a.id === notification.related_application_id) || null
            }));
        } catch (enrichError) {
            console.error('Error enriching notifications:', enrichError);
            // Continue with basic notifications if enrichment fails
        }
    }

    if (error) {
        console.error('Error fetching notifications:', error);
        // If table doesn't exist yet, show empty state
        if (error.code === 'PGRST116' || error.message?.includes('notifications')) {
            console.log('Notifications table may not exist yet. Please run the provided SQL migration.');
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'status_change':
                return <FileText className="h-4 w-4" />;
            case 'photo_captured':
                return <Camera className="h-4 w-4" />;
            case 'staff_action':
                return <ShieldCheck className="h-4 w-4" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'status_change':
                return 'text-blue-600 bg-blue-50';
            case 'photo_captured':
                return 'text-green-600 bg-green-50';
            case 'staff_action':
                return 'text-purple-600 bg-purple-50';
            default:
                return 'text-zinc-600 bg-zinc-50';
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Notifications</h1>
                <Badge variant="secondary" className="text-sm">
                    {notifications?.filter(n => !n.read_at).length || 0} unread
                </Badge>
            </div>

            <div className="space-y-4">
                {notifications && notifications.length > 0 ? (
                    notifications.map((notification: Notification) => (
                        <Card key={notification.id} className={`transition-all ${!notification.read_at ? 'border-l-4 border-l-blue-500 bg-blue-50/30' : ''}`}>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-zinc-900">{notification.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <Clock className="h-3 w-3" />
                                                {new Date(notification.created_at).toLocaleDateString()} at {new Date(notification.created_at).toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <p className="text-zinc-700">{notification.message}</p>
                                        {notification.created_by_profile && notification.user_id !== notification.created_by && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <User className="h-3 w-3" />
                                                <span>By {notification.created_by_profile.full_name} ({notification.created_by_profile.role})</span>
                                            </div>
                                        )}
                                        {notification.related_application && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-500">
                                                <FileText className="h-3 w-3" />
                                                <span>Application: {notification.related_application.application_code}</span>
                                            </div>
                                        )}
                                        {!notification.read_at && (
                                            <Badge variant="outline" className="text-xs">Unread</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12">
                            <div className="text-center text-zinc-500">
                                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Bell className="h-8 w-8 text-zinc-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-zinc-900">No Notifications</h3>
                                <p>Updates about your applications and activities will appear here.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
