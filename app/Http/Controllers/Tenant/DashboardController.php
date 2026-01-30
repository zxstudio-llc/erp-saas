<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\{Plan, User, Tenant};
use Laravel\Fortify\Features;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request)
    {
        return Inertia::render('tenant/dashboard', [
            'auth' => [
                'user' => auth()->user(),
            ],
        ]);   
    }
}
