<?php

namespace App\Actions\SaaS;

use App\Models\Tenant;
use Illuminate\Support\Facades\Artisan;

class ProvisionTenantDatabaseAction
{
    public function execute(Tenant $tenant): void
    {
        Artisan::call('tenants:migrate', [
            '--tenants' => [$tenant->id],
            '--force' => true,
        ]);
        
        Artisan::call('tenants:seed', [
            '--tenants' => [$tenant->id],
            '--class' => 'TenantDatabaseSeeder',
            '--force' => true,
        ]);
    }
}
