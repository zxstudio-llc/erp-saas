#!/bin/bash

# ERP SaaS - Generador masivo de archivos faltantes
# Este script crea todos los archivos críticos que faltan

echo "🚀 Iniciando generación masiva de archivos..."

# Crear directorios
mkdir -p resources/js/Pages/{Companies,Customers,Establishments,EmissionPoints,SequenceBlocks,Invoices,SriLogs,Plans,Subscriptions}
mkdir -p tests/{Unit,Feature,Browser}
mkdir -p storage/app/certificates
mkdir -p storage/schemas

# Configuración SRI en .env
cat >> .env.production << 'EOF'

# SRI Configuration
SRI_ENVIRONMENT=test
SRI_CERT_PASSWORD=your_password_here
SRI_WSDL_RECEPCION_TEST=https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WSDL_AUTORIZACION_TEST=https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
SRI_WSDL_RECEPCION_PROD=https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl
SRI_WSDL_AUTORIZACION_PROD=https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
EOF

# Páginas Index genéricas
for PAGE in Companies Customers Establishments EmissionPoints SequenceBlocks Plans Subscriptions; do
cat > resources/js/Pages/${PAGE}/Index.tsx << EOF
import TenantLayout from '@/Layouts/TenantLayout';
import { Head, Link } from '@inertiajs/react';
import { Table, Button, Badge } from '@/Components/UI';

export default function Index({ ${PAGE,,} }: any) {
    const columns = [
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Nombre' },
        { 
            key: 'actions', 
            header: 'Acciones',
            accessor: (row: any) => (
                <Link href={\`/${PAGE,,}/\${row.id}\`}>
                    <Button variant="secondary">Ver</Button>
                </Link>
            )
        }
    ];

    return (
        <TenantLayout>
            <Head title="${PAGE}" />
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-3xl font-bold">${PAGE}</h1>
                <Link href="/${PAGE,,}/create">
                    <Button variant="primary">Crear Nuevo</Button>
                </Link>
            </div>
            <div className="bg-white rounded-lg shadow">
                <Table columns={columns} data={${PAGE,,}.data} />
            </div>
        </TenantLayout>
    );
}
EOF
done

# Tests unitarios básicos
cat > tests/Unit/AssignSequenceBlockActionTest.php << 'EOF'
<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Actions\Billing\AssignSequenceBlockAction;
use App\Models\Establishment;
use App\Models\EmissionPoint;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AssignSequenceBlockActionTest extends TestCase
{
    use RefreshDatabase;

    public function test_assigns_consecutive_blocks()
    {
        $establishment = Establishment::factory()->create();
        $emissionPoint = EmissionPoint::factory()->create(['establishment_id' => $establishment->id]);
        
        $action = new AssignSequenceBlockAction();
        
        $block1 = $action->execute($establishment, $emissionPoint, 'device1', 100);
        $block2 = $action->execute($establishment, $emissionPoint, 'device2', 100);
        
        $this->assertEquals(1, $block1->from_number);
        $this->assertEquals(100, $block1->to_number);
        $this->assertEquals(101, $block2->from_number);
        $this->assertEquals(200, $block2->to_number);
    }
    
    public function test_prevents_collision()
    {
        $establishment = Establishment::factory()->create();
        $emissionPoint = EmissionPoint::factory()->create(['establishment_id' => $establishment->id]);
        
        $action = new AssignSequenceBlockAction();
        
        $block1 = $action->execute($establishment, $emissionPoint, 'device1', 100);
        $block2 = $action->execute($establishment, $emissionPoint, 'device2', 100);
        
        $this->assertNotEquals($block1->from_number, $block2->from_number);
        $this->assertNotEquals($block1->to_number, $block2->to_number);
    }
}
EOF

# Tests Feature
cat > tests/Feature/InvoiceCreationTest.php << 'EOF'
<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\{Company, Customer, Establishment, EmissionPoint, InvoiceSequenceBlock};
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use App\Jobs\BuildSriXmlJob;

class InvoiceCreationTest extends TestCase
{
    use RefreshDatabase;

    public function test_creates_invoice_with_correct_sequential()
    {
        Queue::fake();
        
        $company = Company::factory()->create();
        $customer = Customer::factory()->create();
        $establishment = Establishment::factory()->create(['company_id' => $company->id]);
        $emissionPoint = EmissionPoint::factory()->create(['establishment_id' => $establishment->id]);
        $block = InvoiceSequenceBlock::factory()->create([
            'establishment_id' => $establishment->id,
            'emission_point_id' => $emissionPoint->id,
            'from_number' => 1,
            'to_number' => 1000,
            'current_number' => 0
        ]);
        
        $response = $this->postJson('/invoices', [
            'company_id' => $company->id,
            'customer_id' => $customer->id,
            'establishment_id' => $establishment->id,
            'emission_point_id' => $emissionPoint->id,
            'sequence_block_id' => $block->id,
            'items' => [
                ['description' => 'Test', 'quantity' => 1, 'unit_price' => 100, 'subtotal' => 100]
            ]
        ]);
        
        $response->assertCreated();
        Queue::assertPushed(BuildSriXmlJob::class);
        
        $invoice = \App\Models\Invoice::first();
        $this->assertEquals('001-001-000000001', $invoice->sequential);
    }
}
EOF

echo "✅ Archivos generados exitosamente"
echo ""
echo "📋 Próximos pasos:"
echo "1. Obtener certificado .p12 de SRI y colocarlo en storage/app/certificates/"
echo "2. Configurar .env con SRI_CERT_PASSWORD"
echo "3. composer require phpseclib/phpseclib:^3.0"
echo "4. npm install && npm run build"
echo "5. php artisan test"