<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByDomainOrSubdomain;
use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Sync\SyncController;

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
    InitializeTenancyByDomainOrSubdomain::class,
    PreventAccessFromCentralDomains::class,
])->group(function () {
    // Route::get('/', function () {
    //     return 'This is your multi-tenant application. The id of the current tenant is ' . tenant('id');
    // });

    Route::get('/tenant/dashboard', fn() => inertia('dashboard'))->name('dashboard');
    
    Route::resource('invoices', InvoiceController::class);
    
    Route::prefix('sync')->name('sync.')->group(function () {
        Route::post('/validate', [SyncController::class, 'validateBatch'])->name('validate');
        Route::post('/invoices', [SyncController::class, 'syncInvoices'])->name('invoices');
    });
});