<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Models\Plan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Jobs\ProvisionTenantJob;
use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use Laravel\Fortify\Contracts\CreatesNewUsers;
use App\Actions\SaaS\{CreateTenantAction, CreateSubscriptionAction, ProvisionTenantDatabaseAction};

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    public function __construct(
        protected CreateTenantAction $createTenant,
        protected CreateSubscriptionAction $createSubscription,
        protected ProvisionTenantDatabaseAction $provisionDb
    ) {}

    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
            'company_name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'alpha_dash', 'max:50', 'unique:tenants,slug'],
            'plan_id' => ['required', 'exists:plans,id'],
        ])->validate();

        $tenant = $this->createTenant->execute(['slug' => $input['slug']]);

        $user = DB::transaction(function () use ($input, $tenant) {
            $plan = Plan::findOrFail($input['plan_id']);
            $this->createSubscription->execute($tenant, $plan);
    
            return User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($input['password']),
            ]);
        });

        \App\Jobs\ProvisionTenantJob::dispatch($tenant, [
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($input['password']),
        ]);

        return $user;
    }
}