<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Sync\SyncController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Billing\EstablishmentController;
use App\Http\Controllers\Billing\EmissionPointController;
use App\Http\Controllers\Billing\InvoiceSequenceBlockController;
use App\Http\Controllers\SriLogController;

/*
|--------------------------------------------------------------------------
| Tenant Routes
|--------------------------------------------------------------------------
|
| Here you can register the tenant routes for your application.
| These routes are loaded by the TenantRouteServiceProvider.
|
| Feel free to customize them however you want. Good luck!
|
*/

Route::middleware([
    'web',
    'auth',
    'tenant.active',
    InitializeTenancyByPath::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Route::get('/', function () {
    //     return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
    // });

    Route::get('/dashboard', fn() => inertia('tenant/dashboard'))->name('tenant.dashboard');
    
    // Companies
    Route::resource('companies', CompanyController::class)->names('tenant.companies');
    Route::post('companies/{company}/switch-environment', [CompanyController::class, 'switchEnvironment'])
        ->name('tenant.companies.switch-environment');
    
    // Customers
    Route::resource('customers', CustomerController::class)->names('tenant.customers');
    Route::get('customers-search', [CustomerController::class, 'search'])->name('tenant.customers.search');
    Route::post('customers/{customer}/toggle', [CustomerController::class, 'toggle'])
        ->name('tenant.customers.toggle');
    
    // Establishments
    Route::resource('establishments', EstablishmentController::class)->names('tenant.establishments');
    Route::post('establishments/{establishment}/toggle', [EstablishmentController::class, 'toggle'])
        ->name('tenant.establishments.toggle');
    Route::get('companies/{company}/establishments', [EstablishmentController::class, 'getByCompany'])
        ->name('tenant.establishments.by-company');
    
    // Emission Points
    Route::resource('emission-points', EmissionPointController::class)->names('tenant.emission-points');
    Route::post('emission-points/{emissionPoint}/toggle', [EmissionPointController::class, 'toggle'])
        ->name('tenant.emission-points.toggle');
    Route::post('emission-points/{emissionPoint}/assign-block', [EmissionPointController::class, 'assignBlock'])
        ->name('tenant.emission-points.assign-block');
    Route::get('establishments/{establishment}/emission-points', [EmissionPointController::class, 'getByEstablishment'])
        ->name('tenant.emission-points.by-establishment');
    
    // Sequence Blocks
    Route::resource('sequence-blocks', InvoiceSequenceBlockController::class)->names('tenant.sequence-blocks');
    Route::get('sequence-blocks-available', [InvoiceSequenceBlockController::class, 'getAvailable'])
        ->name('tenant.sequence-blocks.available');
    Route::post('sequence-blocks/{invoiceSequenceBlock}/mark-exhausted', 
        [InvoiceSequenceBlockController::class, 'markExhausted'])
        ->name('tenant.sequence-blocks.mark-exhausted');
    Route::get('sequence-blocks-stats', [InvoiceSequenceBlockController::class, 'stats'])
        ->name('tenant.sequence-blocks.stats');
    
    // Invoices
    Route::resource('invoices', InvoiceController::class)->names('tenant.invoices');
    
    // SRI Logs
    Route::get('sri-logs', [SriLogController::class, 'index'])->name('tenant.sri-logs.index');
    Route::get('sri-logs/{sriLog}', [SriLogController::class, 'show'])->name('tenant.sri-logs.show');
    Route::get('sri-logs-stats', [SriLogController::class, 'stats'])->name('tenant.sri-logs.stats');
    
    // Sync
    Route::prefix('sync')->name('tenant.sync.')->group(function () {
        Route::post('/validate', [SyncController::class, 'validateBatch'])->name('validate');
        Route::post('/invoices', [SyncController::class, 'syncInvoices'])->name('invoices');
    });
});