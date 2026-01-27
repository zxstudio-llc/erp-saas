<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Actions\SaaS\CreateTenantAction;
use App\Actions\SaaS\CreateSubscriptionAction;
use App\Actions\SaaS\ProvisionTenantDatabaseAction;
use App\Models\Plan;
use Inertia\Inertia;

class OnboardingController extends Controller
{

    public function selectPlan()
    {
        return Inertia::render('onboarding/selectPlan', [
            'plans' => Plan::where('active', true)->get()
        ]);
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:tenants,slug|alpha_dash',
            'email' => 'required|email',
            'password' => 'required|min:8',
            'plan_id' => 'required|exists:plans,id',
        ]);

        return Inertia::render('onboarding/register', $validated);
    }

    public function provision(
        Request $request,
        CreateTenantAction $createTenant,
        CreateSubscriptionAction $createSubscription,
        ProvisionTenantDatabaseAction $provisionDb
    ) {
        $validated = $request->validate([
            'slug' => 'required|string',
            'plan_id' => 'required|exists:plans,id',
        ]);

        $tenant = $createTenant->execute($validated);
        $plan = Plan::findOrFail($validated['plan_id']);
        $subscription = $createSubscription->execute($tenant, $plan);
        $provisionDb->execute($tenant);

        return redirect("/{$tenant->slug}/dashboard");
    }
}
