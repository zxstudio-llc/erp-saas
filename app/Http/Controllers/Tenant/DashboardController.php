<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{User, Tenant, Invoice, Establishment, InvoiceSequenceBlock, Company};
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function __invoke(Request $request)
{
    $user = auth()->user();
    $company = Company::where('is_main', true)->first();

    if (!$company) {
        return Inertia::render('tenant/dashboard', [
            'stats' => $this->getDefaultStats(),
            'recent_invoices' => [],
            'setup' => [
                'missing_sequences' => true,
                'establishments' => ['data' => []],
            ],
            'environment' => config('app.env'),
        ]);
    }

    $mainEstablishment = Establishment::where('company_id', $company->id)
            ->where('code', '001')
            ->with(['emissionPoints', 'company' => function($query) {
                $query->select('id', 'business_name', 'trade_name', 'ruc', 'environment', 'is_main');
            }])
            ->get();

    $hasSequences = InvoiceSequenceBlock::whereHas('establishment', function($q) use ($company) {
        $q->where('company_id', $company->id);
    })->exists();

    return Inertia::render('tenant/dashboard', [
        'auth' => ['user' => $user],
        'mustChangePassword' => (bool) $user->must_change_password,
        'stats' => [
            'invoices_today' => 0, 
            'invoices_month' => 0, 
            'total_sales_month' => 0,
            'pending_authorizations' => 0,
            'active_customers' => 0,
            'available_sequences' => $hasSequences ? 1 : 0,
        ],
        'recent_invoices' => [],
        'setup' => [
            'missing_sequences' => !$hasSequences,
            'establishments' => [
                'data' => $mainEstablishment
            ],
        ],
        'environment' => config('app.env') === 'production' ? 'production' : 'test',
    ]);         
}

    private function getDefaultStats(): array
    {
        return [
            'invoices_today' => 0,
            'invoices_month' => 0,
            'total_sales_month' => 0,
            'pending_authorizations' => 0,
            'active_customers' => 0,
            'available_sequences' => 0,
        ];
    }
}