<?php

namespace App\Actions\SaaS;

use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class CreateTenantAction
{
    public function execute(array $data): Tenant
    {
        $tenant = Tenant::create([
            'id'   => $data['slug'],
            'slug' => $data['slug'],
            'database' => 'erp' . $data['slug'],
            'status'   => 'active',
        ]);
        $centralDomain = config('tenancy.central_domains')[0] ?? 'erpsaas.test';

        $tenant->domains()->create([
            'domain' => $data['slug'],
        ]);

        return $tenant;
    }
}