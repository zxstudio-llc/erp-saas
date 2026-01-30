<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Actions\SaaS\{CreateTenantAction, CreateSubscriptionAction, ProvisionTenantDatabaseAction};
use App\Models\{Plan, User, Tenant};
use Illuminate\Support\Facades\{Hash, Auth, DB};
use Illuminate\Support\Str;
use App\Jobs\ProvisionTenantJob;
use Inertia\Inertia;

class OnboardingController extends Controller
{

    public function selectPlan()
    {
        $plans = Plan::where('active', true)->get();

        return Inertia::render('onboarding/select-plan', [
            'plans' => $plans
        ]);
    }

    public function register(Request $request)
    {
        $planId = $request->input('plan_id');
        $plan = Plan::findOrFail($planId);
        $plans = Plan::where('active', true)->get();
        
        return Inertia::render('onboarding/register', [
            'plan' => $plan,
            'plans' => $plans
        ]);
    }

    public function provision(
        Request $request,
        CreateTenantAction $createTenant,
        CreateSubscriptionAction $createSubscription
    ) {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:tenants,slug|alpha_dash',
            'plan_id' => 'required|exists:plans,id',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'organization_size' => 'nullable|string',
            'phone' => 'nullable|string',
        ]);
    
        try {
            DB::beginTransaction();
            
            // Creamos contraseña temporal
            $temporaryPassword = Str::random(32);

            $user = User::create([
                'name' => $validated['first_name'] . ' ' . $validated['last_name'],
                'email' => $validated['email'],
                'password' => Hash::make($temporaryPassword),
            ]);
            
            $tenant = $createTenant->execute(['slug' => $validated['slug']], $user);
            
            $plan = Plan::findOrFail($validated['plan_id']);
            $createSubscription->execute($tenant, $plan);
            
            ProvisionTenantJob::dispatch($tenant, [
                'name' => $user->name,
                'email' => $user->email,
                'password' => $user->password,
            ]);
            
            DB::commit();
            
            Auth::login($user);
            
            return redirect("/{$tenant->slug}/register");
            
        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
