<?php

namespace App\Actions\Sync;

use App\Models\Invoice;
use App\Jobs\SendSriDocumentJob;
use Illuminate\Support\Facades\DB;

class ValidateBatchAction
{
    public function execute(array $batch): array
    {
        $errors = [];

        foreach ($batch['invoices'] as $index => $invoiceData) {
            // Validar secuencial no duplicado
            $exists = Invoice::where('sequential', $invoiceData['sequential'])->exists();
            if ($exists) {
                $errors[] = "Invoice {$index}: Sequential already exists";
            }

            // Validar bloque de secuencia
            // TODO: Implementar validación de rango
        }

        return $errors;
    }
}