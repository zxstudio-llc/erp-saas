<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Plan;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        Plan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'price' => 29.99,
            'billing_cycle' => 'monthly',
            'limits' => [
                'max_users' => 3,
                'max_invoices_month' => 100,
                'max_companies' => 1,
            ],
            'active' => true,
        ]);

        Plan::create([
            'name' => 'Professional',
            'slug' => 'professional',
            'price' => 79.99,
            'billing_cycle' => 'monthly',
            'limits' => [
                'max_users' => 10,
                'max_invoices_month' => 1000,
                'max_companies' => 3,
            ],
            'active' => true,
        ]);

        Plan::create([
            'name' => 'Enterprise',
            'slug' => 'enterprise',
            'price' => 199.99,
            'billing_cycle' => 'monthly',
            'limits' => [
                'max_users' => -1, // ilimitado
                'max_invoices_month' => -1,
                'max_companies' => -1,
            ],
            'active' => true,
        ]);
    }
}

