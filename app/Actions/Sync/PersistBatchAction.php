<?php

namespace App\Actions\Sync;

use App\Models\Invoice;
use App\Jobs\SendSriDocumentJob;
use Illuminate\Support\Facades\DB;

class PersistBatchAction
{
    public function execute(array $batch): array
    {
        return DB::transaction(function () use ($batch) {
            $invoiceIds = [];

            foreach ($batch['invoices'] as $invoiceData) {
                $invoice = Invoice::create([
                    'company_id' => $batch['company_id'],
                    'customer_id' => $invoiceData['customer_id'],
                    'establishment_id' => $invoiceData['establishment_id'],
                    'emission_point_id' => $invoiceData['emission_point_id'],
                    'sequence_block_id' => $invoiceData['sequence_block_id'],
                    'sequential' => $invoiceData['sequential'],
                    'subtotal' => $invoiceData['subtotal'],
                    'tax' => $invoiceData['tax'],
                    'total' => $invoiceData['total'],
                    'status' => 'sent',
                    'offline' => true,
                    'device_id' => $batch['device_id'],
                    'generated_at' => $invoiceData['generated_at'],
                    'synced_at' => now(),
                ]);

                // Items
                foreach ($invoiceData['items'] as $itemData) {
                    $invoice->items()->create($itemData);
                }

                $invoiceIds[] = $invoice->id;
            }

            return $invoiceIds;
        });
    }
}