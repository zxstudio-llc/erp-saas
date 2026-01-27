<?php

namespace App\Http\Controllers\Sync;

use App\Http\Controllers\Controller;
use App\Actions\Sync\ValidateBatchAction;
use App\Actions\Sync\PersistBatchAction;
use App\Actions\Sync\DispatchSriJobsAction;
use Illuminate\Http\Request;

class SyncController extends Controller
{
    public function validateBatch(Request $request, ValidateBatchAction $action)
    {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'company_id' => 'required|exists:companies,id',
            'invoices' => 'required|array',
        ]);

        $errors = $action->execute($validated);

        return response()->json([
            'valid' => empty($errors),
            'errors' => $errors
        ]);
    }

    public function syncInvoices(
        Request $request,
        PersistBatchAction $persistBatch,
        DispatchSriJobsAction $dispatchJobs
    ) {
        $validated = $request->validate([
            'device_id' => 'required|string',
            'company_id' => 'required|exists:companies,id',
            'invoices' => 'required|array',
        ]);

        $invoiceIds = $persistBatch->execute($validated);
        $dispatchJobs->execute($invoiceIds);

        return response()->json([
            'success' => true,
            'synced_count' => count($invoiceIds)
        ]);
    }
}
