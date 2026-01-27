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

class SendSriDocumentJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $backoff = [60, 300, 900];
    
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
    public function handle(SendSriDocumentAction $action): void
    {
        $invoice = Invoice::findOrFail($this->invoiceId);
        $action->execute($invoice);
        
        CheckSriAuthorizationJob::dispatch($this->invoiceId)->delay(now()->addSeconds(30));
    }

    public function failed(\Throwable $exception): void
    {
        $invoice = Invoice::findOrFail($this->invoiceId);
        $invoice->update(['status' => 'error']);
    }
}
