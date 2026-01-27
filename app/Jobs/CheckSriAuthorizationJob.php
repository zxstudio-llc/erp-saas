<?php

namespace App\Jobs;

use App\Models\Invoice;
use App\Actions\SRI\BuildSriXmlAction;
use App\Actions\SRI\SignSriDocumentAction;
use App\Actions\SRI\SendSriDocumentAction;
use App\Actions\SRI\CheckSriAuthorizationAction;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels; 

class CheckSriAuthorizationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 10;
    public $backoff = 30;

    /**
     * Create a new job instance.
     */
    public function __construct(public int $invoiceId)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(CheckSriAuthorizationAction $action): void
    {
        $invoice = Invoice::findOrFail($this->invoiceId);
        
        if ($invoice->status === 'authorized') {
            return;
        }

        $action->execute($invoice);
    }
}
