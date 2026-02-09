<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AuthDiscoveryController extends Controller
{
    public function show()
    {
        return Inertia::render('auth/sign-in-discover', [
            'tenant' => session('tenant') 
        ]);
    }

    public function discover(Request $request)
    {
        $validated = $request->validate([
            'dni' => 'required|string',
        ]);

        $tenant = Tenant::query()
            ->where('dni', $validated['dni'])
            ->first();

        if (! $tenant) {
            return back()->withErrors([
                'dni' => 'No se encontró ninguna empresa con este DNI',
            ]);
        }

        return redirect()->route('auth.sign-in.show')->with('tenant', [
            'slug' => $tenant->slug,
            'name' => $tenant->data['company_name'] ?? $tenant->slug,
        ]);
    }
}