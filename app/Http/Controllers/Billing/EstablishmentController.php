<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\Establishment;
use App\Models\Company;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class EstablishmentController extends Controller
{
    public function index(): Response
    {
        $establishments = Establishment::with(['company', 'emissionPoints'])
            ->withCount('sequenceBlocks')
            ->latest()
            ->paginate(20);

        return Inertia::render('establishments/index', [
            'establishments' => $establishments
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('establishments/create', [
            'companies' => Company::where('active', true)->get(['id', 'business_name'])
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'code' => [
                'required',
                'string',
                'size:3',
                'regex:/^[0-9]{3}$/',
                function ($attribute, $value, $fail) use ($request) {
                    $exists = Establishment::where('company_id', $request->company_id)
                        ->where('code', $value)
                        ->exists();
                    if ($exists) {
                        $fail('Este código de establecimiento ya existe para esta empresa.');
                    }
                }
            ],
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'active' => 'boolean',
        ]);

        $establishment = Establishment::create($validated);

        return redirect()
            ->route('establishments.show', $establishment)
            ->with('success', 'Establecimiento creado exitosamente.');
    }

    public function show(Establishment $establishment): Response
    {
        $establishment->load([
            'company',
            'emissionPoints',
            'sequenceBlocks' => fn($q) => $q->latest()
        ]);

        return Inertia::render('establishments/show', [
            'establishment' => $establishment,
            'stats' => [
                'emission_points' => $establishment->emissionPoints()->count(),
                'active_blocks' => $establishment->sequenceBlocks()
                    ->where('status', 'available')
                    ->count(),
                'total_sequences' => $establishment->sequenceBlocks()
                    ->sum(\DB::raw('to_number - from_number + 1')),
            ]
        ]);
    }

    public function edit(Establishment $establishment): Response
    {
        return Inertia::render('establishments/edit', [
            'establishment' => $establishment->load('company'),
            'companies' => Company::all(['id', 'business_name'])
        ]);
    }

    public function update(Request $request, Establishment $establishment): RedirectResponse
    {
        $validated = $request->validate([
            'company_id' => 'required|exists:companies,id',
            'code' => [
                'required',
                'string',
                'size:3',
                'regex:/^[0-9]{3}$/',
                function ($attribute, $value, $fail) use ($request, $establishment) {
                    $exists = Establishment::where('company_id', $request->company_id)
                        ->where('code', $value)
                        ->where('id', '!=', $establishment->id)
                        ->exists();
                    if ($exists) {
                        $fail('Este código de establecimiento ya existe para esta empresa.');
                    }
                }
            ],
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:500',
            'active' => 'boolean',
        ]);

        $establishment->update($validated);

        return redirect()
            ->route('establishments.show', $establishment)
            ->with('success', 'Establecimiento actualizado exitosamente.');
    }

    public function destroy(Establishment $establishment): RedirectResponse
    {
        if ($establishment->emissionPoints()->exists()) {
            return back()->with('error', 'No se puede eliminar un establecimiento con puntos de emisión.');
        }

        if ($establishment->sequenceBlocks()->exists()) {
            return back()->with('error', 'No se puede eliminar un establecimiento con bloques de secuenciales.');
        }

        $establishment->delete();

        return redirect()
            ->route('establishments.index')
            ->with('success', 'Establecimiento eliminado exitosamente.');
    }

    public function toggle(Establishment $establishment): RedirectResponse
    {
        $establishment->update(['active' => !$establishment->active]);

        $status = $establishment->active ? 'activado' : 'desactivado';
        
        return back()->with('success', "Establecimiento {$status} exitosamente.");
    }

    public function getByCompany(Company $company)
    {
        $establishments = $company->establishments()
            ->where('active', true)
            ->with('emissionPoints')
            ->get();

        return response()->json($establishments);
    }
}