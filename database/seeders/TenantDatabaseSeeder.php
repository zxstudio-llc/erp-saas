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

        // Compañía de ejemplo
        $company = Company::create([
            'ruc' => '1234567890001',
            'business_name' => 'Empresa Demo S.A.',
            'trade_name' => 'Demo',
            'environment' => 'test',
            'address' => 'Quito, Ecuador',
        ]);

        // Establecimiento
        $establishment = Establishment::create([
            'company_id' => $company->id,
            'code' => '001',
            'name' => 'Matriz',
            'address' => 'Quito',
        ]);

        // Punto de emisión
        $emissionPoint = EmissionPoint::create([
            'establishment_id' => $establishment->id,
            'code' => '001',
            'name' => 'Caja 1',
        ]);

        // Bloque inicial de secuenciales
        InvoiceSequenceBlock::create([
            'establishment_id' => $establishment->id,
            'emission_point_id' => $emissionPoint->id,
            'from_number' => 1,
            'to_number' => 1000,
            'current_number' => 0,
            'status' => 'available',
        ]);

        // Cliente de ejemplo
        Customer::create([
            'identification_type' => 'RUC',
            'identification' => '9999999999001',
            'business_name' => 'Consumidor Final',
            'email' => 'consumidor@example.com',
        ]);
    }
}
