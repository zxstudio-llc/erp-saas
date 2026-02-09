<?php

namespace App\Http\Controllers;

use App\Models\{User, Tenant, Company};
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CompanyAltController extends Controller
{
    // public function index(): Response
    // {
    //     $user = auth()->user();

    //     $companies = Company::withCount(['establishments', 'invoices'])
    //         ->latest()
    //         ->paginate(15);

    //     return Inertia::render('companies/index', [
    //         'companies' => $companies,
    //         'auth' => [
    //             'user' => $user,
    //         ],
    //     ]);
    // }

    // public function store(Request $request): RedirectResponse
    // {
    //     $validated = $request->validate([
    //         'ruc' => 'required|string|size:13|unique:companies,ruc',
    //         'business_name' => 'required|string|max:255',
    //         'email' => 'required|email',
    //         'trade_name' => 'nullable|string|max:255',
    //         'environment' => 'required|in:test,prod',
    //         'address' => 'nullable|string|max:500',
    //         'special_taxpayer' => 'boolean',
    //         'accounting_required' => 'boolean',
    //     ]);

    //     $company = Company::create($validated);

    //     return redirect()
    //         ->route('companies.show', $company)
    //         ->with('success', 'Empresa creada exitosamente.');
    // }

    // public function show(Company $company): Response
    // {
    //     $company->load([
    //         'establishments.emissionPoints',
    //         'invoices' => fn($q) => $q->latest()->take(10)
    //     ]);

    //     return Inertia::render('companies/show', [
    //         'company' => $company,
    //         'stats' => [
    //             'total_invoices' => $company->invoices()->count(),
    //             'invoices_month' => $company->invoices()
    //                 ->whereMonth('created_at', now()->month)
    //                 ->count(),
    //             'total_authorized' => $company->invoices()
    //                 ->where('status', 'authorized')
    //                 ->count(),
    //         ]
    //     ]);
    // }

    // public function edit(Company $company): Response
    // {
    //     return Inertia::render('companies/edit', [
    //         'company' => $company
    //     ]);
    // }

    // public function update(Request $request, Company $company): RedirectResponse
    // {
    //     $rules = [
    //         'email' => 'required|email',
    //         'trade_name' => 'nullable|string|max:255',
    //         'environment' => 'required|in:test,prod',
    //         'address' => 'nullable|string|max:500',
    //         'special_taxpayer' => 'boolean',
    //         'accounting_required' => 'boolean',
    //     ];

    //     if (!$company->is_main) {
    //         $rules['ruc'] = 'required|string|size:13|unique:companies,ruc,' . $company->id;
    //         $rules['business_name'] = 'required|string|max:255';
    //     }

    //     $validated = $request->validate($rules);

    //     if ($company->is_main) {
    //         unset($validated['ruc'], $validated['business_name']);
    //     }

    //     $company->update($validated);

    //     return redirect()
    //         ->route('companies.show', $company)
    //         ->with('success', 'Empresa actualizada exitosamente.');
    // }

    // public function destroy(Company $company): RedirectResponse
    // {
    //     if ($company->is_main) {
    //         return back()->with('error', 'La empresa matriz no puede ser eliminada.');
    //     }

    //     if ($company->invoices()->exists()) {
    //         return back()->with('error', 'No se puede eliminar una sucursal con facturas emitidas.');
    //     }

    //     $company->delete();
    //     return redirect()->route('companies.index')->with('success', 'Sucursal eliminada.');
    // }

    // public function switchEnvironment(Company $company): RedirectResponse
    // {
    //     $newEnv = $company->environment === 'test' ? 'prod' : 'test';
        
    //     $company->update(['environment' => $newEnv]);

    //     return back()->with('success', 'Ambiente cambiado a ' . strtoupper($newEnv));
    // }
}
