import type { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface TenantInfo {
    slug: string;
    name: string;
}

export interface Pages extends InertiaPageProps {
    tenant?: TenantInfo | null;
    errors?: Record<string, string>;
}