<?php

namespace App\Http\Controllers\Tenant\Signup;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Hash, Auth};
use Inertia\Inertia;

class RegisterController extends Controller
{
    public function show(Request $request)
    {
        abort_if(! tenant(), 404);

        return Inertia::render('tenant/register', [
            'email' => (string) $request->query('email'),
            'tenant' => tenant('slug'),
        ]);
    }

    public function store(Request $request)
{
    $tenant = tenant();
    abort_if(!$tenant, 404);

    try {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);
    } catch (\Illuminate\Validation\ValidationException $e) {
        // Retorna errores a Inertia
        return back()->withErrors($e->errors())->withInput();
    }

    tenancy()->initialize($tenant);

    $user = \App\Models\User::where('email', $validated['email'])->firstOrFail();

    $user->update([
        'password' => Hash::make($validated['password']),
    ]);

    Auth::login($user);

    return redirect()->route('tenant.dashboard', [
        'tenant' => tenant('slug'),
    ]);
}

}
