import { Toaster } from '@/components/ui/sonner';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function AuthTenantLayout({
    children,
    title,
    description,
    ...props
}: {
    children: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <AuthSplitLayout title={title} description={description} {...props}>
            {children}
            <Toaster />
        </AuthSplitLayout>
    );
}
