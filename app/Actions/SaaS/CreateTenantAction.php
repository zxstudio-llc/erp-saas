<?php

namespace App\Actions\SaaS;

use App\Models\{Tenant, User};
use Illuminate\Support\Facades\DB;

class CreateTenantAction
{
    public function execute(array $data, User $user): Tenant
    {
        return DB::transaction(function () use ($data, $user) {
            $tenant = Tenant::create([
                'id' => $data['slug'],
                'slug' => $data['slug'],
                'database' => 'erp' . $data['slug'],
                'status' => 'active',
            ]);

            // $tenant->domains()->create([
            //     'domain' => config('tenancy.central_domains')[0],
            // ]);

            $tenant->users()->attach($user->id);

            return $tenant;
        });
    }
}