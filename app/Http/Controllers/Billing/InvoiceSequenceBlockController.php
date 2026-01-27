<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\InvoiceSequenceBlock;
use App\Models\Establishment;
use App\Models\EmissionPoint;
use App\Actions\Billing\AssignSequenceBlockAction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class InvoiceSequenceBlockController extends Controller
{
    public function index(Request $request): Response
    {
        $query = InvoiceSequenceBlock::with(['establishment.company', 'emissionPoint']);

        if ($status = $request->input('status')) {
            $query->where('status', $status);
        }

        if ($establishmentId = $request->input('establishment_id')) {
            $query->where('establishment_id', $establishmentId);
        }

        $blocks = $query->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('sequence-blocks/index', [
            'blocks' => $blocks,
            'filters' => $request->only(['status', 'establishment_id']),
            'establishments' => Establishment::with('company')->get(['id', 'name', 'company_id'])
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('sequence-blocks/create', [
            'establishments' => Establishment::with(['company', 'emissionPoints'])->get()
        ]);
    }

    public function store(Request $request, AssignSequenceBlockAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'emission_point_id' => 'required|exists:emission_points,id',
            'device_id' => 'nullable|string|max:255',
            'block_size' => 'required|integer|min:10|max:10000',
        ]);

        $establishment = Establishment::findOrFail($validated['establishment_id']);
        $emissionPoint = EmissionPoint::findOrFail($validated['emission_point_id']);

        // Verificar que el punto de emisión pertenece al establecimiento
        if ($emissionPoint->establishment_id !== $establishment->id) {
            return back()->with('error', 'El punto de emisión no pertenece al establecimiento seleccionado.');
        }

        try {
            $block = $action->execute(
                $establishment,
                $emissionPoint,
                $validated['device_id'] ?? 'manual',
                $validated['block_size']
            );

            return redirect()
                ->route('sequence-blocks.show', $block)
                ->with('success', 'Bloque de secuenciales creado exitosamente.');
        } catch (\Exception $e) {
            return back()->with('error', 'Error al crear bloque: ' . $e->getMessage());
        }
    }

    public function show(InvoiceSequenceBlock $invoiceSequenceBlock): Response
    {
        $invoiceSequenceBlock->load([
            'establishment.company',
            'emissionPoint'
        ]);

        $usage = $invoiceSequenceBlock->current_number - $invoiceSequenceBlock->from_number + 1;
        $capacity = $invoiceSequenceBlock->to_number - $invoiceSequenceBlock->from_number + 1;
        $usagePercent = $capacity > 0 ? round(($usage / $capacity) * 100, 2) : 0;

        return Inertia::render('sequence-blocks/show', [
            'block' => $invoiceSequenceBlock,
            'stats' => [
                'usage' => $usage,
                'capacity' => $capacity,
                'usage_percent' => $usagePercent,
                'available' => $invoiceSequenceBlock->to_number - $invoiceSequenceBlock->current_number,
            ]
        ]);
    }

    public function edit(InvoiceSequenceBlock $invoiceSequenceBlock): Response
    {
        return Inertia::render('sequence-blocks/edit', [
            'block' => $invoiceSequenceBlock->load(['establishment', 'emissionPoint']),
        ]);
    }

    public function update(Request $request, InvoiceSequenceBlock $invoiceSequenceBlock): RedirectResponse
    {
        $validated = $request->validate([
            'device_id' => 'nullable|string|max:255',
            'status' => 'required|in:available,exhausted',
        ]);

        // Solo permitir actualizar device_id y status
        $invoiceSequenceBlock->update($validated);

        return redirect()
            ->route('sequence-blocks.show', $invoiceSequenceBlock)
            ->with('success', 'Bloque actualizado exitosamente.');
    }

    public function destroy(InvoiceSequenceBlock $invoiceSequenceBlock): RedirectResponse
    {
        // Verificar que no haya sido usado
        if ($invoiceSequenceBlock->current_number > $invoiceSequenceBlock->from_number - 1) {
            return back()->with('error', 'No se puede eliminar un bloque que ya ha sido usado.');
        }

        $invoiceSequenceBlock->delete();

        return redirect()
            ->route('sequence-blocks.index')
            ->with('success', 'Bloque eliminado exitosamente.');
    }

    public function getAvailable(Request $request)
    {
        $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'emission_point_id' => 'required|exists:emission_points,id',
        ]);

        $blocks = InvoiceSequenceBlock::where('establishment_id', $request->establishment_id)
            ->where('emission_point_id', $request->emission_point_id)
            ->where('status', 'available')
            ->get();

        return response()->json($blocks);
    }

    public function markExhausted(InvoiceSequenceBlock $invoiceSequenceBlock): RedirectResponse
    {
        $invoiceSequenceBlock->update(['status' => 'exhausted']);

        return back()->with('success', 'Bloque marcado como agotado.');
    }

    public function stats()
    {
        $stats = [
            'total_blocks' => InvoiceSequenceBlock::count(),
            'available_blocks' => InvoiceSequenceBlock::where('status', 'available')->count(),
            'exhausted_blocks' => InvoiceSequenceBlock::where('status', 'exhausted')->count(),
            'total_capacity' => InvoiceSequenceBlock::sum(\DB::raw('to_number - from_number + 1')),
            'used_numbers' => InvoiceSequenceBlock::sum(\DB::raw('GREATEST(0, current_number - from_number + 1)')),
            'by_establishment' => InvoiceSequenceBlock::with('establishment:id,name')
                ->select('establishment_id', \DB::raw('count(*) as count'))
                ->groupBy('establishment_id')
                ->get(),
        ];

        return response()->json($stats);
    }
}