import { usePage } from '@inertiajs/react';
import type { Tenant } from '@/types/tenant';


export function useTenantRequired(): Tenant {
    const page = usePage();
    const tenant = page.props.tenant as Tenant | null;

    if (!tenant) {
        throw new Error('Tenant context required');
    }

    return tenant;
}

export function useTenantOptional(): Tenant | null {
    const page = usePage<{ tenant?: Tenant }>();
    return page.props.tenant ?? null;
}

const tenant = {
    required: useTenantRequired,
    optional: useTenantOptional,
};

export default tenant;