import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { home } from '@/routes';
import type { AuthLayoutProps, SharedData } from '@/types';

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh px-8 sm:px-0 lg:grid-cols-5 lg:px-2">

            <div className="w-full lg:col-span-3 lg:flex items-center justify-center p-8">
                <div className="relative w-full max-w-3xl p-2 items-start">

                    <div className="flex flex-col gap-6 text-foreground px-4">
                        <Link
                            href={home()}
                            className="flex items-start text-lg font-medium"
                        >
                            <AppLogoIcon className="mr-2 size-8 fill-current" />
                            {name}
                        </Link>
                    </div>
                    <div className="flex flex-col text-foreground">
                        {children}
                    </div>
                </div>
            </div>

            {/* 🔹 DERECHA – 1/3 */}
            <div className="relative hidden lg:col-span-2 lg:flex items-center justify-center">
                <div className="relative w-full max-w-xl rounded-2xl border bg-background p-10 shadow-xl h-11/12">

                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-linear-to-br from-muted/40 to-transparent" />

                    <div className="relative z-10 flex flex-col gap-6 text-foreground">
                        <Link
                            href={home()}
                            className="flex items-center text-lg font-medium"
                        >
                            <AppLogoIcon className="mr-2 size-8 fill-current" />
                            {name} demo
                        </Link>

                        <p className="text-sm text-muted-foreground">
                            Accede a una demo del sistema y explora sus funcionalidades.
                        </p>
                    </div>
                </div>
            </div>

        </div>
    );
}

