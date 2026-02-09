<?php

namespace App\Http\Controllers;

use App\Models\Company;
use App\Models\Establishment;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class CompanyController extends Controller
{
    
    public function index(): Response
    {
        $company = Company::with([
            'establishments.emissionPoints',
            'invoices' => fn($q) => $q->latest()->take(5)
        ])
        ->withCount(['establishments', 'invoices'])
        ->where('is_main', true)
        ->firstOrFail();

        return Inertia::render('companies/index', [
            'company' => $company,
            'stats' => [
                'total_invoices'    => $company->invoices_count,
                'invoices_month'    => $company->invoices()->whereMonth('created_at', now()->month)->count(),
                'active_locations'  => $company->establishments_count,
            ],
            'next_codes' => [
                'establishment' => Establishment::nextCodeForCompany($company->id),
                'emission_point' => '001',
            ]
        ]);
    }

    public function update(Request $request, Company $company): RedirectResponse
    {
        $rules = [
            'email' => 'required|email',
            'trade_name' => 'nullable|string|max:255',
            'environment' => 'required|in:test,prod',
            'address' => 'nullable|string|max:500',
            'special_taxpayer' => 'boolean',
            'accounting_required' => 'boolean',
        ];
        
        if (!$company->is_main) {
            $rules['ruc'] = 'required|string|size:13|unique:companies,ruc,' . $company->id;
            $rules['business_name'] = 'required|string|max:255';
        }

        $validated = $request->validate($rules);

        if ($company->is_main) {
            unset($validated['ruc'], $validated['business_name']);
        }

        $company->update($validated);

        return back()->with('success', 'Información actualizada correctamente.');
    }

    public function switchEnvironment(Company $company): RedirectResponse
    {
        $newEnv = $company->environment === 'test' ? 'prod' : 'test';
        $company->update(['environment' => $newEnv]);

        return back()->with('success', 'Ambiente de facturación cambiado a ' . strtoupper($newEnv));
    }
}