<?php

namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Artisan;

class ProvisionTenantJob implements ShouldQueue
{
    use Dispatchable, Queueable;

    public function __construct(
        public string $tenantId,
        public array $userData
    ) {}

    public function handle()
    {
        $tenant = Tenant::findOrFail($this->tenantId);

        tenancy()->initialize($tenant);

        if (!Schema::hasTable('users')) {
            Artisan::call('tenants:migrate', [
                '--tenants' => [$tenant->id],
                '--force' => true,
            ]);
        }

        \App\Models\User::firstOrCreate(
            ['email' => $this->userData['email']],
            [
                'name' => $this->userData['name'],
                'password' => Hash::make(Str::random(32)),
            ]
        );

        tenancy()->end();
    }
}
