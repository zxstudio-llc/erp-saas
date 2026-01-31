<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Actions\SaaS\CreateSubscriptionAction;
use App\Models\{Plan, Tenant};
use App\Jobs\ProvisionTenantJob;
use Inertia\Inertia;

class OnboardingController extends Controller
{
    public function selectPlan() {
        return Inertia::render('onboarding/select-plan', [
            'plans' => Plan::where('active', true)->get()
        ]);
    }

    public function register(Request $request) {
        $planId = $request->input('plan_id');
        return Inertia::render('onboarding/register', [
            'plan' => Plan::findOrFail($planId),
            'plans' => Plan::where('active', true)->get()
        ]);
    }

    public function provision(Request $request, CreateSubscriptionAction $createSubscription)
{
    $validated = $request->validate([
        'company_name' => 'required|string|max:255',
        'slug' => 'required|string|max:50|unique:tenants,id|alpha_dash',
        'plan_id' => 'required|exists:plans,id',
        'first_name' => 'required|string|max:255',
        'last_name' => 'required|string|max:255',
        'email' => 'required|email',
    ]);

    $tenant = Tenant::create([
        'id' => $validated['slug'],
        'slug' => $validated['slug'],
        'database' => 'erp'.$validated['slug'],
        'status' => 'active',
    ]);

    $plan = Plan::findOrFail($validated['plan_id']);
    $createSubscription->execute($tenant, $plan);

    ProvisionTenantJob::dispatch(
        $tenant->id,
        [
            'name' => $validated['first_name'].' '.$validated['last_name'],
            'email' => $validated['email'],
        ]
    );

    return redirect()->to("/{$tenant->id}/sign-up?email=".$validated['email']);
}

}