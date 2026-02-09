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
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);
    
        $user = \App\Models\User::where('email', $validated['email'])->firstOrFail();
        $user->update(['password' => Hash::make($validated['password'])]);
    
        Auth::login($user);
    
        return redirect()->route('tenant.dashboard', ['tenant' => tenant('slug')]);
    }

}
