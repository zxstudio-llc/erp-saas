<?php

namespace App\Actions\Sync;

use App\Models\Invoice;
use App\Jobs\SendSriDocumentJob;
use Illuminate\Support\Facades\DB;

class DispatchSriJobsAction
{
    public function execute(array $invoiceIds): void
    {
        foreach ($invoiceIds as $invoiceId) {
            SendSriDocumentJob::dispatch($invoiceId);
        }
    }
}
