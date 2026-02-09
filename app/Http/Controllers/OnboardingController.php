<?php

namespace App\Http\Controllers;

use App\Actions\SaaS\CreateSubscriptionAction;
use App\Jobs\ProvisionTenantJob;
use App\Models\Plan;
use App\Models\Tenant;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;

class OnboardingController extends Controller
{
    
    public function selectPlan()
    {
        return Inertia::render('onboarding/select-plan', [
            'plans' => Plan::where('active', true)->get(),
        ]);
    }
    
    public function register(Request $request)
    {
        $planId = $request->input('plan_id');

        return Inertia::render('onboarding/register', [
            'plan' => Plan::findOrFail($planId),
            'plans' => Plan::where('active', true)->get(),
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
            'dni' => 'required|string|max:20|unique:tenants,dni',
        ]);

        $tenant = Tenant::create([
            'id' => $validated['slug'],
            'slug' => $validated['slug'],
            'database' => 'erp'.$validated['slug'],
            'status' => 'active',
            'company_name' => $validated['company_name'],
            'dni'          => $validated['dni'],
        ]);

        $plan = Plan::findOrFail($validated['plan_id']);
        $createSubscription->execute($tenant, $plan);

        tenancy()->initialize($tenant);

        $tempPassword = 'TempPass123!';

        $user = User::create([
            'name' => $validated['first_name'].' '.$validated['last_name'],
            'email' => $validated['email'],
            'password' => Hash::make($tempPassword),
            'must_change_password' => true,
        ]);

        $company = Company::create([
            'ruc' => $validated['dni'],
            'business_name' => $validated['company_name'],
            'trade_name' => $validated['company_name'],
            'email' => $validated['email'],
            'environment' => 'test',
            'address' => 'Dirección Matriz',
            'is_main' => true,
        ]);

        $establishment = $company->establishments()->create([
            'code' => '001',
            'name' => 'Casa Matriz',
            'address' => 'Dirección Matriz',
            'active' => true,
        ]);
        
        $establishment->emissionPoints()->create([
            'code' => '001',
            'name' => 'Punto de Venta Principal',
            'active' => true,
        ]);

        ProvisionTenantJob::dispatch($tenant->id, [
            'name' => $validated['first_name'].' '.$validated['last_name'],
            'email' => $validated['email'],
        ]);

        return redirect()->route('onboarding.signup.show', [
            'tenant' => $tenant->slug,
            'email' => $validated['email'],
            'tempPassword' => $tempPassword,
        ]);
    }

    public function provisionShow(Request $request)
    {
        $tenant = $request->query('tenant');
        $email = $request->query('email');
        $tempPassword = $request->query('tempPassword');

        return Inertia::render('onboarding/provisioning', [
            'tenant' => $tenant,
            'email' => $email,
            'tempPassword' => $tempPassword,
        ]);
    }
}
