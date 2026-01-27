<?php

namespace App\Actions\SaaS;

use App\Models\Tenant;
use App\Models\Subscription;
use App\Models\Plan;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

class CreateSubscriptionAction
{
    public function execute(Tenant $tenant, Plan $plan): Subscription
    {
        return Subscription::create([
            'tenant_id' => $tenant->id,
            'plan_id' => $plan->id,
            'status' => 'trial',
            'started_at' => now(),
            'ends_at' => now()->addDays(14),
        ]);
    }
}