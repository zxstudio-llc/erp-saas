<?php

namespace App\Jobs;

use App\Models\Tenant;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Artisan;

class ProvisionTenantJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(protected Tenant $tenant, protected array $userData)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Artisan::call('tenants:migrate', ['--tenants' => [$this->tenant->id], '--force' => true]);
        Artisan::call('tenants:seed', ['--tenants' => [$this->tenant->id], '--class' => 'TenantDatabaseSeeder', '--force' => true]);

        $this->tenant->run(function () {
            $user = \App\Models\User::create([
                'name' => $this->userData['name'],
                'email' => $this->userData['email'],
                'password' => $this->userData['password'],
            ]);
            
            if (class_exists(\Spatie\Permission\Models\Role::class)) {
                $role = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'admin']);
                $user->assignRole($role);
            }
        });
    }
}
