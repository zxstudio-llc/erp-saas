<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\EmissionPoint;
use App\Models\Establishment;
use App\Actions\Billing\AssignSequenceBlockAction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EmissionPointController extends Controller
{
    public function index(): Response
    {
        $emissionPoints = EmissionPoint::with(['establishment.company'])
            ->withCount('sequenceBlocks')
            ->latest()
            ->paginate(20);

        return Inertia::render('emission-points/index', [
            'emissionPoints' => $emissionPoints
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('emission-points/create', [
            'establishments' => Establishment::with('company')
                ->where('active', true)
                ->get()
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'code' => [
                'required',
                'string',
                'size:3',
                'regex:/^[0-9]{3}$/',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = EmissionPoint::where('establishment_id', $request->establishment_id)
                        ->where('code', $value)
                        ->exists();
                    if ($exists) {
                        $fail('Este código de punto de emisión ya existe para este establecimiento.');
                    }
                }
            ],
            'name' => 'required|string|max:255',
            'active' => 'boolean',
        ]);

        $emissionPoint = EmissionPoint::create($validated);

        return redirect()
            ->route('emission-points.show', $emissionPoint)
            ->with('success', 'Punto de emisión creado exitosamente.');
    }

    public function show(EmissionPoint $emissionPoint): Response
    {
        $emissionPoint->load([
            'establishment.company',
            'sequenceBlocks' => fn($q) => $q->latest()->take(20)
        ]);

        return Inertia::render('emission-points/show', [
            'emissionPoint' => $emissionPoint,
            'stats' => [
                'total_blocks' => $emissionPoint->sequenceBlocks()->count(),
                'available_blocks' => $emissionPoint->sequenceBlocks()
                    ->where('status', 'available')
                    ->count(),
                'exhausted_blocks' => $emissionPoint->sequenceBlocks()
                    ->where('status', 'exhausted')
                    ->count(),
                'total_capacity' => $emissionPoint->sequenceBlocks()
                    ->sum(\DB::raw('to_number - from_number + 1')),
                'used_numbers' => $emissionPoint->sequenceBlocks()
                    ->sum(\DB::raw('current_number - from_number + 1')),
            ]
        ]);
    }

    public function edit(EmissionPoint $emissionPoint): Response
    {
        return Inertia::render('emission-points/edit', [
            'emissionPoint' => $emissionPoint->load('establishment'),
            'establishments' => Establishment::with('company')->get()
        ]);
    }

    public function update(Request $request, EmissionPoint $emissionPoint): RedirectResponse
    {
        $validated = $request->validate([
            'establishment_id' => 'required|exists:establishments,id',
            'code' => [
                'required',
                'string',
                'size:3',
                'regex:/^[0-9]{3}$/',
                function ($attribute, $value, $fail) use ($request, $emissionPoint) {
                    $exists = EmissionPoint::where('establishment_id', $request->establishment_id)
                        ->where('code', $value)
                        ->where('id', '!=', $emissionPoint->id)
                        ->exists();
                    if ($exists) {
                        $fail('Este código de punto de emisión ya existe para este establecimiento.');
                    }
                }
            ],
            'name' => 'required|string|max:255',
            'active' => 'boolean',
        ]);

        $emissionPoint->update($validated);

        return redirect()
            ->route('emission-points.show', $emissionPoint)
            ->with('success', 'Punto de emisión actualizado exitosamente.');
    }

    public function destroy(EmissionPoint $emissionPoint): RedirectResponse
    {
        if ($emissionPoint->sequenceBlocks()->exists()) {
            return back()->with('error', 'No se puede eliminar un punto de emisión con bloques de secuenciales.');
        }

        $emissionPoint->delete();

        return redirect()
            ->route('emission-points.index')
            ->with('success', 'Punto de emisión eliminado exitosamente.');
    }

    public function toggle(EmissionPoint $emissionPoint): RedirectResponse
    {
        $emissionPoint->update(['active' => !$emissionPoint->active]);

        $status = $emissionPoint->active ? 'activado' : 'desactivado';
        
        return back()->with('success', "Punto de emisión {$status} exitosamente.");
    }

    public function assignBlock(Request $request, EmissionPoint $emissionPoint, AssignSequenceBlockAction $action): RedirectResponse
    {
        $validated = $request->validate([
            'device_id' => 'required|string|max:255',
            'block_size' => 'required|integer|min:10|max:10000',
        ]);

        try {
            $block = $action->execute(
                $emissionPoint->establishment,
                $emissionPoint,
                $validated['device_id'],
                $validated['block_size']
            );

            return back()->with('success', "Bloque asignado: {$block->from_number} - {$block->to_number}");
        } catch (\Exception $e) {
            return back()->with('error', 'Error al asignar bloque: ' . $e->getMessage());
        }
    }

    public function getByEstablishment(Establishment $establishment)
    {
        $emissionPoints = $establishment->emissionPoints()
            ->where('active', true)
            ->get();

        return response()->json($emissionPoints);
    }
}