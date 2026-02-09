<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\OnboardingController;
use App\Http\Controllers\PlanController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\WelcomeController;
use App\Http\Controllers\AuthDiscoveryController;

Route::get('/', WelcomeController::class)->name('home');

Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/plans', [OnboardingController::class, 'selectPlan'])->name('plans');
    Route::get('/register', [OnboardingController::class, 'register'])->name('register');
    Route::post('/signup', [OnboardingController::class, 'provision'])->name('signup');
    Route::get('/signup', [OnboardingController::class, 'provisionShow'])->name('signup.show');
});

Route::prefix('sign-in')->name('auth.')->group(function () {
    Route::get('/', [AuthDiscoveryController::class, 'show'])->name('sign-in.show');
    Route::post('/discover', [AuthDiscoveryController::class, 'discover'])->name('sign-in.discover');
});

Route::middleware(['auth', 'verified', 'no.tenant'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
    
    // Plans Management (Central)
    Route::resource('plans', PlanController::class);
    Route::post('plans/{plan}/toggle', [PlanController::class, 'toggle'])->name('plans.toggle');
    
    // Subscriptions Management (Central)
    Route::resource('subscriptions', SubscriptionController::class);
    Route::post('subscriptions/{subscription}/activate', [SubscriptionController::class, 'activate'])
        ->name('subscriptions.activate');
    Route::post('subscriptions/{subscription}/suspend', [SubscriptionController::class, 'suspend'])
        ->name('subscriptions.suspend');
    Route::post('subscriptions/{subscription}/cancel', [SubscriptionController::class, 'cancel'])
        ->name('subscriptions.cancel');
    Route::post('subscriptions/{subscription}/renew', [SubscriptionController::class, 'renew'])
        ->name('subscriptions.renew');
    Route::post('subscriptions/{subscription}/change-plan', [SubscriptionController::class, 'changePlan'])
        ->name('subscriptions.change-plan');
}); 

require __DIR__.'/settings.php';
