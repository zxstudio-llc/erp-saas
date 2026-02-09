export type * from './auth';
export type * from './navigation';
export type * from './tenant';
export type * from './ui';

import type { Auth } from './auth';
import type { Tenant } from './tenant';

export type SharedData = {
    name: string;
    auth: Auth;
    tenant: Tenant;
    sidebarOpen: boolean;
    [key: string]: unknown;
};
