<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\OnboardingController;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
})->name('home');

Route::prefix('onboarding')->name('onboarding.')->group(function () {
    Route::get('/plans', [OnboardingController::class, 'selectPlan'])->name('plans');
    Route::get('/register', [OnboardingController::class, 'register'])->name('register');
    Route::post('/provision', [OnboardingController::class, 'provision'])->name('provision');
});

Route::get('dashboard', function () {
    return Inertia::render('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__.'/settings.php';
