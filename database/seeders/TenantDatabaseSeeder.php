<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Company;
use App\Models\Establishment;
use App\Models\EmissionPoint;
use App\Models\InvoiceSequenceBlock;
use App\Models\Customer;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class TenantDatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = Role::create(['name' => 'admin']);
        $contabilidad = Role::create(['name' => 'contabilidad']);
        $facturador = Role::create(['name' => 'facturador']);

        Permission::create(['name' => 'invoices.create']);
        Permission::create(['name' => 'invoices.view']);
        Permission::create(['name' => 'invoices.edit']);
        Permission::create(['name' => 'invoices.delete']);
        Permission::create(['name' => 'sri.send']);
        Permission::create(['name' => 'accounting.view']);
        Permission::create(['name' => 'users.manage']);

        $admin->givePermissionTo(Permission::all());
        $facturador->givePermissionTo(['invoices.create', 'invoices.view', 'sri.send']);
        $contabilidad->givePermissionTo(['invoices.view', 'accounting.view']);

        // Cliente de ejemplo
        Customer::create([
            'identification_type' => 'RUC',
            'identification' => '9999999999999',
            'business_name' => 'Consumidor Final',
            'email' => 'consumidor@anahisoft.com',
        ]);
    }
}
