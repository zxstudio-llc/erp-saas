<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use Stancl\Tenancy\Middleware\InitializeTenancyByPath;
// use Stancl\Tenancy\Middleware\PreventAccessFromCentralDomains;
use App\Http\Controllers\Billing\InvoiceController;
use App\Http\Controllers\Tenant\Signup\RegisterController;
use App\Http\Controllers\Sync\SyncController;
use App\Http\Controllers\CompanyController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\Billing\EstablishmentController;
use App\Http\Controllers\Billing\EmissionPointController;
use App\Http\Controllers\Billing\InvoiceSequenceBlockController;
use App\Http\Controllers\SriLogController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\AuthController;
use App\Http\Controllers\Tenant\ForcedPasswordController;
use App\Http\Controllers\Tenant\Settings\PasswordController;
use App\Http\Controllers\Tenant\Settings\ProfileController;
use App\Http\Controllers\Tenant\Settings\TwoFactorAuthenticationController;
use App\Http\Middleware\EnsureTenantIsActive;
use Inertia\Inertia;

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
Route::prefix('{tenant}')
->middleware([
    'web',
    InitializeTenancyByPath::class,
])
->name('tenant.')
->group(function () {
        Route::prefix('sign-in')->name('sign-in.')->group(function () {
            Route::get('/', [AuthController::class, 'showLogin'])->name('show');
            Route::post('/', [AuthController::class, 'login']);
        });
        Route::get('/sign-up', [RegisterController::class, 'show'])->name('sign-up.show');
        Route::post('/sign-up', [RegisterController::class, 'store'])->name('sign-up.store');
        Route::prefix('password')->name('password.')->group(function () {
            Route::put('/force', [ForcedPasswordController::class, 'update'])->name('force.update');
        });
        

        Route::middleware(['tenant.auth', 'tenant.active', 'tenant.provisions', 'force.password.change'])->group(function () {

        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        
        // Companies
        Route::resource('companies', CompanyController::class)->names('companies');
        Route::post('companies/{company}/switch-environment', [CompanyController::class, 'switchEnvironment'])
            ->name('companies.switch-environment');
        
        // Customers
        Route::prefix('customers')->name('customers.')->group(function () {
        
            // Rutas principales (Listado, Guardado, Actualización, Eliminación)
            Route::get('/', [CustomerController::class, 'index'])->name('index');
            Route::post('/', [CustomerController::class, 'store'])->name('store');
            Route::put('/{customer}', [CustomerController::class, 'update'])->name('update');
            Route::delete('/{customer}', [CustomerController::class, 'destroy'])->name('destroy');
    
            // Búsqueda y Filtros
            Route::get('/search', [CustomerController::class, 'search'])->name('search');
    
            // Acciones de Estado y Soft Delete
            Route::post('/{customer}/toggle', [CustomerController::class, 'toggle'])->name('toggle');
            Route::post('/{id}/restore', [CustomerController::class, 'restore'])->name('restore');
            
        });
        
        // Establishments
        Route::resource('establishments', EstablishmentController::class)->names('establishments');
        Route::post('/{establishment}/toggle', [EstablishmentController::class, 'toggle'])
            ->name('establishments.toggle');
        
        // Emission Points
        Route::resource('emission-points', EmissionPointController::class)->names('emission-points');
        Route::post('emission-points/{emissionPoint}/toggle', [EmissionPointController::class, 'toggle'])
            ->name('emission-points.toggle');
        Route::post('emission-points/{emissionPoint}/assign-block', [EmissionPointController::class, 'assignBlock'])
            ->name('emission-points.assign-block');
        Route::get('establishments/{establishment}/emission-points', [EmissionPointController::class, 'getByEstablishment'])
            ->name('emission-points.by-establishment');
        
        // Sequence Blocks
        Route::resource('sequence-blocks', InvoiceSequenceBlockController::class)->names('sequence-blocks');
        Route::get('sequence-blocks-available', [InvoiceSequenceBlockController::class, 'getAvailable'])
            ->name('sequence-blocks.available');
        Route::post('sequence-blocks/{invoiceSequenceBlock}/mark-exhausted', 
            [InvoiceSequenceBlockController::class, 'markExhausted'])
            ->name('sequence-blocks.mark-exhausted');
        Route::get('sequence-blocks-stats', [InvoiceSequenceBlockController::class, 'stats'])
            ->name('sequence-blocks.stats');
        
        // Invoices
        Route::resource('invoices', InvoiceController::class)->names('invoices');
        
        // SRI Logs
        Route::get('sri-logs', [SriLogController::class, 'index'])->name('sri-logs.index');
        Route::get('sri-logs/{sriLog}', [SriLogController::class, 'show'])->name('sri-logs.show');
        Route::get('sri-logs-stats', [SriLogController::class, 'stats'])->name('sri-logs.stats');
        
        // Sync
        Route::prefix('sync')->name('sync.')->group(function () {
            Route::post('/validate', [SyncController::class, 'validateBatch'])->name('validate');
            Route::post('/invoices', [SyncController::class, 'syncInvoices'])->name('invoices');
        });

        Route::prefix('settings')->name('settings.')->group(function () {
            Route::redirect('settings', '/profile');
            Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
            Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
            Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
            Route::get('/password', [PasswordController::class, 'edit'])->name('user-password.edit');
    
            Route::put('/password', [PasswordController::class, 'update'])
                ->middleware('throttle:6,1')
                ->name('user-password.update');
    
            Route::get('/appearance', function () {
                return Inertia::render('settings/appearance');
            })->name('appearance.edit');
    
            Route::get('/two-factor', [TwoFactorAuthenticationController::class, 'show'])
                ->name('two-factor.show');
        });
       
    });
});