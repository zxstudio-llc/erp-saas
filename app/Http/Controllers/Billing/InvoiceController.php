<?php

namespace App\Http\Controllers\Billing;

use App\Models\Invoice;
use App\Models\InvoiceSequenceBlock;
use App\Actions\Billing\AssignSequenceBlockAction;
use App\Jobs\BuildSriXmlJob;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index()
    {
        return Inertia::render('invoices/index', [
            'invoices' => Invoice::with(['customer', 'company'])
                ->latest()
                ->paginate(20)
        ]);
    }

    public function create()
    {
        return Inertia::render('invoices/create', [
            'sequenceBlocks' => InvoiceSequenceBlock::where('status', 'available')->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'customer_id' => 'required|exists:customers,id',
            'establishment_id' => 'required|exists:establishments,id',
            'emission_point_id' => 'required|exists:emission_points,id',
            'sequence_block_id' => 'required|exists:invoice_sequence_blocks,id',
            'items' => 'required|array|min:1',
        ]);

        $block = InvoiceSequenceBlock::findOrFail($validated['sequence_block_id']);
        $sequential = $block->getNextSequential();

        $subtotal = collect($validated['items'])->sum('subtotal');
        $tax = $subtotal * 0.15;
        $total = $subtotal + $tax;

        $invoice = Invoice::create([
            ...$validated,
            'sequential' => $sequential,
            'subtotal' => $subtotal,
            'tax' => $tax,
            'total' => $total,
            'status' => 'offline_pending',
            'generated_at' => now(),
        ]);

        foreach ($validated['items'] as $item) {
            $invoice->items()->create($item);
        }

        BuildSriXmlJob::dispatch($invoice->id);

        return redirect()->route('invoices.show', $invoice);
    }

    public function show(Invoice $invoice)
    {
        return Inertia::render('invoices/show', [
            'invoice' => $invoice->load(['customer', 'items', 'sriLogs'])
        ]);
    }
}