import { PropsWithChildren, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function TenantLayout({ children }: PropsWithChildren) {
    const { auth, tenant, company } = usePage().props as any;
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm border-b">
                <div className="flex justify-between items-center px-6 py-3">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-xl font-semibold">{tenant?.slug || 'ERP'}</h1>
                        {company?.environment === 'test' && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                PRUEBAS
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">{auth?.user?.name}</span>
                        <Link href="/settings" className="text-gray-600 hover:text-gray-900">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} transition-all bg-gray-800 text-white min-h-screen overflow-hidden`}>
                    <nav className="p-4 space-y-2">
                        <NavLink href={`/${tenant?.slug}/dashboard`} icon="home">Dashboard</NavLink>
                        
                        <div className="pt-4 pb-2 text-xs text-gray-400 uppercase">Facturación</div>
                        <NavLink href={`/${tenant?.slug}/invoices`} icon="document">Facturas</NavLink>
                        <NavLink href={`/${tenant?.slug}/customers`} icon="users">Clientes</NavLink>
                        
                        <div className="pt-4 pb-2 text-xs text-gray-400 uppercase">Configuración</div>
                        <NavLink href={`/${tenant?.slug}/companies`} icon="office">Empresas</NavLink>
                        <NavLink href={`/${tenant?.slug}/establishments`} icon="building">Establecimientos</NavLink>
                        <NavLink href={`/${tenant?.slug}/emission-points`} icon="location">Puntos de Emisión</NavLink>
                        <NavLink href={`/${tenant?.slug}/sequence-blocks`} icon="hash">Secuenciales</NavLink>
                        
                        <div className="pt-4 pb-2 text-xs text-gray-400 uppercase">SRI</div>
                        <NavLink href={`/${tenant?.slug}/sri-logs`} icon="list">Logs SRI</NavLink>
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

function NavLink({ href, icon, children }: { href: string; icon: string; children: React.ReactNode }) {
    const { url } = usePage();
    const isActive = url.startsWith(href);
    
    return (
        <Link
            href={href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
        >
            <span className="w-5 h-5">{/* Icon would go here */}</span>
            <span>{children}</span>
        </Link>
    );
}