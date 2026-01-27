<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\{Plan, User, Tenant};
use Laravel\Fortify\Features;
use Inertia\Inertia;

class WelcomeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        return Inertia::render('welcome', [
            'canRegister' => Features::enabled(Features::registration()),
            'plans' => Plan::where('active', true)->get()
        ]);    
    }
}
