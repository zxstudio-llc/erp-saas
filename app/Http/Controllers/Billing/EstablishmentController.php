<?php

namespace App\Http\Controllers\Billing;

use App\Http\Controllers\Controller;
use App\Models\{Establishment, InvoiceSequenceBlock, Company};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;

class EstablishmentController extends Controller
{
    public function index(Request $request): Response
    {
        
        $company = Company::first();
        $companyId = $company->id;

        $establishments = Establishment::with([
                'company:id,business_name,ruc,environment',
                'emissionPoints',
                'sequenceBlocks'
            ])
            ->withCount(['emissionPoints', 'sequenceBlocks'])
            ->latest()
            ->paginate(20);

        $nextEmissionPoint = '001'; 

        return Inertia::render('establishments/index', [
            'establishments' => $establishments,
            'next_codes' => [
                'establishment' => Establishment::nextCodeForCompany($companyId),
                'emission_point' => $nextEmissionPoint,
            ]
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'company_id'           => 'required|exists:companies,id',
            'name'                 => 'required|string|max:255',
            'address'              => 'required|string|max:500',
            'latitude'             => 'string|max:500',
            'longitude'            => 'string|max:500',
            'create_default_point' => 'boolean',
            'point_code'           => 'required_if:create_default_point,true|string|size:3',
        ]);

        try {
            DB::beginTransaction();

            $nextCode = Establishment::nextCodeForCompany($validated['company_id']);

            $establishment = Establishment::create([
                'company_id' => $validated['company_id'],
                'code'       => $nextCode,
                'name'       => $validated['name'],
                'address'    => $validated['address'],
                'latitude'   => $validated['latitude'],
                'longitude'  => $validated['longitude'],
                'active'     => true,
            ]);

            if ($request->create_default_point) {
                $pointCode = $request->point_code ?? '001';
                
                $emissionPoint = $establishment->emissionPoints()->create([
                    'code'   => $pointCode,
                    'name'   => 'Punto de Venta ' . $pointCode,
                    'active' => true,
                ]);

                $establishment->sequenceBlocks()->create([
                    'emission_point_id' => $emissionPoint->id,
                    'from_number'       => 1,
                    'to_number'         => 1000,
                    'current_number'    => 0,
                    'status'            => InvoiceSequenceBlock::STATUS_AVAILABLE,
                    'assigned_at'       => now(),
                ]);
            }

            DB::commit();
            return back()->with('success', "Sucursal {$nextCode} registrada correctamente.");

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Error: ' . $e->getMessage());
        }
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
            'latitude' => 'string|max:500',
            'longitude' => 'string|max:500',
            'active' => 'boolean',
        ]);

        $establishment->update($validated);

        return back()->with('success', 'Establecimiento actualizado exitosamente.');
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
        if ($establishment->is_main) {
            return back()->with('error', 'No se puede desactivar el establecimiento matriz.');
        }

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