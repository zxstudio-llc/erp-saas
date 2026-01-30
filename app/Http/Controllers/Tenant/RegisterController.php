<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Auth};
use Inertia\Inertia;
use Stancl\Tenancy\Facades\Tenancy;
use Laravel\Sanctum\PersonalAccessToken;

class RegisterController extends Controller
{
    public function show(Request $request)
{
    abort_if(!Auth::check(), 403);

    return Inertia::render('tenant/register');
}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = Auth::user();
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        $user->tokens()->delete();

        return redirect()->route('tenant.dashboard', [
            'tenant' => tenant('slug'),
        ]);
    }
}
