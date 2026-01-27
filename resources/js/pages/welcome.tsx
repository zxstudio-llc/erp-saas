import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';

interface Plan {
    id: number;
    name: string;
    slug: string;
    price: number;
    billing_cycle: 'monthly' | 'yearly';
    limits: {
        max_users: number;
        max_invoices_month: number;
        max_companies: number;
    };
    active: boolean;
}

export default function Welcome({
    canRegister = true,
    plans = []
}: {
    canRegister?: boolean;
    plans?: Plan[]
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bienvenido">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600"
                    rel="stylesheet"
                />
            </Head>
            <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
                <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
                    <nav className="flex items-center justify-end gap-4">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={login()}
                                    className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                                >
                                    Log in
                                </Link>
                                {canRegister && (
                                    <Link
                                        href={register()}
                                        className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
                                    >
                                        Register
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>
                </header>

                <section className="py-20">
                    <div className="container mx-auto px-4 text-center">
                        <h1 className="mb-6 text-5xl font-bold">
                            Facturación Electrónica
                            <span className="block text-indigo-600">SRI Ecuador</span>
                        </h1>
                        <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
                            Sistema ERP con facturación offline, multi-empresa y sincronización automática con el SRI.
                        </p>
                        {/* El botón principal ahora scrollea a la sección de planes */}
                        <a href="#planes" className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors">
                            Ver Planes y Precios
                        </a>
                    </div>
                </section>

                {plans.length > 0 && (
                    <section id="planes" className="py-20 w-full max-w-6xl">
                        <div className="container mx-auto px-4">
                            <h2 className="mb-12 text-center text-3xl font-bold dark:text-white">Planes Diseñados para tu Crecimiento</h2>
                            <div className="grid gap-8 md:grid-cols-3">
                                {plans.filter(p => p.active).map((plan) => {
                                    const isPopular = plan.slug === 'professional';
                                    return (
                                        <div key={plan.id} className={`relative rounded-xl border-2 bg-white dark:bg-[#111] p-8 transition-all hover:shadow-lg ${isPopular ? 'border-indigo-600 shadow-xl scale-105' : 'border-slate-200 dark:border-slate-800'}`}>
                                            {isPopular && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-indigo-600 px-4 py-1 text-sm font-semibold text-white">
                                                    Más Popular
                                                </div>
                                            )}
                                            <h3 className="mb-2 text-2xl font-bold dark:text-white">{plan.name}</h3>
                                            <div className="mb-6">
                                                <span className="text-4xl font-bold dark:text-white">${plan.price}</span>
                                                <span className="text-slate-600 dark:text-slate-400">/{plan.billing_cycle === 'monthly' ? 'mes' : 'año'}</span>
                                            </div>
                                            
                                            <ul className="mb-8 space-y-3">
                                                <li className="flex items-center gap-2 text-sm dark:text-slate-300">
                                                    <CheckIcon />
                                                    {plan.limits.max_users === -1 ? 'Usuarios ilimitados' : `${plan.limits.max_users} usuarios`}
                                                </li>
                                                <li className="flex items-center gap-2 text-sm dark:text-slate-300">
                                                    <CheckIcon />
                                                    {plan.limits.max_invoices_month === -1 ? 'Facturas ilimitadas' : `${plan.limits.max_invoices_month} facturas/mes`}
                                                </li>
                                                <li className="flex items-center gap-2 text-sm dark:text-slate-300">
                                                    <CheckIcon />
                                                    {plan.limits.max_companies === -1 ? 'Empresas ilimitadas' : `${plan.limits.max_companies} empresa(s)`}
                                                </li>
                                                <li className="flex items-center gap-2 text-sm dark:text-slate-300">
                                                    <CheckIcon />
                                                    Facturación Offline SRI
                                                </li>
                                            </ul>

                                            {/* Redirección al registro nativo con el ID del plan seleccionado */}
                                            <Link 
                                                href={register()} 
                                                data={{ plan_id: plan.id }}
                                                className={`block w-full rounded-lg py-3 text-center font-semibold transition-colors ${
                                                    isPopular 
                                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                                    : 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950'
                                                }`}
                                            >
                                                Comenzar Prueba Gratis
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </section>
                )}

                <footer className="mt-auto border-t w-full py-8 text-center text-sm text-slate-600 dark:text-slate-400">
                    © {new Date().getFullYear()} ERP SaaS - Facturación Electrónica SRI Ecuador
                </footer>
            </div>
        </>
    );
}

// Componente auxiliar para los iconos de check
function CheckIcon() {
    return (
        <svg className="h-5 w-5 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
    );
}