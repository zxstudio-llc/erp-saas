<?php
namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\{InteractsWithQueue, SerializesModels};
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\{Artisan, Hash};
use Illuminate\Support\Str;

class ProvisionTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(protected string $tenantId, protected array $userData) {}

    public function handle(): void
    {
        set_time_limit(600);
        
        $tenant = Tenant::find($this->tenantId);

        Artisan::call('tenants:migrate', ['--tenants' => [$tenant->id], '--force' => true]);
        Artisan::call('tenants:seed', ['--tenants' => [$tenant->id], '--class' => 'TenantDatabaseSeeder', '--force' => true]);

        $tenant->run(function () {
            \App\Models\User::create([
                'name' => $this->userData['name'],
                'email' => $this->userData['email'],
                'password' => \Hash::make(\Str::random(8)),
            ]);
        });

        $tenant->update(['status' => 'active']);
    }
}