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
