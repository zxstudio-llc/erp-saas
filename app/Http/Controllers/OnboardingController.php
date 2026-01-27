<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Actions\SaaS\{CreateTenantAction, CreateSubscriptionAction, ProvisionTenantDatabaseAction};
use App\Models\{Plan, User, Tenant};
use Illuminate\Support\Facades\{Hash, Auth, DB};
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
        
        return Inertia::render('onboarding/register', [
            'plan' => $plan
        ]);
    }

    public function provision(
        Request $request,
        CreateTenantAction $createTenant,
        CreateSubscriptionAction $createSubscription,
        ProvisionTenantDatabaseAction $provisionDb
    ) {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'slug' => 'required|string|max:50|unique:tenants,slug|alpha_dash',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'plan_id' => 'required|exists:plans,id',
        ]);

        try {
            DB::beginTransaction();
            
            $tenant = $createTenant->execute([
                'slug' => $validated['slug']
            ]);
            
            $plan = Plan::findOrFail($validated['plan_id']);
            $subscription = $createSubscription->execute($tenant, $plan);
            
            $user = User::create([
                'name' => $validated['company_name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
            ]);
            
            $provisionDb->execute($tenant);
            
            $tenant->run(function () use ($user, $validated) {
                $tenantUser = \App\Models\User::create([
                    'name' => $validated['company_name'],
                    'email' => $validated['email'],
                    'password' => Hash::make($validated['password']),
                ]);
                
                if (class_exists(\Spatie\Permission\Models\Role::class)) {
                    $tenantUser->assignRole('admin');
                }
            });
            
            DB::commit();
            
            Auth::login($user);
            
            return redirect("/{$tenant->slug}/dashboard")->with('success', '¡Cuenta creada exitosamente! Bienvenido.');
            
        } catch (\Exception $e) {
            DB::rollBack();
            
            return back()->with('error', 'Error al crear la cuenta: ' . $e->getMessage());
        }
    }
}
