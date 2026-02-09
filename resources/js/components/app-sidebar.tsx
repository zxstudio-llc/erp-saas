import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, Settings } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem, Tenant } from '@/types';
import AppLogo from './app-logo';
import tenantRoutes from '@/routes/tenant';
import { dashboard as globalDashboard } from '@/routes';
import useTenant from '@/hooks/use-tenant';
import companies from '@/routes/tenant/companies';

// Seguimos exactamente tu lógica de Settings
function useAppRoutes() {
    const currentTenant = useTenant.optional(); // Usamos optional para evitar errores en modo Admin Global

    if (currentTenant) {
        return {
            dashboard: tenantRoutes.dashboard({ tenant: currentTenant.slug }).url,
            invoices: tenantRoutes.invoices.index({ tenant: currentTenant.slug }).url,
            customers: tenantRoutes.customers.index({ tenant: currentTenant.slug }).url,
            companies: tenantRoutes.companies.index({ tenant: currentTenant.slug }).url,
            emissionPoint: tenantRoutes.emissionPoints.index({ tenant: currentTenant.slug }).url,
            establishments: tenantRoutes.establishments.index({ tenant: currentTenant.slug }).url,
            users: '#', 
            settings: '#',
        };
    }

    return {
        dashboard: globalDashboard().url,
        invoices: globalDashboard().url,
        customers: globalDashboard().url,
        companies: globalDashboard().url,
        emissionPoint: globalDashboard().url,
        establishments: globalDashboard().url,
        users: companies,
        settings: '#',
    };
}

export function AppSidebar() {
    const routes = useAppRoutes();

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: routes.dashboard,
            icon: LayoutGrid,
        },
        {
            title: 'Facturas',
            href: routes.invoices,
            icon: Folder,
        },
        {
            title: 'Clientes',
            href: routes.customers,
            icon: Folder,
        },
        {
            title: 'Empresas',
            href: routes.companies,
            icon: Folder,
        },
        {
            title: 'Puntos de Emision',
            href: routes.emissionPoint,
            icon: Folder,
        },
        {
            title: 'Sucursales',
            href: routes.establishments,
            icon: Folder,
        },
        // Puedes agregar más items aquí usando routes.users, etc.
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Repository',
            href: 'https://github.com/laravel/react-starter-kit',
            icon: Folder,
        },
        {
            title: 'Documentation',
            href: 'https://laravel.com/docs/starter-kits#react',
            icon: BookOpen,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            {/* Usamos la ruta dinámica del hook */}
                            <Link href={routes.dashboard} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}