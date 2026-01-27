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
        return Tenant::create([
            'id' => Str::uuid(),
            'slug' => $data['slug'],
            'database' => 'tenant_' . $data['slug'],
            'status' => 'active',
        ]);
    }
}

class CreateSubscriptionAction
{
    public function execute(Tenant $tenant, Plan $plan): Subscription
    {
        return Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'trial',
            'started_at' => now(),
            'ends_at' => now()->addDays(14), // 14 días de trial
        ]);
    }
}

class ProvisionTenantDatabaseAction
{
    public function execute(Tenant $tenant): void
    {
        // Crear base de datos
        $dbName = $tenant->database;
        DB::statement("CREATE DATABASE {$dbName}");

        // Ejecutar migraciones tenant
        Artisan::call('tenants:migrate', [
            '--tenants' => [$tenant->id],
        ]);

        // Ejecutar seeders si es necesario
        Artisan::call('tenants:seed', [
            '--tenants' => [$tenant->id],
            '--class' => 'TenantDatabaseSeeder',
        ]);
    }
}
