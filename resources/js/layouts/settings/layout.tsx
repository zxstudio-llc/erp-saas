import { Link } from '@inertiajs/react';
import type { PropsWithChildren } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { cn, toUrl } from '@/lib/utils';
import type { NavItem, Tenant } from '@/types';
import { edit as editProfile } from '@/routes/profile';
import { edit as editPassword } from '@/routes/user-password';
import { show as showTwoFactor } from '@/routes/two-factor';
import { edit as editAppearance } from '@/routes/appearance';
import tenant from '@/hooks/use-tenant';
import profile from '@/routes/tenant/settings/profile';
import userPassword from '@/routes/tenant/settings/user-password';
import twoFactor from '@/routes/tenant/settings/two-factor';
import appearance from '@/routes/tenant/settings/appearance';

function useSettingsRoutes() {
    const currentTenant = tenant.required();

    if (currentTenant) {
        return {
            profile: profile.edit(currentTenant.slug).url,
            password: userPassword.edit(currentTenant.slug).url,
            twoFactor: twoFactor.show(currentTenant.slug).url,
            appearance: appearance.edit(currentTenant.slug).url,
        };
    }

    return {
        profile: editProfile().url,
        password: editPassword().url,
        twoFactor: showTwoFactor().url,
        appearance: editAppearance().url,
    };
}

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentUrl } = useCurrentUrl();
    const routes = useSettingsRoutes();

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: routes.profile,
            icon: null,
        },
        {
            title: 'Password',
            href: routes.password,
            icon: null,
        },
        {
            title: 'Two-Factor Auth',
            href: routes.twoFactor,
            icon: null,
        },
        {
            title: 'Appearance',
            href: routes.appearance,
            icon: null,
        },
    ];

    if (typeof window === 'undefined') {
        return null;
    }

    return (
        <div className="px-4 py-6">
            <Heading
                title="Settings"
                description="Manage your profile and account settings"
            />

            <div className="flex flex-col lg:flex-row lg:space-x-12">
                <aside className="w-full max-w-xl lg:w-48">
                    <nav
                        className="flex flex-col space-y-1"
                        aria-label="Settings"
                    >
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${toUrl(item.href)}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': isCurrentUrl(item.href),
                                })}
                            >
                                <Link href={item.href}>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 lg:hidden" />

                <div className="flex-1 md:max-w-2xl">
                    <section className="max-w-xl space-y-12">
                        {children}
                    </section>
                </div>
            </div>
        </div>
    );
}
