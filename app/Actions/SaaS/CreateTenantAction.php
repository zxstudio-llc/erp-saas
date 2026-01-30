<?php

namespace App\Actions\SaaS;

use App\Models\{Tenant, User};
use Illuminate\Support\Facades\DB;

class CreateTenantAction
{
    public function execute(array $data, User $user): Tenant
    {
        $tenant = Tenant::create([
            'id' => $data['slug'],
            'slug' => $data['slug'],
            'database' => 'erp' . $data['slug'],
            'status' => 'active',
        ]);

        $tenant->users()->attach($user->id);

        return $tenant;
    }
}